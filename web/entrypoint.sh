#!/bin/sh

#!/bin/sh

echo "📦 Running VueJS build with environment variables..."

# Exporter les variables d'environnement pour VueJS
export VUE_APP_API_URL="${VUE_APP_API_URL}"

# Lancer le build VueJS avec les variables d'environnement dynamiques
npm run build

echo "🚀 Starting HTTP server..."
exec http-server dist