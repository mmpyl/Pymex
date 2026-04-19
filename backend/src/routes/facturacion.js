// backend/src/routes/facturacion.js — versión consolidada (sin conflictos de merge)
// Mantiene la versión más completa:
//   - x-request-id propagado a microservicios
//   - Fallback a DB local en /comprobantes (con flag ALLOW_EMPTY_COMPROBANTES_FALLBACK)
//   - Validaciones serie, RUC, DNI, nota de crédito
//   - Timeouts configurables
const router = require('express').Router();
const axios  = require('axios');
const { verificarToken } = require('../middleware/auth');


const { Venta, Producto, DetalleVenta, Cliente, Comprobante } = require('../models');

const FACT_URL = process.env.FACTURACION_SERVICE_URL || 'http://localhost:9000/api';
const FACT_TIMEOUT_MS = Number(process.env.FACTURACION_TIMEOUT_MS || 15000);
const ALLOW_EMPTY_COMPROBANTES_FALLBACK = String(process.env.ALLOW_EMPTY_COMPROBANTES_FALLBACK || 'false') === 'true';

const { Venta, Producto, DetalleVenta, Cliente } = require('../models');

const FACT_URL = process.env.FACTURACION_SERVICE_URL || 'http://localhost:9000/api';
const FACT_TIMEOUT_MS = Number(process.env.FACTURACION_TIMEOUT_MS || 15000);


const { Venta, Producto, DetalleVenta, Cliente, Comprobante } = require('../models');

const FACT_URL     = process.env.FACTURACION_SERVICE_URL || 'http://localhost:9000/api';
const FACT_TIMEOUT = Number(process.env.FACTURACION_TIMEOUT_MS || 15000);
const ALLOW_EMPTY_FALLBACK = String(process.env.ALLOW_EMPTY_COMPROBANTES_FALLBACK || 'false') === 'true';


router.use(verificarToken);

// ─── Helpers de validación ────────────────────────────────────────────────────
const esSerieValida   = (serie, prefijo) =>
  typeof serie === 'string' && new RegExp(`^${prefijo}[0-9]{3}$`).test(serie);
const esRucValido     = (ruc)  => typeof ruc === 'string' && /^[0-9]{11}$/.test(ruc);
const esDniValido     = (dni)  => !dni || /^[0-9]{8}$/.test(String(dni));


const responderErrorIntegracion = (res, error) => {
    const detalle = error.response?.data?.error || error.response?.data?.descripcion || error.message;

    const traceId = res.getHeader('x-request-id');
    return res.status(502).json({ error: `Error de integración con facturación: ${detalle}`, trace_id: traceId });

    return res.status(502).json({ error: `Error de integración con facturación: ${detalle}` });


const responderError  = (res, error) => {
  const detalle  = error.response?.data?.error || error.response?.data?.descripcion || error.message;
  const traceId  = res.getHeader('x-request-id');
  const status   = error.response?.status === 404 ? 404 : 502;
  return res.status(status).json({
    error:    `Error de integración con facturación: ${detalle}`,
    trace_id: traceId
  });

};

const axiosHeaders = (req) => ({
  timeout: FACT_TIMEOUT,
  headers: { 'x-request-id': req.requestId }
});

// ─── Construir items desde DetalleVentas ──────────────────────────────────────
const buildItems = (detalleVentas) =>
  detalleVentas.map(d => ({
    codigo:          `P${String(d.producto_id).padStart(3, '0')}`,
    descripcion:     d.Producto.nombre,
    cantidad:        d.cantidad,
    precio_unitario: parseFloat(d.precio_unitario),
    unidad:          'NIU'
  }));

// ─── POST /api/facturacion/factura/:venta_id ──────────────────────────────────
router.post('/factura/:venta_id', async (req, res) => {
  try {
    const serie = req.body.serie || 'F001';
    if (!esSerieValida(serie, 'F'))
      return res.status(400).json({ error: 'Serie de factura inválida (ej: F001)' });
    if (!esRucValido(req.body.ruc_cliente || ''))
      return res.status(400).json({ error: 'RUC cliente inválido (11 dígitos)' });
    if (!req.body.razon_social)
      return res.status(400).json({ error: 'Razón social del cliente es obligatoria' });

    const venta = await Venta.findOne({
      where:   { id: req.params.venta_id, empresa_id: req.usuario.empresa_id },
      include: [{ model: DetalleVenta, include: [Producto] }, { model: Cliente }]
    });
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });

    const payload = {
      empresa_id: req.usuario.empresa_id,
      venta_id:   venta.id,
      serie,
      moneda:     'PEN',
      cliente: {
        ruc:         req.body.ruc_cliente,
        razon_social:req.body.razon_social,
        direccion:   req.body.direccion || ''
      },
      items: buildItems(venta.DetalleVentas)
    };


        const items = venta.DetalleVentas.map(d => ({
            codigo: `P${String(d.producto_id).padStart(3, '0')}`,
            descripcion: d.Producto.nombre,
            cantidad: d.cantidad,
            precio_unitario: parseFloat(d.precio_unitario),
            unidad: 'NIU'
        }));

        const payload = {
            empresa_id: req.usuario.empresa_id,
            venta_id: venta.id,
            serie,
            moneda: 'PEN',
            cliente: {
                ruc: req.body.ruc_cliente,
                razon_social: req.body.razon_social,
                direccion: req.body.direccion || ''
            },
            items
        };


        const { data } = await axios.post(`${FACT_URL}/facturas/emitir`, payload, {
            timeout: FACT_TIMEOUT_MS,
            headers: { 'x-request-id': req.requestId }
        });

        const { data } = await axios.post(`${FACT_URL}/facturas/emitir`, payload, { timeout: FACT_TIMEOUT_MS });

        res.json(data);
    } catch (error) {
        responderErrorIntegracion(res, error);
    }

    const { data } = await axios.post(`${FACT_URL}/facturas/emitir`, payload, axiosHeaders(req));
    return res.json(data);
  } catch (error) {
    return responderError(res, error);
  }

});

