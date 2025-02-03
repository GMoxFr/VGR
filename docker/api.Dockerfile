FROM node:23

WORKDIR /app
COPY package*.json ./
RUN npm install --force
COPY . .

EXPOSE 8000
CMD ["node", "bin/index.js"]
