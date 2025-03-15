FROM node:23

WORKDIR /app
COPY package*.json ./
RUN npm install --force
COPY . .

EXPOSE 8004
CMD ["node", "import.js"]
