const app = require('./src/app');
const { sequelize } = require('./src/models');
require('dotenv').config();
// Validar variables de entorno críticas antes de iniciar
require('./src/config/envValidator');

const PORT = process.env.PORT || 3000;

async function iniciar() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a PostgreSQL');
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error al conectar:', error.message);
    }
}

iniciar();