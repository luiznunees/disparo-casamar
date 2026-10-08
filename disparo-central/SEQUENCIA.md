# Sequência de mensagens – Avenida Central

`{Nome}` = primeiro nome · Assinatura: **João Corrêa – Casa Mar Imóveis**
O script envia só a **etapa 1** e a **etapa 2**. O resto é feito por uma pessoa, o quanto antes (ideal em até 15 min).

---

## Etapa 1 – Primeiro contato (automático, com a foto)

O script escolhe uma das 4 variantes. Todas levam `arte-av-central.jpg` junto.

### A – Base (a sua)
> Olá, tudo bem? Gostaria de lhe apresentar uma variação de investimento: apartamentos com parcelas a partir de **R$ 2.500,00**, na Avenida Central de Atlântida.
>
> Gostaria de agendar uma apresentação?
>
> João Corrêa – Casa Mar Imóveis

### B – Com nome
> Oi {Nome}, tudo bem? Aqui é o João Corrêa, da Casa Mar Imóveis.
>
> Estou apresentando uma nova oportunidade de investimento em Atlântida: apartamentos com parcelas a partir de **R$ 2.500,00**, na Avenida Central.
>
> Posso te agendar uma apresentação? Leva uns 15 minutos.
>
> João Corrêa – Casa Mar Imóveis

### C – Curta
> Oi {Nome}! Separei uma opção de investimento para te mostrar: apartamento na Avenida Central de Atlântida, com parcela a partir de **R$ 2.500,00**.
>
> Faz sentido eu te apresentar?
>
> João Corrêa – Casa Mar Imóveis

### D – Oportunidade de entrada
> Boa tarde, {Nome}! Aqui é o João Corrêa, da Casa Mar Imóveis.
>
> Chegou uma oportunidade para quem quer entrar no mercado com parcela a partir de **R$ 2.500,00**: apartamentos na Avenida Central de Atlântida.
>
> Quer que eu agende uma apresentação para você?
>
> João Corrêa – Casa Mar Imóveis

---

## Etapa 2 – Follow-up (automático, 24h depois, sem foto)

Só vai para quem **não respondeu** e **não pediu para parar**.

> {Nome}, tudo bem? Só passando para saber se conseguiu ver a oportunidade que te mandei: apartamentos na Avenida Central de Atlântida, com parcelas a partir de **R$ 2.500,00**.
>
> Quer que eu agende uma apresentação?
>
> João Corrêa – Casa Mar Imóveis

---

## Etapa 3 – Resposta humana (por tipo de resposta)

### 3a. Aberto ("sim", "bom dia", "o que seria?", "pode ser", "manda mais")
> {Nome}, que bom! Aqui é o João Corrêa, da Casa Mar Imóveis.
>
> São apartamentos na Avenida Central de Atlântida, com parcelas a partir de **R$ 2.500,00**. Temos unidades de 1, 2 e 3 quartos, com a infraestrutura toda no rooftop (a foto que te mandei é de lá).
>
> Para eu separar o que faz sentido pra você: é mais pra **morar**, pra **renda (aluguel/temporada)** ou pra **valorização**?

### 3b. Perguntou valor / parcela / condições
> Te passo com prazer. Como as condições mudam conforme a unidade e a forma de pagamento, o mais rápido é te mostrar na hora.
>
> Me diz só: seria à vista, com financiamento ou com entrada facilitada? E mais ou menos qual faixa de valor você teria em mente?

*(Não invente valores além do "parcela a partir de R$ 2.500,00" sem confirmar com o gestor.)*

### 3c. Quer agendar / já demonstrou interesse
> Perfeito! Tenho horários hoje e amanhã.
>
> Fica melhor de **manhã** ou de **tarde**? Aqui na Casa Mar: Av. Paraguassu, 2124, Loja 3, Atlântida – Xangri-Lá/RS.

Depois de confirmar o horário:
> Combinado, {Nome}! Te espero **{dia} às {hora}**. Vou separar as unidades no seu perfil.
>
> 📍 Casa Mar Imóveis · Av. Paraguassu, 2124, Loja 3, Atlântida
> https://maps.google.com/?q=Casa+Mar+Imoveis+Av+Paraguassu+2124+Atlantida+Xangri-La

### 3d. Perguntou quem é / de onde tirei o número
> Desculpa não ter me apresentado antes! Sou o João Corrêa, da Casa Mar Imóveis, aqui de Atlântida. Trabalho com imóveis na região e montei uma seleção especialmente para quem já é lead nosso.
>
> Posso te contar em 1 minuto?

### 3e. Não agora / estou pagando / por enquanto não
> Sem problema, {Nome}! Obrigado pelo retorno.
>
> Se em algum momento quiser trocar, vender ou investir de novo aqui no Litoral, me chama. Fico à disposição.

### 3f. Não tem interesse
> Tudo certo, {Nome}! Obrigado por responder.
>
> Se um dia mudar de ideia ou conhecer alguém procurando oportunidade, pode me indicar. Abraço!

### 3g. Pessoa errada / número errado
> Desculpe o engano! Obrigado por avisar. 🙏
> *(remova da lista)*

### 3h. Pediu para parar / bloquear
> Desculpa o incômodo! Não te chamo mais.
> *(remova e não mande mais nada)*

### 3i. Quer vender imóvel (captação)
> Que ótimo, {Nome}! Temos clientes procurando imóvel aqui na região.
>
> Me manda a unidade, a metragem, umas fotos e o valor que vocês pensam em pedir, que eu já apresento.

---

## Etapa 4 – Pós-agendamento

**Lembrete (no dia, pela manhã):**
> Bom dia, {Nome}! É hoje 😊 Tudo certo pra {hora}? Qualquer coisa, me chama aqui.

**Não apareceu (fim da tarde):**
> {Nome}, sentimos sua falta! Ainda tenho unidades disponíveis no seu perfil. Consegue passar aqui até o fim do dia?

**Confirmou e foi (dia seguinte):**
> {Nome}, obrigado por ter vindo! Ficou alguma dúvida sobre as unidades que vimos? Posso te ajudar a simular o financiamento.

---

## O que anotar em `../../controle_teste_AB.csv`

| Variante | Enviados | Responderam | % | Agendaram | Confirmaram | Compareceram |
|---|---|---|---|---|---|---|
| A – Base | | | | | | |
| B – Com nome | | | | | | |
| C – Curta | | | | | | |
| D – Oportunidade | | | | | | |

Métrica principal: **agendamentos ÷ enviados** (não só resposta).
