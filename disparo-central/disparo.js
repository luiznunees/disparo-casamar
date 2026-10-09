#!/usr/bin/env node
// Disparo Casa Mar – campanha Avenida Central. Envia as variantes do teste A/B via Evolution API,
// respeitando janelas de horário e limites diários, registra respostas e avisa o time.
//
// Uso:
//   node disparo.js              roda (deixar ligado 24h – envia só dentro das janelas)
//   node disparo.js plano        mostra a agenda e quantos contatos cabem em cada dia
//   node disparo.js teste 5551…  manda as 4 variantes + follow-up para um número de teste
//   node disparo.js status       resumo rápido do andamento
//   node disparo.js relatorio    relatório do teste A/B (gera relatorio.csv e relatorio.md)
//
// Pausar na hora: crie um arquivo chamado PAUSAR nesta pasta. Apague para continuar.

const fs = require('fs');
const path = require('path');
const http = require('http');

const DIR = __dirname;
const CFG = require('./config');
loadEnv(path.join(DIR, '.env'));

const EVO_URL = (process.env.EVOLUTION_API_URL || '').replace(/\/+$/, '');
const EVO_KEY = process.env.EVOLUTION_API_KEY || '';
const INSTANCIA = process.env.EVOLUTION_INSTANCE || '';
const AVISAR = (process.env.AVISAR_NUMEROS || '').split(',').map(s => s.replace(/\D/g, '')).filter(Boolean);
// Grupos do WhatsApp que também recebem os avisos (JID, ex.: 120363...@g.us)
const AVISAR_GRUPOS = (process.env.AVISAR_GRUPOS || '').split(',').map(s => s.trim()).filter(Boolean);
const WEBHOOK_PORTA = Number(process.env.WEBHOOK_PORTA || 0);
// Pasta dos dados que mudam (estado, log, relatório, PAUSAR). No Easypanel aponte para um volume.
const DADOS = path.resolve(DIR, process.env.DADOS_DIR || '.');
fs.mkdirSync(DADOS, { recursive: true });
const ARQ_ESTADO = path.join(DADOS, 'estado.json');
const ARQ_LOG = path.join(DADOS, 'disparo.log');
const TICK_MS = Number(process.env.TICK_MS || 15000);

