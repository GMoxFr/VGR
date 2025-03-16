FROM node:23

WORKDIR /app

# Installer http-server pour servir l'application après le build
RUN npm install -g http-server

# Copier les fichiers package.json et installer les dépendances
COPY package*.json ./
RUN npm install --force

# Copier le reste du code source
COPY . .

# Injecter les variables d'environnement dans un fichier JS
RUN echo "window.__ENV__ = {" > public/env.js \
    && echo "\"VUE_APP_API_URL\": \"${VUE_APP_API_URL}\"," >> public/env.js \
    && echo "\"VUE_APP_IMAGES_URL\": \"${VUE_APP_IMAGES_URL}\"," >> public/env.js \
    && echo "\"VUE_APP_GRAPHS_URL\": \"${VUE_APP_GRAPHS_URL}\"," >> public/env.js \
    && echo "\"VUE_APP_EXPORT_URL\": \"${VUE_APP_EXPORT_URL}\"," >> public/env.js \
    && echo "\"VUE_APP_IMPORT_URL\": \"${VUE_APP_IMPORT_URL}\"," >> public/env.js \
    && echo "\"VUE_APP_PALETTE_URL\": \"${VUE_APP_PALETTE_URL}\"" >> public/env.js \
    && echo "};" >> public/env.js

# Compiler VueJS
RUN npm run build

# Exposer le port
EXPOSE 8080

# Lancer le serveur HTTP pour servir l'application Vue
CMD ["http-server", "dist", "-p", "8080"]