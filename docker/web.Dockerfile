FROM node:23

WORKDIR /app

# Installer http-server pour servir l'application
RUN npm install -g http-server

# Copier les fichiers package.json et installer les dépendances
COPY package*.json ./
RUN npm install --force

# Copier le reste du code source
COPY . .

# Compiler VueJS (sans injecter les variables d'environnement)
RUN npm run build

# Exposer le port
EXPOSE 8080

# Exécuter le script qui génère env.js avant de démarrer le serveur
CMD ["http-server", "dist", "-p", "8080"]