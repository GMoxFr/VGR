FROM node:23

WORKDIR /app
COPY package*.json ./
RUN npm install --force
COPY . .

EXPOSE 8003
CMD ["node", "export.js"]
