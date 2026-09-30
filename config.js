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
  //  novos      = primeiros contatos (as 4 variantes do teste A/B)
  //  followups  = mensagem de reforço para quem não respondeu em 24h
  //  Dias que não aparecem aqui = nada é enviado (mas as respostas
  //  continuam sendo registradas e avisadas).
  // ------------------------------------------------------------------
  AGENDA: {
    '2026-10-01': { janelas: [['09:00', '12:00'], ['14:00', '19:30']], novos: 170, followups: 0  }, // qui (início)
    '2026-10-02': { janelas: [['09:00', '12:00'], ['14:00', '19:30']], novos: 170, followups: 80 }, // sex
    '2026-10-03': { janelas: [['09:30', '12:30'], ['15:00', '18:00']], novos: 120, followups: 80 }, // sáb
    '2026-10-04': { janelas: [['10:00', '12:30']],                 novos: 70,  followups: 30 }, // dom (eleição – manhã mais curta)
  },

  // Intervalo aleatório entre uma mensagem e outra (segundos)
  INTERVALO_MIN_S: 45,
  INTERVALO_MAX_S: 120,

  // Horas sem resposta até mandar o follow-up
  HORAS_ATE_FOLLOWUP: 24,

  // Segurança
  PAUSAR_APOS_ERROS_SEGUIDOS: 5,     // pausa 30 min se der X erros de envio seguidos
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
