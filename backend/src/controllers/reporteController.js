// backend/src/controllers/reporteController.js
// FIX: se añade manejo consistente de errores en todos los handlers,
// incluyendo el caso donde el stream PDF ya empezó cuando ocurre un error.

const { Venta, DetalleVenta, Gasto, Producto, sequelize } = require('../models');
const { Op } = require('sequelize');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

// ─── Helper: construir cláusula WHERE de fechas ───────────────────────────────
const buildFechaWhere = (desde, hasta) => {
  if (desde && hasta) {
    const d = new Date(desde);
    const h = new Date(hasta);
    if (isNaN(d) || isNaN(h)) return null;
    return { [Op.between]: [d, h] };
  }
  return null;
};

// ─── Reporte ventas PDF ───────────────────────────────────────────────────────
const reporteVentasPDF = async (req, res) => {
  const empresa_id = req.usuario.empresa_id;
  const { desde, hasta } = req.query;

  try {
    const where = { empresa_id };
    const fechaWhere = buildFechaWhere(desde, hasta);
    if (fechaWhere) where.fecha = fechaWhere;

    const ventas = await Venta.findAll({
      where,
      include: [{ model: DetalleVenta, include: [Producto] }],
      order: [['fecha', 'DESC']]
    });

    // FIX: crear el doc y configurar el pipe ANTES de empezar a escribir.
    // Si ocurre un error en la consulta, no se envía nada y se puede responder con JSON.
    const doc = new PDFDocument({ margin: 40 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_ventas.pdf');

    // FIX: capturar errores del stream PDF
    doc.on('error', (err) => {
      console.error('[reporteVentasPDF] Error en stream PDF:', err.message);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error al generar el PDF' });
      }
    });

    doc.pipe(res);

    // Encabezado
    doc.fontSize(20).fillColor('#1e1b4b').text('REPORTE DE VENTAS', { align: 'center' });
    doc.fontSize(10).fillColor('#64748b').text(
      `Generado: ${new Date().toLocaleDateString('es-PE')}`,
      { align: 'center' }
    );
    doc.moveDown(1.5);

    // Cabecera tabla
    const cols = { id: 40, fecha: 130, total: 380, metodo: 460 };
    doc.rect(40, doc.y, 515, 22).fill('#4f46e5');
    doc.fillColor('white').fontSize(10);
    doc.text('#',       cols.id,     doc.y - 17);
    doc.text('Fecha',   cols.fecha,  doc.y);
    doc.text('Total',   cols.total,  doc.y);
    doc.text('Método',  cols.metodo, doc.y);
    doc.moveDown(0.8);

    let totalGeneral = 0;
    ventas.forEach((v, i) => {
      const y = doc.y;
      if (i % 2 === 0) doc.rect(40, y, 515, 20).fill('#f8fafc');
      doc.fillColor('#374151').fontSize(9);
      doc.text(String(v.id),                                              cols.id,     y + 5);
      doc.text(new Date(v.fecha).toLocaleDateString('es-PE'),             cols.fecha,  y + 5);
      doc.text(`S/ ${parseFloat(v.total).toFixed(2)}`,                    cols.total,  y + 5);
      doc.text(v.metodo_pago,                                             cols.metodo, y + 5);
      doc.moveDown(0.7);
      totalGeneral += parseFloat(v.total);
    });

    doc.moveDown();
    doc.fontSize(12).fillColor('#1e1b4b')
      .text(`TOTAL GENERAL: S/ ${totalGeneral.toFixed(2)}`, { align: 'right' });

    doc.end();
  } catch (error) {
    console.error('[reporteVentasPDF]', error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
};

// ─── Reporte ventas Excel ─────────────────────────────────────────────────────
const reporteVentasExcel = async (req, res) => {
  const empresa_id = req.usuario.empresa_id;
  const { desde, hasta } = req.query;

  try {
    const where = { empresa_id };
    const fechaWhere = buildFechaWhere(desde, hasta);
    if (fechaWhere) where.fecha = fechaWhere;

    const ventas = await Venta.findAll({ where, order: [['fecha', 'DESC']] });

    const workbook = new ExcelJS.Workbook();
    const sheet    = workbook.addWorksheet('Ventas');

    sheet.columns = [
      { header: 'ID',             key: 'id',          width: 8  },
      { header: 'Fecha',          key: 'fecha',        width: 18 },
      { header: 'Total (S/)',     key: 'total',        width: 15 },
      { header: 'Método de Pago', key: 'metodo_pago',  width: 18 },
      { header: 'Estado',         key: 'estado',       width: 15 }
    ];

    sheet.getRow(1).eachCell((cell) => {
      cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
      cell.font  = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center' };
    });

    ventas.forEach((v) => {
      sheet.addRow({
        id:          v.id,
        fecha:       new Date(v.fecha).toLocaleDateString('es-PE'),
        total:       parseFloat(v.total),
        metodo_pago: v.metodo_pago,
        estado:      v.estado
      });
    });

    sheet.addRow({});
    const totalRow = sheet.addRow({
      metodo_pago: 'TOTAL GENERAL',
      total: ventas.reduce((s, v) => s + parseFloat(v.total), 0)
    });
    totalRow.getCell('metodo_pago').font = { bold: true };
    totalRow.getCell('total').font = { bold: true, color: { argb: 'FF4F46E5' } };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_ventas.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('[reporteVentasExcel]', error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
};

// ─── Reporte gastos Excel ─────────────────────────────────────────────────────
const reporteGastosExcel = async (req, res) => {
  const empresa_id = req.usuario.empresa_id;

  try {
    const gastos = await Gasto.findAll({
      where: { empresa_id },
      order: [['fecha', 'DESC']]
    });

    const workbook = new ExcelJS.Workbook();
    const sheet    = workbook.addWorksheet('Gastos');

    sheet.columns = [
      { header: 'ID',          key: 'id',          width: 8  },
      { header: 'Fecha',       key: 'fecha',        width: 18 },
      { header: 'Categoría',   key: 'categoria',    width: 20 },
      { header: 'Descripción', key: 'descripcion',  width: 30 },
      { header: 'Monto (S/)',  key: 'monto',        width: 15 }
    ];

    sheet.getRow(1).eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    });

    gastos.forEach((g) => {
      sheet.addRow({
        id:          g.id,
        fecha:       new Date(g.fecha).toLocaleDateString('es-PE'),
        categoria:   g.categoria,
        descripcion: g.descripcion || '',
        monto:       parseFloat(g.monto)
      });
    });

    // Fila de total
    sheet.addRow({});
    const totalRow = sheet.addRow({
      categoria: 'TOTAL GENERAL',
      monto: gastos.reduce((s, g) => s + parseFloat(g.monto), 0)
    });
    totalRow.getCell('categoria').font = { bold: true };
    totalRow.getCell('monto').font = { bold: true, color: { argb: 'FFDC2626' } };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_gastos.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('[reporteGastosExcel]', error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = { reporteVentasPDF, reporteVentasExcel, reporteGastosExcel };
