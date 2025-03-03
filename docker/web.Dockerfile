FROM node:23

WORKDIR /app
RUN npm install -g http-server
COPY package*.json ./
RUN npm install --force
COPY . .
RUN chmod +x /app/entrypoint.sh

EXPOSE 8080
CMD ["/app/entrypoint.sh"]