const validateSchema = (schema) => (req, res, next) => {
  const errors = [];

  for (const [field, rule] of Object.entries(schema)) {
    const value = req.body[field];

    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} es requerido`);
      continue;
    }

    if (value === undefined || value === null) continue;

    if (rule.type === 'string' && typeof value !== 'string') errors.push(`${field} debe ser string`);
    if (rule.type === 'number' && typeof value !== 'number') errors.push(`${field} debe ser number`);
    if (rule.type === 'boolean' && typeof value !== 'boolean') errors.push(`${field} debe ser boolean`);

    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      errors.push(`${field} debe tener al menos ${rule.minLength} caracteres`);
    }

    if (rule.min !== undefined && typeof value === 'number' && value < rule.min) {
      errors.push(`${field} debe ser >= ${rule.min}`);
    }

    if (rule.enum && !rule.enum.includes(value)) {
      errors.push(`${field} debe ser uno de: ${rule.enum.join(', ')}`);
    }
  }

  if (errors.length) return res.status(400).json({ error: 'Validación fallida', detalles: errors });
  return next();
};

module.exports = { validateSchema };
