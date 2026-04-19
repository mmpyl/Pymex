import pandas as pd
import numpy as np
from datetime import datetime

def predecir_quiebre_stock(df_ventas: pd.DataFrame, df_productos: pd.DataFrame) -> list:
    """
    Predice en cuántos días se agotará el stock de cada producto
    basándose en la velocidad de ventas reciente.
    """
    if df_ventas.empty or df_productos.empty:
        return []

    df_ventas['fecha'] = pd.to_datetime(df_ventas['fecha'])

    # Solo ventas de los últimos 30 días para calcular velocidad reciente
    hace_30_dias = datetime.now() - pd.Timedelta(days=30)
    ventas_recientes = df_ventas[df_ventas['fecha'] >= hace_30_dias]

    # Ventas promedio diario por producto
    if ventas_recientes.empty:
        # Si no hay ventas recientes, usar todo el historial
        ventas_recientes = df_ventas

    velocidad = ventas_recientes.groupby('producto_id')['cantidad'].sum().reset_index()
    dias_periodo = max(1, (datetime.now() - df_ventas['fecha'].min()).days)
    dias_periodo = min(dias_periodo, 30)
    velocidad['ventas_dia'] = velocidad['cantidad'] / dias_periodo

    resultado = []

    for _, prod in df_productos.iterrows():
        prod_velocidad = velocidad[velocidad['producto_id'] == prod['id']]

        if prod_velocidad.empty:
            # Producto sin ventas recientes = sin riesgo inmediato
            resultado.append({
                "producto_id": int(prod['id']),
                "producto": prod['nombre'],
                "stock_actual": int(prod['stock']),
                "stock_minimo": int(prod['stock_minimo']),
                "ventas_dia": 0.0,
                "dias_para_quiebre": 999,
                "riesgo": "sin_ventas",
                "recomendacion_compra": 0
            })
            continue

        ventas_dia = float(prod_velocidad['ventas_dia'].iloc[0])

        if ventas_dia <= 0:
            dias_quiebre = 999
        else:
            dias_quiebre = int(prod['stock'] / ventas_dia)

        # Calcular recomendación de compra para 30 días
        recomendacion = max(0, int(ventas_dia * 30) - prod['stock'])

        # Clasificar riesgo
        if dias_quiebre <= 7:
            riesgo = "critico"
        elif dias_quiebre <= 15:
            riesgo = "alto"
        elif dias_quiebre <= 30:
            riesgo = "medio"
        else:
            riesgo = "bajo"

        resultado.append({
            "producto_id": int(prod['id']),
            "producto": prod['nombre'],
            "stock_actual": int(prod['stock']),
            "stock_minimo": int(prod['stock_minimo']),
            "ventas_dia": round(ventas_dia, 2),
            "dias_para_quiebre": dias_quiebre,
            "riesgo": riesgo,
            "recomendacion_compra": recomendacion
        })

    return sorted(resultado, key=lambda x: x['dias_para_quiebre'])