// ---------------------------------------------------------------- utilidades
function loadEnv(f) {
  if (!fs.existsSync(f)) return;
  for (const l of fs.readFileSync(f, 'utf8').split(/\r?\n/)) {
    const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
function agoraLocal(d = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: CFG.FUSO, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(d).map(x => [x.type, x.value]));
  return { dia: `${p.year}-${p.month}-${p.day}`, hora: `${p.hour}:${p.minute}` };
}
function log(...a) {
  const { dia, hora } = agoraLocal();
  const linha = `[${dia} ${hora}] ${a.join(' ')}`;
  console.log(linha);
  fs.appendFileSync(ARQ_LOG, linha + '\n');
}
const dormir = ms => new Promise(r => setTimeout(r, ms));
const aleatorio = (a, b) => a + Math.random() * (b - a);

function lerCSV(f) {
  const txt = fs.readFileSync(path.resolve(DIR, f), 'utf8').replace(/^﻿/, '');
  const linhas = [];
  let campo = '', linha = [], aspas = false;
  for (let i = 0; i < txt.length; i++) {
    const c = txt[i];
    if (aspas) {
      if (c === '"' && txt[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') aspas = false;
      else campo += c;
    } else if (c === '"') aspas = true;
    else if (c === ';') { linha.push(campo); campo = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && txt[i + 1] === '\n') i++;
      linha.push(campo); linhas.push(linha); linha = []; campo = '';
    } else campo += c;
  }
  if (campo || linha.length) { linha.push(campo); linhas.push(linha); }
  const [cab, ...resto] = linhas.filter(l => l.some(Boolean));
  return resto.map(l => Object.fromEntries(cab.map((k, i) => [k, l[i] ?? ''])));
}

// ---------------------------------------------------------------- estado
function carregarEstado() {
  let e = fs.existsSync(ARQ_ESTADO) ? JSON.parse(fs.readFileSync(ARQ_ESTADO, 'utf8')) : null;
  if (!e) e = { contatos: {}, porDia: {}, ultimaVerificacao: Math.floor(Date.now() / 1000) - 3600 };
  // junta a lista (novos contatos entram como pendentes; quem já está no estado não muda)
  for (const c of lerCSV(CFG.ARQUIVO_CONTATOS)) {
    if (!c.whatsapp || e.contatos[c.whatsapp]) continue;
    e.contatos[c.whatsapp] = {
      numero: c.whatsapp, nome: c.nome, primeiroNome: c.primeiro_nome, tipo: c.tipo,
      condominio: c.condominios.split(' + ')[0], variante: c.variante, status: 'pendente',
    };
  }
  // quem já recebeu mensagem antes (mesmo que o estado tenha se perdido) nunca entra na fila
  const arqJa = CFG.ARQUIVO_JA_CONTATADOS && path.resolve(DIR, CFG.ARQUIVO_JA_CONTATADOS);
  if (arqJa && fs.existsSync(arqJa)) {
    for (const l of fs.readFileSync(arqJa, 'utf8').split(/\r?\n/)) {
      const n = l.split('#')[0].replace(/\D/g, '');
      const c = n && e.contatos[n];
      if (c && c.status === 'pendente') c.status = 'contatado_antes';
    }
  }
  return e;
}
function salvarEstado(e) {
  const tmp = ARQ_ESTADO + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(e, null, 1));
  fs.renameSync(tmp, ARQ_ESTADO);
}
function contadorDia(e, dia) { return (e.porDia[dia] ||= { novos: 0, followups: 0 }); }

// Próximo contato.
// Com VARIANTE_ENVIO definida: segue a prioridade (tipo, condomínio) do config.
// Sem ela (teste A/B): sempre da variante com menos envios, para o teste ficar equilibrado.
function proximoNovo(e) {
  const cs = Object.values(e.contatos);
  const rank = (lista, v) => { const i = (lista || []).indexOf(v); return i < 0 ? 99 : i; };
  const porPrioridade = arr => arr.sort((a, b) =>
    rank(CFG.PRIORIDADE_TIPO, a.tipo) - rank(CFG.PRIORIDADE_TIPO, b.tipo) ||
    rank(CFG.PRIORIDADE_CONDOMINIO, a.condominio) - rank(CFG.PRIORIDADE_CONDOMINIO, b.condominio) ||
    hash(a.numero) - hash(b.numero));
  if (CFG.VARIANTE_ENVIO) return porPrioridade(cs.filter(c => c.status === 'pendente'))[0] || null;
  const enviados = {}, pend = {};
  for (const c of cs) {
    if (c.status === 'pendente') (pend[c.variante] ||= []).push(c);
    else if (c.enviadoEm) enviados[c.variante] = (enviados[c.variante] || 0) + 1;
  }
  const v = Object.keys(pend).sort((a, b) => (enviados[a] || 0) - (enviados[b] || 0) || a.localeCompare(b))[0];
  return v ? porPrioridade(pend[v])[0] : null;
}
function hash(s) { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; }

// ---------------------------------------------------------------- mensagens
// "Bom dia" até 12h, "Boa tarde" até 18h, "Boa noite" depois (no fuso do config)
function saudacao(d = new Date()) {
  const h = Number(new Intl.DateTimeFormat('en-GB', { timeZone: CFG.FUSO, hour: '2-digit', hourCycle: 'h23' }).format(d));
  return h >= 5 && h < 12 ? 'Bom dia' : h >= 12 && h < 18 ? 'Boa tarde' : 'Boa noite';
}
function montar(modelo, c) {
  const s = saudacao();
  return modelo
    .replace(/\{saudacao\}/g, s)
    .replace(/\{saudacao_min\}/g, s.toLowerCase())
    .replace(/\{nome\}/g, c.primeiroNome || '')
    .replace(/\{condominio\}/g, CFG.NOME_CONDOMINIO[c.condominio] || c.condominio)
    .replace(/\{remetente\}/g, CFG.REMETENTE);
}
function textoPara(c, modelos) {
  const pj = c.tipo === 'PJ' || !c.primeiroNome;
  return montar(pj ? modelos.pj : modelos.pf, c);
}

// ---------------------------------------------------------------- Evolution API
async function evo(metodo, rota, corpo) {
  const r = await fetch(`${EVO_URL}${rota}`, {
    method: metodo,
    headers: { apikey: EVO_KEY, 'Content-Type': 'application/json' },
    body: corpo ? JSON.stringify(corpo) : undefined,
    signal: AbortSignal.timeout(45000),
  });
  const txt = await r.text();
  let json; try { json = JSON.parse(txt); } catch { json = txt; }
  if (!r.ok) throw new Error(`${r.status} ${typeof json === 'string' ? json : JSON.stringify(json).slice(0, 300)}`);
  return json;
}
const estadoConexao = async () => (await evo('GET', `/instance/connectionState/${INSTANCIA}`)).instance?.state;
async function verificarNumero(numero) {
  const r = await evo('POST', `/chat/whatsappNumbers/${INSTANCIA}`, { numbers: [numero] });
  const x = Array.isArray(r) ? r[0] : null;
  return x ? { existe: !!x.exists, jid: x.jid } : { existe: true, jid: null };
}
async function jaConversou(jid) {
  const r = await evo('POST', `/chat/findMessages/${INSTANCIA}`, { where: { key: { remoteJid: jid } }, page: 1, offset: 20 });
  return (r?.messages?.records || []).some(m => m.key?.remoteJid === jid);
}
const enviarTexto = (numero, text) => evo('POST', `/message/sendText/${INSTANCIA}`, { number: numero, text });
let arteB64;
function enviarImagem(numero, caption) {
  arteB64 ||= fs.readFileSync(path.resolve(DIR, CFG.ARTE)).toString('base64');
  return evo('POST', `/message/sendMedia/${INSTANCIA}`, {
    number: numero, mediatype: 'image', mimetype: 'image/jpeg', caption, media: arteB64, fileName: 'acelera-investidor.jpg',
  });
}
async function avisarTime(texto) {
  // grupos primeiro: se o número individual falhar, o grupo ainda recebe
  for (const n of [...AVISAR_GRUPOS, ...AVISAR]) { try { await enviarTexto(n, texto); } catch (err) { log('⚠️ não consegui avisar', n, err.message); } }
}

// ---------------------------------------------------------------- respostas
function textoDaMensagem(m) {
  const msg = m.message || {};
  return msg.conversation || msg.extendedTextMessage?.text || msg.imageMessage?.caption ||
    msg.videoMessage?.caption || msg.buttonsResponseMessage?.selectedDisplayText ||
    (msg.audioMessage ? '[áudio]' : msg.stickerMessage ? '[figurinha]' : msg.imageMessage ? '[imagem]' :
     msg.reactionMessage ? `[reação ${msg.reactionMessage.text || ''}]` : '[mensagem]');
}
function indiceContatos(e) {
  // WhatsApp pode identificar o número com ou sem o 9 extra, ou por LID – indexa todas as formas
  const idx = new Map();
  for (const c of Object.values(e.contatos)) {
    const formas = [c.numero, c.jid?.split('@')[0]];
    if (/^55\d{2}9\d{8}$/.test(c.numero)) formas.push(c.numero.slice(0, 4) + c.numero.slice(5));
    for (const f of formas) if (f) idx.set(f, c);
  }
  return idx;
}
async function registrarResposta(e, idx, m) {
  const k = m.key || {};
  if (k.fromMe) return;
  const jids = [k.remoteJid, k.remoteJidAlt, k.senderPn, k.participant, m.senderPn].filter(Boolean);
  const c = jids.map(j => idx.get(String(j).split('@')[0].split(':')[0])).find(Boolean);
  if (!c || !['enviado', 'respondeu'].includes(c.status)) return;
  const texto = textoDaMensagem(m);
  const ts = Number(m.messageTimestamp) || Math.floor(Date.now() / 1000);
  if (!c.enviadoEm || ts * 1000 < c.enviadoEm) return;
  (c.mensagens ||= []);
  if (c.mensagens.some(x => x.id === k.id)) return;
  c.mensagens.push({ id: k.id, ts, texto: texto.slice(0, 500) });
  if (c.status === 'respondeu') { salvarEstado(e); return; }

  // "Sim, mas não agora" não é opt-out; "não tenho interesse" é
  const optout = CFG.OPT_OUT.test(texto) && !/^\s*(sim|quero|pode|claro|tenho interesse)\b/i.test(texto);
  c.status = optout ? 'optout' : 'respondeu';
  c.respondeuEm = ts * 1000;
  c.primeiraResposta = texto.slice(0, 500);
  c.respondeuAoFollowup = c.followupEm > 0;
  salvarEstado(e);
  log(optout ? '🚫 OPT-OUT' : '💬 RESPOSTA', c.numero, c.nome, `(var ${c.variante})`, JSON.stringify(texto.slice(0, 120)));
  await avisarTime(
    `${optout ? '🚫 *Pediu para não receber mais*' : `🔔 *Lead respondeu – ${CFG.CAMPANHA || 'Casa Mar'}*`}\n\n` +
    `*${c.nome}* · ${c.condominio}\nVariante ${c.variante}${c.respondeuAoFollowup ? ' (respondeu ao follow-up)' : ''}\n\n` +
    `"${texto.slice(0, 300)}"\n\nwa.me/${c.numero}`
  );
}
async function buscarRespostas(e) {
  const idx = indiceContatos(e);
  const desde = e.ultimaVerificacao - 300; // margem de 5 min
  let maisNova = e.ultimaVerificacao;
  for (let pagina = 1; pagina <= 10; pagina++) {
    const r = await evo('POST', `/chat/findMessages/${INSTANCIA}`, { where: { key: { fromMe: false } }, page: pagina, offset: 100 });
    const recs = r?.messages?.records || r?.records || (Array.isArray(r) ? r : []);
    if (!recs.length) break;
    let velhas = 0;
    for (const m of recs) {
      const ts = Number(m.messageTimestamp) || 0;
      if (ts < desde) { velhas++; continue; }
      maisNova = Math.max(maisNova, ts);
      await registrarResposta(e, idx, m);
    }
    if (velhas === recs.length || recs.length < 100) break;
  }
  e.ultimaVerificacao = Math.max(maisNova, Math.floor(Date.now() / 1000) - 60);
  salvarEstado(e);
}

// ---------------------------------------------------------------- agenda
function janelaAberta(d = new Date()) {
  const { dia, hora } = agoraLocal(d);
  const ag = CFG.AGENDA[dia];
  if (!ag) return null;
  return ag.janelas.some(([a, b]) => hora >= a && hora < b) ? { dia, ag } : null;
}
function proximoFollowup(e) {
  const limite = Date.now() - CFG.HORAS_ATE_FOLLOWUP * 3600e3;
  return Object.values(e.contatos)
    .filter(c => c.status === 'enviado' && !c.followupEm && c.enviadoEm <= limite)
    .sort((a, b) => a.enviadoEm - b.enviadoEm)[0];
}

async function enviarPrimeiro(e, c) {
  if (CFG.VARIANTE_ENVIO) c.variante = CFG.VARIANTE_ENVIO;
  const v = CFG.VARIANTES[c.variante];
  const chk = await verificarNumero(c.numero);
  if (!chk.existe) { c.status = 'sem_whatsapp'; salvarEstado(e); log('∅ sem WhatsApp', c.numero, c.nome); return false; }
  c.jid = chk.jid || c.jid;
  // trava contra duplicidade: se já existe conversa com esse número no WhatsApp, não envia
  if (c.jid && await jaConversou(c.jid)) {
    c.status = 'contatado_antes'; salvarEstado(e); log('↷ já conversou antes, pulando', c.numero, c.nome); return false;
  }
  const texto = textoPara(c, v);
  if (v.imagem) await enviarImagem(c.numero, texto); else await enviarTexto(c.numero, texto);
  c.status = 'enviado'; c.enviadoEm = Date.now();
  log(`✅ var ${c.variante} →`, c.numero, c.nome, `(${c.condominio})`);
  return true;
}
async function enviarFollowup(e, c) {
  await enviarTexto(c.numero, textoPara(c, CFG.FOLLOWUP));
  c.followupEm = Date.now();
  log('↩️ follow-up →', c.numero, c.nome);
}

async function loop() {
  if (!EVO_URL || !EVO_KEY || !INSTANCIA) { console.error('Preencha o .env (veja .env.example).'); process.exit(1); }
  const e = carregarEstado(); salvarEstado(e);
  log(`▶️ iniciado · ${Object.keys(e.contatos).length} contatos · instância ${INSTANCIA}`);
  if (WEBHOOK_PORTA) iniciarWebhook(e);

  let proximoEnvio = 0, proximaVerificacao = 0, errosSeguidos = 0, pausadoAte = 0, avisouDesconexao = false;
  for (;;) {
    try {
      if (Date.now() >= proximaVerificacao) {
        proximaVerificacao = Date.now() + CFG.VERIFICAR_RESPOSTAS_A_CADA_S * 1000;
        await buscarRespostas(e).catch(err => log('⚠️ erro ao buscar respostas:', err.message));
      }
      const j = janelaAberta();
      if (j && Date.now() >= proximoEnvio && Date.now() >= pausadoAte && !fs.existsSync(path.join(DADOS, 'PAUSAR'))) {
        const estado = await estadoConexao().catch(() => 'erro');
        if (estado !== 'open') {
          if (!avisouDesconexao) log(`⛔ WhatsApp desconectado (estado: ${estado}). Envios parados até reconectar.`);
          avisouDesconexao = true; proximoEnvio = Date.now() + 60e3;
        } else {
          if (avisouDesconexao) { log('🔌 reconectado'); avisouDesconexao = false; }
          const cont = contadorDia(e, j.dia);
          const fu = cont.followups < j.ag.followups ? proximoFollowup(e) : null;
          const novo = cont.novos < j.ag.novos ? proximoNovo(e) : null;
          // alterna: follow-up tem prioridade a cada 3 envios para não atrasar os de ontem
          const alvo = fu && (!novo || (cont.novos + cont.followups) % 3 === 2) ? ['fu', fu] : novo ? ['novo', novo] : fu ? ['fu', fu] : null;
          if (alvo) {
            try {
              let enviou = true;
              if (alvo[0] === 'novo') { enviou = await enviarPrimeiro(e, alvo[1]); if (enviou) cont.novos++; }
              else { await enviarFollowup(e, alvo[1]); cont.followups++; }
              salvarEstado(e); errosSeguidos = 0;
              proximoEnvio = Date.now() + (enviou ? aleatorio(CFG.INTERVALO_MIN_S, CFG.INTERVALO_MAX_S) * 1000 : 5000);
            } catch (err) {
              errosSeguidos++;
              const c = alvo[1]; c.erros = (c.erros || 0) + 1; c.ultimoErro = err.message;
              if (c.erros >= 3 && alvo[0] === 'novo') c.status = 'erro';
              if (c.erros >= 3 && alvo[0] === 'fu') c.followupEm = -1;
              salvarEstado(e);
              log('❌ erro ao enviar para', c.numero, '-', err.message);
              proximoEnvio = Date.now() + 30e3;
              if (errosSeguidos >= CFG.PARAR_APOS_ERROS_SEGUIDOS) {
                // erros seguidos costumam ser restrição do WhatsApp: insistir só piora. Para tudo.
                fs.writeFileSync(path.join(DADOS, 'PAUSAR'), `parado em ${new Date().toISOString()}: ${err.message}\n`);
                errosSeguidos = 0;
                log(`⛔ ${CFG.PARAR_APOS_ERROS_SEGUIDOS} erros seguidos – DISPARO PARADO (arquivo PAUSAR criado). Último erro: ${err.message}`);
                await avisarTime(`⛔ *Disparo parado automaticamente*\n\n${CFG.PARAR_APOS_ERROS_SEGUIDOS} erros seguidos ao enviar (possível restrição).\nÚltimo erro: ${err.message.slice(0, 200)}\n\nPara voltar: apagar o arquivo PAUSAR.`);
              }
            }
          }
        }
      }
    } catch (err) { log('⚠️ erro inesperado:', err.message); }
    await dormir(TICK_MS);
  }
}

// Webhook opcional (se a Evolution conseguir alcançar este servidor): respostas chegam na hora
function iniciarWebhook(e) {
  http.createServer((req, res) => {
    let corpo = '';
    req.on('data', d => { corpo += d; if (corpo.length > 5e6) req.destroy(); });
    req.on('end', async () => {
      res.end('ok');
      try {
        const j = JSON.parse(corpo);
        if (!/messages[._]upsert/i.test(j.event || '')) return;
        const lista = Array.isArray(j.data) ? j.data : [j.data];
        const idx = indiceContatos(e);
        for (const m of lista) await registrarResposta(e, idx, m);
      } catch { /* ignora payloads que não interessam */ }
    });
  }).listen(WEBHOOK_PORTA, () => log(`🌐 webhook ouvindo na porta ${WEBHOOK_PORTA}`));
}

// ---------------------------------------------------------------- comandos auxiliares
function plano() {
  const total = Object.values(carregarEstado().contatos).filter(c => c.status === 'pendente').length;
  let acum = 0;
  console.log(`\nContatos na lista: ${total}\n`);
  console.log('Dia          Janelas                      Novos  Follow-ups  Acumulado');
  for (const [dia, ag] of Object.entries(CFG.AGENDA)) {
    acum += ag.novos;
    const minutos = ag.janelas.reduce((s, [a, b]) => s + (toMin(b) - toMin(a)), 0);
    const cabem = Math.floor(minutos * 60 / ((CFG.INTERVALO_MIN_S + CFG.INTERVALO_MAX_S) / 2));
    const alerta = ag.novos + ag.followups > cabem ? `  ⚠️ só cabem ~${cabem} envios nesse horário` : '';
    console.log(`${dia}   ${ag.janelas.map(j => j.join('–')).join(', ').padEnd(28)} ${String(ag.novos).padStart(5)}  ${String(ag.followups).padStart(10)}  ${String(Math.min(acum, total)).padStart(9)}${alerta}`);
  }
  console.log(acum >= total ? `\n✔ A agenda cobre todos os ${total} contatos.\n` : `\n⚠️ A agenda só cobre ${acum} de ${total} contatos.\n`);
}
const toMin = h => { const [a, b] = h.split(':').map(Number); return a * 60 + b; };

async function teste(numero) {
  numero = numero.replace(/\D/g, '');
  const fake = { numero, primeiroNome: 'Teste', tipo: 'PF', condominio: 'Amare Home Resort' };
  for (const [letra, v] of Object.entries(CFG.VARIANTES)) {
    await enviarTexto(numero, `— Variante ${letra} —`);
    const t = textoPara(fake, v);
    if (v.imagem) await enviarImagem(numero, t); else await enviarTexto(numero, t);
    await dormir(3000);
  }
  await enviarTexto(numero, '— Follow-up —');
  await enviarTexto(numero, textoPara(fake, CFG.FOLLOWUP));
  console.log('Mensagens de teste enviadas para', numero);
}

function status() {
  const e = carregarEstado();
  const cs = Object.values(e.contatos);
  const por = s => cs.filter(c => c.status === s).length;
  console.log(`\nContatos: ${cs.length}`);
  for (const s of ['pendente', 'enviado', 'respondeu', 'optout', 'contatado_antes', 'sem_whatsapp', 'erro']) console.log(`  ${s.padEnd(13)} ${por(s)}`);
  console.log(`  follow-ups enviados ${cs.filter(c => c.followupEm > 0).length}`);
  console.log('\nPor dia:', JSON.stringify(e.porDia));
  console.log(fs.existsSync(path.join(DADOS, 'PAUSAR')) ? '\n⏸️ PAUSADO (arquivo PAUSAR existe)\n' : '');
}

function relatorio() {
  const e = carregarEstado();
  const cs = Object.values(e.contatos);
  const linhas = [];
  const pct = (a, b) => b ? (100 * a / b).toFixed(1) + '%' : '–';
  linhas.push(`# Relatório do teste A/B – ${CFG.CAMPANHA || 'Casa Mar'}`, '', `Gerado em ${agoraLocal().dia} ${agoraLocal().hora}`, '');
  linhas.push('| Variante | Enviados | Responderam | % resposta | Só no 1º contato | Após follow-up | Opt-out | Sem WhatsApp | Tempo médio até responder |');
  linhas.push('|---|---|---|---|---|---|---|---|---|');
  const nomes = { A: 'A – Confirmação', B: 'B – Novidade', C: 'C – Interesse', D: 'D – Foto direta' };
  for (const v of ['A', 'B', 'C', 'D']) {
    const g = cs.filter(c => c.variante === v);
    const env = g.filter(c => c.enviadoEm);
    const resp = g.filter(c => c.status === 'respondeu');
    const opt = g.filter(c => c.status === 'optout');
    const primeiro = resp.filter(c => !c.respondeuAoFollowup);
    const tempos = [...resp, ...opt].filter(c => !c.respondeuAoFollowup).map(c => (c.respondeuEm - c.enviadoEm) / 60e3);
    const media = tempos.length ? Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length) + ' min' : '–';
    linhas.push(`| ${nomes[v]} | ${env.length} | ${resp.length} | ${pct(resp.length, env.length)} | ${pct(primeiro.length, env.length)} | ${resp.length - primeiro.length} | ${opt.length} | ${g.filter(c => c.status === 'sem_whatsapp').length} | ${media} |`);
  }
  linhas.push('', '"Só no 1º contato" é a métrica principal do teste: mede a variante sem a ajuda do follow-up.',
    'Diferenças menores que ~5 pontos percentuais podem ser acaso.', '');
  fs.writeFileSync(path.join(DADOS, 'relatorio.md'), linhas.join('\n'));
  const cols = ['variante', 'condominio', 'nome', 'numero', 'status', 'enviadoEm', 'followupEm', 'respondeuEm', 'respondeuAoFollowup', 'primeiraResposta'];
  const fmt = v => typeof v === 'number' && v > 1e12 ? new Date(v).toLocaleString('pt-BR', { timeZone: CFG.FUSO }) : v ?? '';
  fs.writeFileSync(path.join(DADOS, 'relatorio.csv'), '﻿' + [cols.join(';'),
    ...cs.map(c => cols.map(k => `"${String(fmt(c[k])).replace(/"/g, '""')}"`).join(';'))].join('\r\n'));
  console.log(linhas.join('\n'));
  console.log('Arquivos:', path.join(DADOS, 'relatorio.md'), 'e relatorio.csv');
}

// ---------------------------------------------------------------- main
const [cmd, arg] = process.argv.slice(2);
if (cmd === 'plano') plano();
else if (cmd === 'status') status();
else if (cmd === 'relatorio') relatorio();
else if (cmd === 'teste') { if (!arg) { console.error('Uso: node disparo.js teste 5551999999999'); process.exit(1); } teste(arg).catch(err => { console.error(err.message); process.exit(1); }); }
else loop();
