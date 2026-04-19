CREATE TABLE IF NOT EXISTS comprobantes (
    id              SERIAL PRIMARY KEY,
    empresa_id      INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    venta_id        INT REFERENCES ventas(id),
    tipo            VARCHAR(10) NOT NULL,
    serie           VARCHAR(5) NOT NULL,
    correlativo     INT NOT NULL,
    numero          VARCHAR(20) NOT NULL,
    ruc_cliente     VARCHAR(11),
    razon_social    VARCHAR(200),
    direccion       VARCHAR(300),
    subtotal        DECIMAL(12,2),
    igv             DECIMAL(12,2),
    total           DECIMAL(12,2),
    moneda          VARCHAR(3) DEFAULT 'PEN',
    estado          VARCHAR(20) DEFAULT 'pendiente',
    sunat_estado    VARCHAR(50),
    sunat_descripcion TEXT,
    xml_path        VARCHAR(300),
    cdr_path        VARCHAR(300),
    pdf_path        VARCHAR(300),
    hash            VARCHAR(100),
    fecha_emision   TIMESTAMP DEFAULT NOW(),
    fecha_envio     TIMESTAMP,
    entorno         VARCHAR(15) DEFAULT 'beta'
);

CREATE TABLE IF NOT EXISTS series_comprobante (
    id          SERIAL PRIMARY KEY,
    empresa_id  INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    tipo        VARCHAR(10) NOT NULL,
    serie       VARCHAR(5) NOT NULL,
    correlativo INT DEFAULT 0,
    UNIQUE(empresa_id, serie)
);

CREATE INDEX IF NOT EXISTS idx_comprobantes_empresa ON comprobantes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_comprobantes_venta   ON comprobantes(venta_id);
