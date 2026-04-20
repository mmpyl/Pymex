"""Configuración compartida para modelos de ML."""
import os

# Directorio base para modelos entrenados
MODELS_DIR = "trained_models"

# Asegurar que el directorio existe
os.makedirs(MODELS_DIR, exist_ok=True)
