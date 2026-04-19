const app = require('./src/app');
const { sequelize } = require('./src/models');
require('dotenv').config();

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