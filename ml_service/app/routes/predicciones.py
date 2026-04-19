from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.db_service import (
    get_ventas_empresa,
    get_productos_empresa,
    get_gastos_empresa,
    guardar_prediccion
)
from app.models.prediccion_ventas import entrenar_modelo_ventas, predecir_ventas_proximos_meses
from app.models.prediccion_demanda import entrenar_modelo_demanda, predecir_demanda_productos
from app.models.prediccion_stock import predecir_quiebre_stock

router = APIRouter(prefix="/predicciones", tags=["predicciones"])

class EmpresaRequest(BaseModel):
    empresa_id: int

# ─── ENTRENAR TODOS LOS MODELOS ───────────────────────────────────────────────
@router.post("/entrenar")
async def entrenar_modelos(req: EmpresaRequest):
    """Entrena todos los modelos ML para una empresa."""
    try:
        df_ventas = get_ventas_empresa(req.empresa_id)

        if df_ventas.empty:
            return {"mensaje": "No hay suficientes datos para entrenar", "empresa_id": req.empresa_id}

        resultado_ventas  = entrenar_modelo_ventas(req.empresa_id, df_ventas)
        resultado_demanda = entrenar_modelo_demanda(req.empresa_id, df_ventas)

        return {
            "empresa_id": req.empresa_id,
            "modelo_ventas": resultado_ventas,
            "modelo_demanda": resultado_demanda,
            "estado": "entrenamiento_completado"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── PREDICCIÓN DE VENTAS ─────────────────────────────────────────────────────
@router.get("/ventas/{empresa_id}")
async def predecir_ventas(empresa_id: int, meses: int = 3):
    """Predice ventas para los próximos N meses."""
    try:
        df = get_ventas_empresa(empresa_id)

        if df.empty:
            return {"empresa_id": empresa_id, "predicciones": [], "mensaje": "Sin datos históricos"}

        predicciones = predecir_ventas_proximos_meses(empresa_id, df, meses)

        # Guardar en BD
        for pred in predicciones:
            if "error" not in pred:
                guardar_prediccion(
                    empresa_id=empresa_id,
                    tipo="ventas_mensuales",
                    producto_id=None,
                    periodo=pred["periodo"],
                    valor=pred["ventas_predichas"],
                    confianza=pred["confianza"],
                    modelo="random_forest"
                )

        return {
            "empresa_id": empresa_id,
            "meses_predichos": meses,
            "predicciones": predicciones
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── PREDICCIÓN DE DEMANDA ────────────────────────────────────────────────────
@router.get("/demanda/{empresa_id}")
async def predecir_demanda(empresa_id: int):
    """Predice la demanda del próximo mes por producto."""
    try:
        df = get_ventas_empresa(empresa_id)

        if df.empty:
            return {"empresa_id": empresa_id, "predicciones": [], "mensaje": "Sin datos históricos"}

        predicciones = predecir_demanda_productos(empresa_id, df)

        # Guardar en BD
        for pred in predicciones:
            if "error" not in pred:
                guardar_prediccion(
                    empresa_id=empresa_id,
                    tipo="demanda_producto",
                    producto_id=pred["producto_id"],
                    periodo=pred.get("periodo", "proximo_mes"),
                    valor=pred["demanda_predicha"],
                    confianza=pred["confianza"],
                    modelo=pred["metodo"]
                )

        return {
            "empresa_id": empresa_id,
            "predicciones": predicciones
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── PREDICCIÓN DE QUIEBRE DE STOCK ──────────────────────────────────────────
@router.get("/stock/{empresa_id}")
async def predecir_stock(empresa_id: int):
    """Predice qué productos se van a quedar sin stock y cuándo."""
    try:
        df_ventas   = get_ventas_empresa(empresa_id)
        df_productos = get_productos_empresa(empresa_id)

        if df_productos.empty:
            return {"empresa_id": empresa_id, "predicciones": [], "mensaje": "Sin productos"}

        predicciones = predecir_quiebre_stock(df_ventas, df_productos)

        # Guardar en BD solo los críticos y altos
        for pred in predicciones:
            if pred["riesgo"] in ["critico", "alto"]:
                guardar_prediccion(
                    empresa_id=empresa_id,
                    tipo="quiebre_stock",
                    producto_id=pred["producto_id"],
                    periodo=f"{pred['dias_para_quiebre']}_dias",
                    valor=pred["dias_para_quiebre"],
                    confianza=85.0,
                    modelo="regresion_lineal"
                )

        return {
            "empresa_id": empresa_id,
            "predicciones": predicciones,
            "criticos": [p for p in predicciones if p["riesgo"] == "critico"],
            "alertas": len([p for p in predicciones if p["riesgo"] in ["critico", "alto"]])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─── RESUMEN GENERAL ──────────────────────────────────────────────────────────
@router.get("/resumen/{empresa_id}")
async def resumen_predicciones(empresa_id: int):
    """Devuelve todas las predicciones en una sola llamada para el dashboard."""
    try:
        df_ventas    = get_ventas_empresa(empresa_id)
        df_productos = get_productos_empresa(empresa_id)

        ventas   = predecir_ventas_proximos_meses(empresa_id, df_ventas, 1) if not df_ventas.empty else []
        demanda  = predecir_demanda_productos(empresa_id, df_ventas)[:5] if not df_ventas.empty else []
        stock    = predecir_quiebre_stock(df_ventas, df_productos)

        criticos = [p for p in stock if p["riesgo"] == "critico"]
        altos    = [p for p in stock if p["riesgo"] == "alto"]

        return {
            "empresa_id": empresa_id,
            "ventas_proximo_mes": ventas[0] if ventas and "error" not in ventas[0] else None,
            "top_demanda": demanda,
            "stock_critico": criticos,
            "stock_alto": altos,
            "total_en_riesgo": len(criticos) + len(altos)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))