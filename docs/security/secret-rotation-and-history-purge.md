# Rotación de credenciales y limpieza de historial Git

Este repositorio ya no debe versionar archivos `.env` reales ni contraseñas en `docker-compose.yml`. Si una credencial estuvo publicada en Git, trátala como comprometida aunque el archivo haya sido removido del último commit.

## 1. Rotar credenciales activas

Genera valores nuevos por ambiente y actualiza el gestor de secretos correspondiente (GitHub Actions Secrets, vault corporativo, variables del host de despliegue, etc.):

```bash
openssl rand -base64 32  # DB_PASSWORD y REDIS_PASSWORD
openssl rand -base64 64  # JWT_SECRET_EMPRESA, JWT_SECRET_ADMIN y JWT_SECRET
openssl rand -base64 32  # BOOTSTRAP_SUPER_ADMIN_SECRET y ML_SERVICE_API_KEY
```

Luego recrea los servicios con el `.env` actualizado:

```bash
docker compose down
docker compose up -d --build
```

> Si PostgreSQL o Redis ya tienen datos persistidos, cambia también la contraseña dentro del servicio antes de reiniciar clientes. Para entornos productivos, coordina una ventana de mantenimiento.

## 2. Limpiar el historial Git

La limpieza de historial reescribe SHAs. Hazlo en una rama protegida, avisa al equipo y exige que todos vuelvan a clonar o sincronicen con `git fetch --all --prune` y `git reset --hard origin/<branch>`.

### Opción recomendada: git-filter-repo

```bash
python3 -m pip install --user git-filter-repo
git clone --mirror git@github.com:ORG/REPO.git repo-clean.git
cd repo-clean.git
git filter-repo --path backend/.env --invert-paths --force
git push --force --mirror
```

### Validación posterior

```bash
git clone git@github.com:ORG/REPO.git repo-verify
cd repo-verify
if git log --all -- backend/.env | grep .; then
  echo "backend/.env aún aparece en historial" >&2
  exit 1
fi
git grep -nE '(POSTGRES_PASSWORD|REDIS_PASSWORD|DB_PASSWORD)=([^$][^[:space:]]+)' -- ':!*.example'
```

## 3. Invalidar copias derivadas

Después del `force push`:

1. Revoca tokens, contraseñas y API keys expuestas en proveedores externos.
2. Borra cachés de CI/CD y artefactos antiguos que pudieran contener `.env`.
3. Revisa forks y clones internos; el historial sensible puede sobrevivir fuera del repositorio principal.
4. Mantén la regla de CI que falla si se versiona un `.env` real o si Compose deja de usar variables de entorno.
