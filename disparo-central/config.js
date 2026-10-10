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
    // sáb: retomada depois da queda de 09/10 às 9h20 (ritmo mais lento: 5 a 8 min)
    '2026-10-10': { janelas: [['09:30', '12:30'], ['14:00', '18:00']], novos: 40, followups: 25 },
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
  //  {saudacao} = Bom dia / Boa tarde / Boa noite (pelo horário do envio) · {saudacao_min} = minúscula
  VARIANTES: {
    // A – direta, com saudação do horário
    A: {
      imagem: true,
      pf: '{saudacao}, {nome}! Tudo bem?\n\nQueria te apresentar uma opção de investimento aqui em Atlântida: apartamentos na Avenida Central, com parcelas a partir de *R$ 2.500*.\n\nPosso te mostrar com mais detalhes?\n\n{remetente} · Casa Mar Imóveis',
      pj: '{saudacao}! Tudo bem?\n\nQueria apresentar uma opção de investimento aqui em Atlântida: apartamentos na Avenida Central, com parcelas a partir de *R$ 2.500*.\n\nPosso mostrar com mais detalhes?\n\n{remetente} · Casa Mar Imóveis',
    },
    // B – se apresenta primeiro e oferece conversa rápida
    B: {
      imagem: true,
      pf: '{saudacao}, {nome}, tudo bem? Aqui é o {remetente}, da Casa Mar Imóveis.\n\nTô com uma oportunidade nova em Atlântida: apartamentos na Avenida Central, com parcelas a partir de *R$ 2.500*.\n\nTe mostro numa conversa rápida, uns 15 minutinhos. Faz sentido?',
      pj: '{saudacao}, tudo bem? Aqui é o {remetente}, da Casa Mar Imóveis.\n\nTemos uma oportunidade nova em Atlântida: apartamentos na Avenida Central, com parcelas a partir de *R$ 2.500*.\n\nPosso apresentar numa conversa rápida, uns 15 minutos?',
    },
    // C – curta, oferece mandar detalhes
    C: {
      imagem: true,
      pf: 'Oi {nome}, {saudacao_min}! Separei uma opção de investimento pra te mostrar: apartamento na Avenida Central de Atlântida, com parcela a partir de *R$ 2.500*.\n\nQuer que eu te mande os detalhes?\n\n{remetente} · Casa Mar Imóveis',
      pj: 'Olá, {saudacao_min}! Separei uma opção de investimento pra vocês: apartamento na Avenida Central de Atlântida, com parcela a partir de *R$ 2.500*.\n\nPosso mandar os detalhes?\n\n{remetente} · Casa Mar Imóveis',
    },
    // D – porta de entrada para ter imóvel no litoral
    D: {
      imagem: true,
      pf: '{saudacao}, {nome}! Aqui é o {remetente}, da Casa Mar Imóveis 🙂\n\nSe você pensa em ter um imóvel no litoral, essa é uma boa porta de entrada: apartamentos na Avenida Central de Atlântida, com parcela a partir de *R$ 2.500*.\n\nQuer que eu te explique como funciona?',
      pj: '{saudacao}! Aqui é o {remetente}, da Casa Mar Imóveis 🙂\n\nPra quem pensa em investir no litoral, essa é uma boa porta de entrada: apartamentos na Avenida Central de Atlântida, com parcela a partir de *R$ 2.500*.\n\nQuerem que eu explique como funciona?',
    },
  },

  // Follow-up de 24h (só texto, sem foto) para quem não respondeu
  FOLLOWUP: {
    pf: '{saudacao}, {nome}! Conseguiu ver a opção que te mandei, dos apartamentos na Avenida Central com parcela a partir de *R$ 2.500*?\n\nSe quiser, te passo os detalhes por aqui mesmo.\n\n(Se não fizer sentido pra você, é só me avisar.)',
    pj: '{saudacao}! Conseguiram ver a opção que mandei, dos apartamentos na Avenida Central com parcela a partir de *R$ 2.500*?\n\nSe quiserem, passo os detalhes por aqui mesmo.\n\n(Se não fizer sentido, é só avisar.)',
  },
};
