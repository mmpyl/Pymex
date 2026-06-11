const fs = require('fs');
const path = require('path');

const routeFiles = [
  ...fs.readdirSync(path.join(__dirname, '../../src/domains/core/routes'))
    .filter((file) => file.endsWith('.js'))
    .map((file) => path.join(__dirname, '../../src/domains/core/routes', file)),
  path.join(__dirname, '../../src/domains/billing/routes/facturacion.js'),
  path.join(__dirname, '../../src/domains/billing/routes/features.js'),
  path.join(__dirname, '../../src/domains/billing/routes/pagos.js'),
  path.join(__dirname, '../../src/domains/ml/routes/ml.js'),
  path.join(__dirname, '../../src/routes/usuarios.js')
];

describe('Tenant routes audit', () => {
  it.each(routeFiles)('%s aplica ensureTenantAccess después de verificarToken', (filePath) => {
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toContain('ensureTenantAccess');
    expect(source).toMatch(/router\.use\(verificarToken[\s\S]{0,120}ensureTenantAccess\(\)/);
  });
});