// ─── POST /api/facturacion/boleta/:venta_id ───────────────────────────────────
router.post('/boleta/:venta_id', async (req, res) => {
  try {
    const serie = req.body.serie || 'B001';
    if (!esSerieValida(serie, 'B'))
      return res.status(400).json({ error: 'Serie de boleta inválida (ej: B001)' });
    if (!esDniValido(req.body.dni_cliente || ''))
      return res.status(400).json({ error: 'DNI cliente inválido (8 dígitos)' });

    const venta = await Venta.findOne({
      where:   { id: req.params.venta_id, empresa_id: req.usuario.empresa_id },
      include: [{ model: DetalleVenta, include: [Producto] }]
    });
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });

    const payload = {
      empresa_id: req.usuario.empresa_id,
      venta_id:   venta.id,
      serie,
      moneda:     'PEN',
      cliente: {
        nombre: req.body.nombre_cliente || 'CLIENTE VARIOS',
        dni:    req.body.dni_cliente || ''
      },
      items: buildItems(venta.DetalleVentas)
    };


        const items = venta.DetalleVentas.map(d => ({
            codigo: `P${String(d.producto_id).padStart(3, '0')}`,
            descripcion: d.Producto.nombre,
            cantidad: d.cantidad,
            precio_unitario: parseFloat(d.precio_unitario),
            unidad: 'NIU'
        }));

        const payload = {
            empresa_id: req.usuario.empresa_id,
            venta_id: venta.id,
            serie,
            moneda: 'PEN',
            cliente: {
                nombre: req.body.nombre_cliente || 'CLIENTE VARIOS',
                dni: req.body.dni_cliente || ''
            },
            items
        };


        const { data } = await axios.post(`${FACT_URL}/boletas/emitir`, payload, {
            timeout: FACT_TIMEOUT_MS,
            headers: { 'x-request-id': req.requestId }
        });

        const { data } = await axios.post(`${FACT_URL}/boletas/emitir`, payload, { timeout: FACT_TIMEOUT_MS });

        res.json(data);
    } catch (error) {
        responderErrorIntegracion(res, error);
    }

    const { data } = await axios.post(`${FACT_URL}/boletas/emitir`, payload, axiosHeaders(req));
    return res.json(data);
  } catch (error) {
    return responderError(res, error);
  }

});

