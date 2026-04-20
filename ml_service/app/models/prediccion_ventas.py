import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error
import joblib
import os
from datetime import datetime, timedelta
from .config import MODELS_DIR

def preparar_features(df: pd.DataFrame) -> pd.DataFrame:
    """Prepara las variables de entrada para el modelo."""
    df = df.copy()
    df['fecha'] = pd.to_datetime(df['fecha'])
    df['anio']      = df['fecha'].dt.year
    df['mes']       = df['fecha'].dt.month
    df['dia_semana']= df['fecha'].dt.dayofweek
    df['trimestre'] = df['fecha'].dt.quarter
    df['es_fin_semana'] = (df['dia_semana'] >= 5).astype(int)

    # Ventas agrupadas por mes
    ventas_mes = df.groupby(['anio', 'mes'])['total'].sum().reset_index()
    ventas_mes.columns = ['anio', 'mes', 'total_mes']

    # Lag features (ventas mes anterior y hace 2 meses)
    ventas_mes['lag_1'] = ventas_mes['total_mes'].shift(1)
    ventas_mes['lag_2'] = ventas_mes['total_mes'].shift(2)
    ventas_mes['lag_3'] = ventas_mes['total_mes'].shift(3)
    ventas_mes['media_3m'] = ventas_mes['total_mes'].rolling(3).mean()
    ventas_mes = ventas_mes.dropna()

    return ventas_mes

def entrenar_modelo_ventas(empresa_id: int, df: pd.DataFrame) -> dict:
    """Entrena el modelo Random Forest para predicción de ventas mensuales."""

    if len(df) < 10:
        return {"error": "Se necesitan al menos 10 registros de ventas para entrenar el modelo"}

    ventas_mes = preparar_features(df)

    if len(ventas_mes) < 4:
        return {"error": "Se necesitan al menos 4 meses de historial"}

    features = ['anio', 'mes', 'lag_1', 'lag_2', 'lag_3', 'media_3m']
    X = ventas_mes[features]
    y = ventas_mes['total_mes']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)

    modelo = RandomForestRegressor(
        n_estimators=100,
        max_depth=6,
        min_samples_leaf=2,
        random_state=42
    )
    modelo.fit(X_train, y_train)

    # Evaluar modelo
    y_pred = modelo.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    score = modelo.score(X_test, y_test)

    # Guardar modelo
    path = os.path.join(MODELS_DIR, f"ventas_{empresa_id}.pkl")
    joblib.dump(modelo, path)

    return {
        "mae": round(mae, 2),
        "r2_score": round(score, 4),
        "muestras_entrenamiento": len(X_train),
        "modelo_guardado": path
    }

def predecir_ventas_proximos_meses(empresa_id: int, df: pd.DataFrame, meses: int = 3) -> list:
    """Predice las ventas para los próximos N meses."""

    path = os.path.join(MODELS_DIR, f"ventas_{empresa_id}.pkl")

    # Si no hay modelo entrenado, entrena uno
    if not os.path.exists(path):
        resultado = entrenar_modelo_ventas(empresa_id, df)
        if "error" in resultado:
            return [{"error": resultado["error"]}]

    modelo = joblib.load(path)

    ventas_mes = preparar_features(df)
    if len(ventas_mes) < 3:
        return [{"error": "Datos insuficientes para predecir"}]

    predicciones = []
    ultimas = ventas_mes.tail(3)['total_mes'].values.tolist()

    hoy = datetime.now()

    for i in range(1, meses + 1):
        fecha_pred = hoy + timedelta(days=30 * i)
        anio  = fecha_pred.year
        mes   = fecha_pred.month
        lag1  = ultimas[-1]
        lag2  = ultimas[-2]
        lag3  = ultimas[-3]
        media = np.mean(ultimas[-3:])

        features = pd.DataFrame([[anio, mes, lag1, lag2, lag3, media]],
                                 columns=['anio', 'mes', 'lag_1', 'lag_2', 'lag_3', 'media_3m'])
        valor = modelo.predict(features)[0]
        valor = max(0, valor)  # no puede ser negativo

        predicciones.append({
            "mes": mes,
            "anio": anio,
            "periodo": f"{anio}-{str(mes).zfill(2)}",
            "ventas_predichas": round(valor, 2),
            "confianza": 75.0
        })

        ultimas.append(valor)

    return predicciones