# Disparo Acelera Investidor: como rodar no Easypanel

O script envia as 4 variantes do teste A/B para os 530 contatos de `contatos.csv`.
Ele fica ligado 24h, mas **só envia dentro das janelas de horário** do `config.js`. Fora delas, apenas registra as respostas.

## O que ele faz sozinho
- Envia só nas janelas e até o limite de cada dia (quarta 30/09 a domingo 04/10).
- Espera de 45 a 120 segundos entre uma mensagem e outra.
- Alterna as variantes para o teste ficar equilibrado a qualquer momento.
- Antes de enviar, confere se o número tem WhatsApp. Os que não têm são pulados.
- A cada 2 minutos, busca respostas e **avisa no WhatsApp** o número de `AVISAR_NUMEROS`, com nome, condomínio, variante, o que o lead escreveu e o link wa.me.
- Reconhece quem pediu para parar ("não tenho interesse", "sair", "remover"…). Essas pessoas nunca recebem o follow-up.
- Manda **um** follow-up 24h depois para quem não respondeu.
- Para sozinho se o WhatsApp desconectar e pausa 30 min se der 5 erros seguidos.
- Se reiniciar ou houver novo deploy, continua de onde parou, porque o andamento fica salvo no volume `/app/dados`.

## 1. Conectar o número de disparo
No painel da Evolution (o mesmo do ZapBroker), crie uma instância com o **número separado de disparo** e escaneie o QR Code. Nunca use o número principal da Casa Mar. Anote o nome da instância.

## 2. Subir o código para o GitHub
Suba o conteúdo desta pasta `disparo` para um repositório **privado**. Ele precisa ser privado porque `contatos.csv` tem nomes e telefones dos proprietários.

O `.gitignore` já impede que o `.env` e os dados da campanha subam.

## 3. Criar o app no Easypanel
1. Abra o **mesmo projeto** onde está a Evolution API e clique em **+ Service → App**. Nome sugerido: `disparo-casamar`.
2. Em **Source**, escolha GitHub, selecione o repositório e a branch `main`. Em **Build**, selecione **Dockerfile**.
3. Em **Environment**, cole:
   ```
   EVOLUTION_API_URL=https://zapbroker-evolution-api.mnfvp3.easypanel.host
   EVOLUTION_API_KEY=sua-chave
   EVOLUTION_INSTANCE=nome-da-instancia-do-passo-1
   AVISAR_NUMEROS=5551980985330
   ```
4. Em **Mounts**, adicione um **Volume** com o nome `dados` e o caminho `/app/dados`.
   **Não pule este passo.** Sem o volume, um novo deploy apaga o andamento e todo mundo recebe a mensagem de novo.
5. Clique em **Deploy**. O app não precisa de domínio nem de porta.

## 4. Testar antes de liberar
Na aba **Console** do app, rode:
```
node disparo.js teste 5551SEUNUMERO
```
Você recebe as 4 variantes e o follow-up exatamente como o lead vai receber.

O disparo em si só começa quando uma janela de horário abre. Se quiser segurar o início até conferir o teste, crie o arquivo `PAUSAR` logo depois do deploy (veja o comando abaixo).

## 5. No dia a dia (aba Console do app)
| Quero… | Comando |
|---|---|
| Ver o andamento | `node disparo.js status` |
| Ver a agenda | `node disparo.js plano` |
| Ver o resultado do teste A/B | `node disparo.js relatorio` |
| Pausar na hora | `touch /app/dados/PAUSAR` |
| Voltar a enviar | `rm /app/dados/PAUSAR` |

O que o script está fazendo aparece na aba **Logs**.

Para mudar horários, limites ou textos, edite o `config.js`, faça push e clique em **Deploy** de novo. O andamento continua salvo no volume.

## Importante
- Quem responde deve ser atendido **por uma pessoa**, rápido (até 15 min), seguindo a seção 5 da estratégia. O script só faz o primeiro contato e o follow-up.
- Se muitos leads bloquearem ou reclamarem, pause (`touch /app/dados/PAUSAR`) e reavalie antes de continuar.
- Se você mudar a lista em `../listas`, copie de novo para `contatos.csv`. Contatos novos entram como pendentes, e quem já recebeu não recebe de novo.
