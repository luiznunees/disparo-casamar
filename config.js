// =====================================================================
//  CONFIGURAÇÃO DO DISPARO – ACELERA INVESTIDOR (Casa Mar Imóveis)
//  Tudo o que dá pra ajustar sem mexer no código está aqui.
//  Depois de editar, reinicie o script (pm2 restart disparo).
// =====================================================================

module.exports = {
  // Nome de quem assina as mensagens
  REMETENTE: 'João',

  // Arquivo com os contatos (gerado em ../listas)
  ARQUIVO_CONTATOS: './contatos.csv', // cópia de ../listas/LISTA_DISPARO_WHATSAPP.csv

  // Imagem da variante D
  ARTE: './arte-acelera-investidor.jpg',

  // Fuso horário usado para janelas e limites diários
  FUSO: 'America/Sao_Paulo',

  // ------------------------------------------------------------------
  //  AGENDA: por dia, as janelas de envio e os limites.
  //  novos      = primeiros contatos
  //  followups  = mensagem de reforço para quem não respondeu em 24h
  //  Dias que não aparecem aqui = nada é enviado (mas as respostas
  //  continuam sendo registradas e avisadas).
  //
  //  Lição de 01/10: 51 envios em 75 min = restrição. Agora são no
  //  máximo 45 por dia, espalhados das 8h às 18h (1 a cada ~13 min).
  // ------------------------------------------------------------------
  AGENDA: {
    '2026-10-03': { janelas: [['08:00', '18:00']], novos: 45, followups: 0 }, // sáb
    // dom 04/10 (eleição): sem envio
    '2026-10-05': { janelas: [['08:00', '18:00']], novos: 45, followups: 0 }, // seg
  },

  // Só a variante vencedora do teste A/B (A = 54% de resposta). null = usa a da planilha.
  VARIANTE_ENVIO: 'A',

  // Ordem de prioridade (quem mais respondeu no teste vai primeiro)
  PRIORIDADE_TIPO: ['PF', 'PJ'],                                   // PF 28% x PJ 17%
  PRIORIDADE_CONDOMINIO: ['Zen', 'Lótus Atlântida', 'Amare Home Resort', 'Los Cobos'], // 44%, 33%, 14%, 13%

  // Números que nunca recebem (já contatados antes)
  ARQUIVO_JA_CONTATADOS: './ja_contatados.txt',

  // Intervalo aleatório entre uma mensagem e outra (segundos): 10 a 16 min
  INTERVALO_MIN_S: 600,
  INTERVALO_MAX_S: 960,

  // Horas sem resposta até mandar o follow-up
  HORAS_ATE_FOLLOWUP: 24,

  // Segurança
  PARAR_APOS_ERROS_SEGUIDOS: 2,      // para TUDO (cria o arquivo PAUSAR) após X erros seguidos – sinal de restrição
  VERIFICAR_RESPOSTAS_A_CADA_S: 120, // de quanto em quanto tempo busca respostas

  // Nome curto do condomínio usado nas mensagens
  NOME_CONDOMINIO: {
    'Amare Home Resort': 'Amare',
    'Lótus Atlântida': 'Lótus Atlântida',
    'Los Cobos': 'Los Cobos',
    'Zen': 'Zen',
  },

  // Palavras que indicam pedido para parar (não recebe follow-up)
  OPT_OUT: /\b(sair|parar?|pare|remov\w*|descadastr\w*|n[ãa]o\s+(tenho\s+)?interesse|n[ãa]o\s+quero|sem\s+interesse|n[ãa]o\s+me\s+(mande|chame|envie)|bloque\w*|spam|den[uú]ncia\w*)\b/i,

  // ------------------------------------------------------------------
  //  MENSAGENS
  //  {nome} = primeiro nome · {condominio} = nome curto · {remetente}
  //  pf = pessoa física · pj = empresa (sem nome, para não sair "Oi, Ltda")
  //  *texto* = negrito no WhatsApp
  // ------------------------------------------------------------------
  VARIANTES: {
    A: { // Confirmação
      pf: 'Oi, tudo bem? Falo com {nome}, do {condominio}?',
      pj: 'Olá, tudo bem? Falo com o responsável pela unidade no {condominio}?',
    },
    B: { // Novidade
      pf: 'Oi {nome}, aqui é o {remetente}, da Casa Mar Imóveis. Posso te contar uma novidade para os proprietários do {condominio}?',
      pj: 'Olá, tudo bem? Aqui é o {remetente}, da Casa Mar Imóveis. Posso contar uma novidade para os proprietários do {condominio}?',
    },
    C: { // Interesse
      pf: 'Oi {nome}, aqui é o {remetente}, da Casa Mar Imóveis. Você tem interesse em investir em imóveis aqui no Litoral, ou por enquanto está tranquilo com o que já tem?',
      pj: 'Olá, tudo bem? Aqui é o {remetente}, da Casa Mar Imóveis. Vocês têm interesse em investir em imóveis aqui no Litoral, ou por enquanto estão tranquilos com o que já têm?',
    },
    D: { // Foto direta (a imagem vai com esta legenda)
      imagem: true,
      pf: 'Oi {nome}! Aqui é o {remetente}, da Casa Mar Imóveis 👋\n\nVem aí o *Acelera Investidor*: um dia em que as construtoras vão liberar unidades selecionadas com preço bem abaixo da tabela. Só na Casa Mar, e a venda é na hora.\n\nQuer receber a data e as condições em primeira mão?',
      pj: 'Olá! Aqui é o {remetente}, da Casa Mar Imóveis 👋\n\nVem aí o *Acelera Investidor*: um dia em que as construtoras vão liberar unidades selecionadas com preço bem abaixo da tabela. Só na Casa Mar, e a venda é na hora.\n\nQuerem receber a data e as condições em primeira mão?',
    },
  },

  FOLLOWUP: {
    pf: '{nome}, só confirmando: posso te incluir na lista VIP do *Acelera Investidor*? É só responder "SIM" 👍\n\n(Se não fizer sentido pra você, me avisa que eu não te chamo mais.)',
    pj: 'Só confirmando: posso incluir vocês na lista VIP do *Acelera Investidor*? É só responder "SIM" 👍\n\n(Se não fizer sentido, me avisem que eu não chamo mais.)',
  },
};
