import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import pandas as pd

load_dotenv()

DATABASE_URL = (
    f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
    f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
)

engine = create_engine(DATABASE_URL)

def get_ventas_empresa(empresa_id: int) -> pd.DataFrame:
    """Obtiene historial de ventas de la empresa para entrenar modelos."""
    query = text("""
        SELECT
            v.id,
            v.fecha,
            v.total,
            dv.producto_id,
            dv.cantidad,
            dv.subtotal,
            p.nombre AS producto,
            p.precio_venta,
            EXTRACT(YEAR FROM v.fecha)  AS anio,
            EXTRACT(MONTH FROM v.fecha) AS mes,
            EXTRACT(DOW FROM v.fecha)   AS dia_semana,
            EXTRACT(DAY FROM v.fecha)   AS dia_mes
        FROM ventas v
        JOIN detalle_ventas dv ON dv.venta_id = v.id
        JOIN productos p ON p.id = dv.producto_id
        WHERE v.empresa_id = :empresa_id
        ORDER BY v.fecha ASC
    """)
    with engine.connect() as conn:
        df = pd.read_sql(query, conn, params={"empresa_id": empresa_id})
    return df

def get_productos_empresa(empresa_id: int) -> pd.DataFrame:
    """Obtiene lista de productos con stock."""
    query = text("""
        SELECT id, nombre, stock, stock_minimo, precio_venta, precio_compra
        FROM productos
        WHERE empresa_id = :empresa_id AND estado = 'activo'
    """)
    with engine.connect() as conn:
        df = pd.read_sql(query, conn, params={"empresa_id": empresa_id})
    return df

def get_gastos_empresa(empresa_id: int) -> pd.DataFrame:
    """Obtiene historial de gastos."""
    query = text("""
        SELECT monto, fecha, categoria,
            EXTRACT(YEAR FROM fecha)  AS anio,
            EXTRACT(MONTH FROM fecha) AS mes
        FROM gastos
        WHERE empresa_id = :empresa_id
        ORDER BY fecha ASC
    """)
    with engine.connect() as conn:
        df = pd.read_sql(query, conn, params={"empresa_id": empresa_id})
    return df

def guardar_prediccion(empresa_id: int, tipo: str, producto_id, periodo: str, valor: float, confianza: float, modelo: str):
    """Guarda una predicción en la base de datos."""
    query = text("""
        INSERT INTO predicciones (empresa_id, producto_id, tipo, periodo, valor_predicho, confianza, modelo)
        VALUES (:empresa_id, :producto_id, :tipo, :periodo, :valor, :confianza, :modelo)
        RETURNING id
    """)
    with engine.connect() as conn:
        result = conn.execute(query, {
            "empresa_id": empresa_id,
            "producto_id": producto_id,
            "tipo": tipo,
            "periodo": periodo,
            "valor": round(float(valor), 2),
            "confianza": round(float(confianza), 2),
            "modelo": modelo
        })
        conn.commit()
        return result.fetchone()[0]