# Disparo Avenida Central – Casa Mar (João Corrêa)

Campanha nova, separada do **Acelera Investidor** (arquivos na raiz deste repositório).
Aqui não tem histórico: o `estado.json` nasce vazio nesta pasta.

**Oferta:** apartamentos com parcelas a partir de R$ 2.500,00, na Avenida Central de Atlântida.
**Lista:** 478 contatos, tirados de `../../Exportação_leads - 20261008_170620.xlsx` (todos de João Corrêa / Casa Mar).
**Foto:** `arte-av-central.jpg` sai **junto com a primeira mensagem** (as 4 variantes têm `imagem: true`).

## Agenda

| Dia | Janela | Novos | Follow-ups |
|---|---|---|---|
| Qui 08/10 (hoje) | 18:00 – 20:00 | até 50 | 0 |
| Sex 09/10 (amanhã) | 08:00 – 12:00 · 13:00 – 18:00 · 18:00 – 20:00 | até 100 (50 + 50) | até 50 |

- Ritmo: **3 a 5 minutos** entre mensagens (`INTERVALO_MIN_S` / `INTERVALO_MAX_S`).
- Hoje a janela tem 2h, então caem por volta de **30 contatos** — o `⚠️` do `plano` é esperado.
- Amanhã saem 50 até o almoço e mais 50 à tarde.
- Os **follow-ups de 24h** das mensagens de hoje só ficam elegíveis a partir das 18h de amanhã, por isso a terceira janela de 18h–20h.
- Fora dessas datas o script **não envia nada**, mas continua registrando e avisando respostas.

### Para continuar depois (lista tem 478, cobrimos 150)

Copie uma linha nova em `config.js` → `AGENDA`, por exemplo sábado e segunda:

```js
'2026-10-10': { janelas: [['09:00', '13:00'], ['14:00', '18:00']], novos: 100, followups: 100 },
```

Sem essa linha, os contatos de amanhã **não recebem** o follow-up de 24h (ele só sai em 10/10).

## Como rodar

```
node disparo.js plano      # agenda e se ela cobre a lista
node disparo.js status     # andamento
node disparo.js relatorio  # relatório A/B (relatorio.md e relatorio.csv)
node disparo.js teste 5551SEUNUMERO   # recebe as 4 variantes + follow-up
```

Pausar: `echo x > PAUSAR` (na pasta) · Voltar: apague o arquivo.

## Deploy no Easypanel (este serviço)

Mesmo repositório do Acelera Investidor, outro **Build Path**:

1. **+ Service → App**, nome: `disparo-central`.
2. **Source:** GitHub → `luiznunees/disparo-casamar` → branch `main`.
3. **Build Path: `disparo_central`** ← é isto que separa os dois serviços. O Docker build usa essa pasta como contexto, então os `COPY` do `Dockerfile` funcionam como estão.
4. **Build:** Dockerfile (ele é detectado sozinho porque existe `disparo_central/Dockerfile`).
5. **Environment:**
   ```
   EVOLUTION_API_URL=https://zapbroker-evolution-api.mnfvp3.easypanel.host
   EVOLUTION_API_KEY=429683C4C977415CAAFCCE10F7D57E11
   EVOLUTION_INSTANCE=disparocasamar
   AVISAR_NUMEROS=5551980985330
   AVISAR_GRUPOS=120363429524605097@g.us
   ```
   (O mesmo conteúdo do `.env`, que **não** vai para o Git.)
6. **Mounts → Volume:** nome `dados`, caminho `/app/dados`. **Não pule**: sem ele, um deploy novo apaga o andamento e todo mundo recebe a mensagem de novo.
7. **Deploy.** Não precisa de domínio nem de porta.

Depois do deploy, na aba **Console**:

```
node disparo.js plano
node disparo.js status
node disparo.js teste 555192213443
```

O script já nasce ligado 24h e **só envia dentro das janelas** — ou seja, ele sozinho começa hoje às 18h e amanhã às 8h. Nada mais a fazer.

Para mudar horários, limites ou textos: edite `config.js`, dê push e clique em **Deploy** de novo.

## Ordem de envio

1. Quem é **Carteira** (cliente já conhecido) primeiro, depois WhatsApp, Instagram, Google Ads e por último lead próprio.
2. Dentro disso, o script alterna entre as variantes **A, B, C e D** para o teste ficar equilibrado.

## Quem recebe as respostas

As respostas (e os alertas de parada automática) são enviadas para:

| Destino | Valor | Variável |
|---|---|---|
| Grupo **RESPOSTAS LEADS / DISPARO** | `120363429524605097@g.us` | `AVISAR_GRUPOS` |
| Número individual | `5551980985330` | `AVISAR_NUMEROS` |

Ambos ficam no `.env`. Para avisar **só o grupo**, deixe `AVISAR_NUMEROS=` vazio.

O aviso traz: nome, condomínio (origem), variante, o que o lead escreveu e o link `wa.me` da conversa.
O roteiro de resposta está em `SEQUENCIA.md`.
