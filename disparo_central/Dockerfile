FROM node:22-alpine
WORKDIR /app
COPY disparo.js config.js contatos.csv arte-av-central.jpg ./
# estado, log e relatório ficam em /app/dados (monte um volume aqui no Easypanel)
ENV DADOS_DIR=/app/dados
CMD ["node", "disparo.js"]
