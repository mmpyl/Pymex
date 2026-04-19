import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.routes.predicciones import router as predicciones_router

app = FastAPI(
    title="SaaS PYMES — ML Service",
    description="Microservicio de Machine Learning para predicciones",
    version="1.0.0"
)

allowed_origins = os.getenv("ML_ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],      # solo los métodos que usa el backend
    allow_headers=["Content-Type", "Authorization"],
)


@app.middleware('http')
async def enforce_ml_api_key(request: Request, call_next):
    if not request.url.path.startswith('/api/'):
        return await call_next(request)

    expected_api_key = os.getenv('ML_SERVICE_API_KEY')
    if not expected_api_key:
        return JSONResponse(
            status_code=503,
            content={'error': 'ML_SERVICE_API_KEY no está configurada en el entorno'}
        )

    request_api_key = request.headers.get('x-ml-api-key')
    if request_api_key != expected_api_key:
        return JSONResponse(status_code=401, content={'error': 'API key inválida'})

    return await call_next(request)


app.include_router(predicciones_router, prefix="/api")


@app.get("/")
def health():
    return {"estado": "ML Service activo ✅", "version": "1.0.0"}
