// =====================================================================
//  CONFIGURAÇÃO DO DISPARO – AVENIDA CENTRAL (Casa Mar Imóveis / João Corrêa)
//  Oferta: apartamentos com parcelas a partir de R$ 2.500,00
//          na Avenida Central de Atlântida.
//  Lista:  ../../Exportação_leads - 20261008_170620.xlsx (478 contatos)
//  Depois de editar, reinicie o script.
// =====================================================================

module.exports = {
  // Nome de quem assina as mensagens
  REMETENTE: 'João Corrêa',

  // Nome da campanha nos avisos de resposta e nos relatórios
  CAMPANHA: 'Avenida Central',

  // Arquivo com os contatos (gerado da exportação de leads do CRM)
  ARQUIVO_CONTATOS: './contatos.csv',

  // Imagem que vai JUNTO com a primeira mensagem (todas as variantes)
  ARTE: './arte-av-central.jpg',

  // Fuso horário usado para janelas e limites diários
  FUSO: 'America/Sao_Paulo',

  // ------------------------------------------------------------------
  //  AGENDA: por dia, as janelas de envio e os limites.
  //  novos      = primeiros contatos (com a foto)
  //  followups  = reforço 24h depois para quem não respondeu
  //  Dias que não aparecem aqui = nada é enviado (as respostas
  //  continuam sendo registradas e avisadas).
  //
  //  Ritmo escolhido: 3 a 5 minutos entre mensagens.
  //  Máximo de 50 contatos por dia.
  // ------------------------------------------------------------------
  AGENDA: {
    '2026-10-08': { janelas: [['18:00', '20:00']], novos: 50, followups: 0 },                                  // hoje, só à noite
    '2026-10-09': {
      janelas: [['08:00', '12:00'], ['13:00', '18:00'], ['18:00', '20:00']], // manhã, tarde e follow-ups
      novos: 100,   // 50 de manhã + 50 à tarde
      followups: 50, // reforço de 24h das mensagens de hoje (só ficam prontos a partir das 18h)
    },
  },

  // null = roda o teste A/B, alternando entre as 4 variantes do contatos.csv.
  // Coloque 'A' para mandar só uma variante.
  VARIANTE_ENVIO: null,

  // Ordem de prioridade dentro de cada variante (quem é cliente primeiro)
  PRIORIDADE_TIPO: ['PF', 'PJ'],
  PRIORIDADE_CONDOMINIO: ['Carteira', 'WhatsApp', 'Instagram', 'Google Ads', 'Lead proprio', 'Lead próprio'],

  // Números que nunca recebem (já contatados em outra campanha)
  ARQUIVO_JA_CONTATADOS: './ja_contatados.txt',

  // Intervalo aleatório entre uma mensagem e outra (segundos): 3 a 5 min
  INTERVALO_MIN_S: 180,
  INTERVALO_MAX_S: 300,

  // Horas sem resposta até mandar o follow-up
  HORAS_ATE_FOLLOWUP: 24,

  // Segurança
  PARAR_APOS_ERROS_SEGUIDOS: 2,      // para TUDO (cria o arquivo PAUSAR) após X erros seguidos
  VERIFICAR_RESPOSTAS_A_CADA_S: 120, // busca respostas de 2 em 2 minutos

  // Nome do condomínio usado nas mensagens ({condominio})
  NOME_CONDOMINIO: {
    'Carteira': 'Avenida Central de Atlântida',
    'Lead proprio': 'Avenida Central de Atlântida',
    'Lead próprio': 'Avenida Central de Atlântida',
    'WhatsApp': 'Avenida Central de Atlântida',
    'Instagram': 'Avenida Central de Atlântida',
    'Google Ads': 'Avenida Central de Atlântida',
    'Av. Central Atlantida': 'Avenida Central de Atlântida',
  },

  // Palavras que indicam pedido para parar (não recebe follow-up)
  OPT_OUT: /\b(sair|parar?|pare|remov\w*|descadastr\w*|n[ãa]o\s+(tenho\s+)?interesse|n[ãa]o\s+quero|sem\s+interesse|n[ãa]o\s+me\s+(mande|chame|envie)|bloque\w*|spam|den[uú]ncia\w*)\b/i,

  // ------------------------------------------------------------------
  //  MENSAGENS – 4 VARIAÇÕES (todas com a foto junto)
  //  {nome} = primeiro nome · {condominio} · {remetente}
  //  pf = pessoa física · pj = empresa
  //  *texto* = negrito no WhatsApp
  // ------------------------------------------------------------------
  VARIANTES: {
    // A – igual à sua base, só corrigindo acentuação
    A: {
      imagem: true,
      pf: 'Olá, tudo bem? Gostaria de lhe apresentar uma variação de investimento: apartamentos com parcelas a partir de *R$ 2.500,00*, na Avenida Central de Atlântida.\n\nGostaria de agendar uma apresentação?\n\n{remetente} – Casa Mar Imóveis',
      pj: 'Olá, tudo bem? Gostaria de apresentar uma variação de investimento para vocês: apartamentos com parcelas a partir de *R$ 2.500,00*, na Avenida Central de Atlântida.\n\nGostariam de agendar uma apresentação?\n\n{remetente} – Casa Mar Imóveis',
    },
    // B – com nome + assinatura no topo
    B: {
      imagem: true,
      pf: 'Oi {nome}, tudo bem? Aqui é o {remetente}, da Casa Mar Imóveis.\n\nEstou apresentando uma nova oportunidade de investimento em Atlântida: apartamentos com parcelas a partir de *R$ 2.500,00*, na Avenida Central.\n\nPosso te agendar uma apresentação? Leva uns 15 minutos.\n\n{remetente} – Casa Mar Imóveis',
      pj: 'Olá, tudo bem? Aqui é o {remetente}, da Casa Mar Imóveis.\n\nEstamos apresentando uma nova oportunidade de investimento em Atlântida: apartamentos com parcelas a partir de *R$ 2.500,00*, na Avenida Central.\n\nPodemos agendar uma apresentação?\n\n{remetente} – Casa Mar Imóveis',
    },
    // C – curta, pergunta aberta
    C: {
      imagem: true,
      pf: 'Oi {nome}! Separei uma opção de investimento para te mostrar: apartamento na Avenida Central de Atlântida, com parcela a partir de *R$ 2.500,00*.\n\nFaz sentido eu te apresentar?\n\n{remetente} – Casa Mar Imóveis',
      pj: 'Olá! Separei uma opção de investimento para vocês: apartamento na Avenida Central de Atlântida, com parcela a partir de *R$ 2.500,00*.\n\nFaz sentido apresentarmos para vocês?\n\n{remetente} – Casa Mar Imóveis',
    },
    // D – apela para quem quer entrar no mercado barato
    D: {
      imagem: true,
      pf: 'Boa tarde, {nome}! Aqui é o {remetente}, da Casa Mar Imóveis.\n\nChegou uma oportunidade para quem quer entrar no mercado com parcela a partir de *R$ 2.500,00*: apartamentos na Avenida Central de Atlântida.\n\nQuer que eu agende uma apresentação para você?\n\n{remetente} – Casa Mar Imóveis',
      pj: 'Boa tarde! Aqui é o {remetente}, da Casa Mar Imóveis.\n\nChegou uma oportunidade para quem quer entrar no mercado com parcela a partir de *R$ 2.500,00*: apartamentos na Avenida Central de Atlântida.\n\nQuerem que eu agende uma apresentação?\n\n{remetente} – Casa Mar Imóveis',
    },
  },

  // Follow-up de 24h (só texto, sem foto) para quem não respondeu
  FOLLOWUP: {
    pf: '{nome}, tudo bem? Só passando para saber se conseguiu ver a oportunidade que te mandei: apartamentos na Avenida Central de Atlântida, com parcelas a partir de *R$ 2.500,00*.\n\nQuer que eu agende uma apresentação?\n\n{remetente} – Casa Mar Imóveis',
    pj: 'Tudo bem? Só passando para saber se conseguiram ver a oportunidade que mandei: apartamentos na Avenida Central de Atlântida, com parcelas a partir de *R$ 2.500,00*.\n\nQuerem que eu agende uma apresentação?\n\n{remetente} – Casa Mar Imóveis',
  },
};
