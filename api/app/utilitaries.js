function convertNeo4jIntegers(obj) {
    if (Array.isArray(obj)) {
        return obj.map(item => convertNeo4jIntegers(item));
    } else if (typeof obj === 'object' && obj !== null) {
        return Object.keys(obj).reduce((acc, key) => {
            if (obj[key] && typeof obj[key].toNumber === "function") {
                acc[key] = obj[key].toNumber(); // Convertir les Neo4j Integer
            } else if (Array.isArray(obj[key])) {
                acc[key] = obj[key].map(item => convertNeo4jIntegers(item)); // Convertir chaque élément du tableau
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                acc[key] = convertNeo4jIntegers(obj[key]); // Convertir les objets imbriqués
            } else {
                acc[key] = obj[key]; // Autres valeurs (string, boolean, etc.)
            }
            return acc;
        }, {});
    } else if (obj && typeof obj.toNumber === "function") {
        return obj.toNumber(); // Convertir directement un Integer Neo4j isolé
    }
    return obj;
}

module.exports = { convertNeo4jIntegers };