// ─── POST /api/facturacion/nota-credito ───────────────────────────────────────
router.post('/nota-credito', async (req, res) => {
  try {
    if (!req.body.comprobante_id)
      return res.status(400).json({ error: 'comprobante_id es obligatorio para nota de crédito' });
    if (!Array.isArray(req.body.items) || req.body.items.length === 0)
      return res.status(400).json({ error: 'Debe enviar items para la nota de crédito' });


        const payload = { ...req.body, empresa_id: req.usuario.empresa_id };

        const { data } = await axios.post(`${FACT_URL}/notas-credito/emitir`, payload, {
            timeout: FACT_TIMEOUT_MS,
            headers: { 'x-request-id': req.requestId }
        });

        const { data } = await axios.post(`${FACT_URL}/notas-credito/emitir`, payload, { timeout: FACT_TIMEOUT_MS });

        res.json(data);
    } catch (error) {
        responderErrorIntegracion(res, error);
    }

    const payload = { ...req.body, empresa_id: req.usuario.empresa_id };
    const { data } = await axios.post(`${FACT_URL}/notas-credito/emitir`, payload, axiosHeaders(req));
    return res.json(data);
  } catch (error) {
    return responderError(res, error);
  }

});

// ─── GET /api/facturacion/comprobantes ────────────────────────────────────────
// Consulta primero la DB local y usa el microservicio como fallback
router.get('/comprobantes', async (req, res) => {
  try {
    const comprobantes = await Comprobante.findAll({
      where: { empresa_id: req.usuario.empresa_id },
      order: [['fecha_emision', 'DESC']],
      limit: 100
    });
    return res.json(comprobantes);
  } catch (dbError) {
    console.error('⚠️ Error consultando comprobantes en DB local:', dbError.message);
    try {


        const comprobantes = await Comprobante.findAll({
            where: { empresa_id: req.usuario.empresa_id },
            order: [['fecha_emision', 'DESC']],
            limit: 100
        });

        res.json(comprobantes);
    } catch (dbError) {
        console.error('⚠️ Error consultando comprobantes en DB local:', dbError.message);
        try {
            const { data } = await axios.get(`${FACT_URL}/comprobantes/empresa/${req.usuario.empresa_id}`, {
                timeout: FACT_TIMEOUT_MS,
                headers: { 'x-request-id': req.requestId }
            });
            res.json(data);
        } catch (error) {
            console.error('⚠️ Error consultando comprobantes en microservicio:', error.message);
            if (ALLOW_EMPTY_COMPROBANTES_FALLBACK) {
                // Útil solo para continuidad de UI en modo degradado.
                return res.status(200).json([]);
            }
            return responderErrorIntegracion(res, error);
        }

        const { data } = await axios.get(`${FACT_URL}/comprobantes/empresa/${req.usuario.empresa_id}`, { timeout: FACT_TIMEOUT_MS });
        res.json(data);
    } catch (error) {
        responderErrorIntegracion(res, error);


      const { data } = await axios.get(
        `${FACT_URL}/comprobantes/empresa/${req.usuario.empresa_id}`,
        axiosHeaders(req)
      );
      return res.json(data);
    } catch (msError) {
      console.error('⚠️ Error consultando comprobantes en microservicio:', msError.message);
      if (ALLOW_EMPTY_FALLBACK) return res.status(200).json([]);
      return responderError(res, msError);

    }
  }
});

// ─── GET /api/facturacion/pdf/:id/:tipo ───────────────────────────────────────
router.get('/pdf/:id/:tipo', async (req, res) => {
  try {
    const tiposPermitidos = ['factura', 'boleta'];
    if (!tiposPermitidos.includes(req.params.tipo))
      return res.status(400).json({ error: 'Tipo no soportado para PDF. Usa: factura, boleta' });


        const url = `${FACT_URL}/${req.params.tipo}s/${req.params.id}/pdf`;

        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: FACT_TIMEOUT_MS,
            headers: { 'x-request-id': req.requestId }
        });

        const response = await axios.get(url, { responseType: 'arraybuffer', timeout: FACT_TIMEOUT_MS });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=comprobante_${req.params.id}.pdf`);
        res.send(response.data);
    } catch (error) {
        responderErrorIntegracion(res, error);
    }

    const url      = `${FACT_URL}/${req.params.tipo}s/${req.params.id}/pdf`;
    const response = await axios.get(url, { responseType: 'arraybuffer', ...axiosHeaders(req) });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=comprobante_${req.params.id}.pdf`);
    return res.send(response.data);
  } catch (error) {
    return responderError(res, error);
  }
});

// ─── GET /api/facturacion/health ──────────────────────────────────────────────
router.get('/health', async (req, res) => {
  try {
    const { data } = await axios.get(`${FACT_URL}/health`, axiosHeaders(req));
    return res.json(data);
  } catch (error) {
    return res.status(502).json({ error: 'Servicio de facturación no disponible', trace_id: req.requestId });
  }

});

module.exports = router;
