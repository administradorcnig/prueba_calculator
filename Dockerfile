FROM node:18

# Configuración del proxy
ENV https_proxy=http://192.168.192.11:8080 \
    http_proxy=http://192.168.192.11:8080 \
    no_proxy=127.0.0.1,localhost,10.0.0.0/8,192.0.0.0/8

WORKDIR /usr/src/app

# Solo copiamos package.json y package-lock.json para instalar deps
COPY package*.json ./

# Instalamos solo dependencias de producción
# (si diera problemas, podrías cambiar a "npm install" a secas)
RUN npm install --only=production

# Copiamos el resto del código
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
EOF
