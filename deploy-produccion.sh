#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Actualiza Equipo Maestro en producción: base de datos, backend y frontend.
#
#   ./deploy-produccion.sh              # todo (db + back + front)
#   ./deploy-produccion.sh db           # solo la migración de base
#   ./deploy-produccion.sh back         # solo el backend
#   ./deploy-produccion.sh front        # solo el frontend
#   ./deploy-produccion.sh back front   # combinables
#
# Se corre desde tu Mac. Entra por SSH al servidor, trae la rama `produccion`
# de cada repo, aplica la migración SQL, compila y reinicia.
#
# Si alguna ruta no coincide con tu servidor, el script te lo dice y te muestra
# lo que encontró; ajustá las variables de CONFIG y volvé a correrlo.
# ---------------------------------------------------------------------------

set -euo pipefail

# ----------------------------- CONFIG --------------------------------------
SERVIDOR="${SERVIDOR:-root@45.55.201.134}"
RAMA="${RAMA:-produccion}"

# Rutas en el servidor
BACK_DIR="${BACK_DIR:-/opt/app/BackEquipoMaestro}"
FRONT_DIR="${FRONT_DIR:-/opt/app/fronApp}"
WEB_ROOT="${WEB_ROOT:-/var/www/equipomaestro}"   # donde nginx sirve el build del front

# Servicio systemd del backend
SERVICIO="${SERVICIO:-backmaestro}"

# Base de datos (mismos valores que application.properties)
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-17010}"
DB_NAME="${DB_NAME:-EquipoMaestro}"
DB_USER="${DB_USER:-equipo_user}"
DB_PASS="${DB_PASS:-prod@jesus#ve#2026_DEs}"

# Migración a aplicar (ruta relativa dentro del repo del backend)
MIGRACION="src/main/resources/db/2026-08-17_turno_tratamiento.sql"
# ---------------------------------------------------------------------------

AZUL="\033[1;34m"; VERDE="\033[1;32m"; ROJO="\033[1;31m"; AMAR="\033[1;33m"; OFF="\033[0m"
paso()  { echo -e "\n${AZUL}==>${OFF} $*"; }
ok()    { echo -e "${VERDE}  ✓${OFF} $*"; }
aviso() { echo -e "${AMAR}  !${OFF} $*"; }
morir() { echo -e "\n${ROJO}==> ERROR:${OFF} $*\n" >&2; exit 1; }

TAREAS=("$@")
[ ${#TAREAS[@]} -eq 0 ] && TAREAS=(db back front)

hacer() {
  local t="$1"
  for x in "${TAREAS[@]}"; do [ "$x" = "$t" ] && return 0; done
  return 1
}

remoto() { ssh -o ConnectTimeout=15 "$SERVIDOR" "$@"; }

# --------------------------- verificaciones --------------------------------
paso "Conectando a $SERVIDOR"
remoto "echo conectado" >/dev/null || morir "no pude conectar por SSH a $SERVIDOR"
ok "SSH ok"

paso "Verificando rutas en el servidor"
FALTA=0
if hacer back || hacer db; then
  remoto "[ -d '$BACK_DIR/.git' ]" || { aviso "no existe el repo del backend en $BACK_DIR"; FALTA=1; }
fi
if hacer front; then
  remoto "[ -d '$FRONT_DIR/.git' ]" || { aviso "no existe el repo del frontend en $FRONT_DIR"; FALTA=1; }
  remoto "[ -d '$WEB_ROOT' ]"       || { aviso "no existe el web root $WEB_ROOT"; FALTA=1; }
fi
if [ "$FALTA" = "1" ]; then
  echo -e "\n${AMAR}Repos git que encontré en el servidor:${OFF}"
  remoto "find /opt /var/www /root /home -maxdepth 4 -name .git -type d 2>/dev/null | sed 's#/.git\$##'" || true
  echo -e "\n${AMAR}Servicios systemd que parecen la app:${OFF}"
  remoto "systemctl list-units --type=service --no-pager --no-legend 2>/dev/null | grep -iE 'back|maestro|equipo|java' || true"
  morir "ajustá BACK_DIR / FRONT_DIR / WEB_ROOT arriba en el script y volvé a correrlo"
fi
ok "rutas ok"

# ------------------------------- BASE --------------------------------------
if hacer db; then
  paso "Base de datos: trayendo el repo del backend y aplicando la migración"
  remoto "cd '$BACK_DIR' && git fetch origin '$RAMA' && git checkout '$RAMA' && git reset --hard 'origin/$RAMA'"
  remoto "[ -f '$BACK_DIR/$MIGRACION' ]" || morir "no encontré la migración en $BACK_DIR/$MIGRACION"

  remoto "command -v psql >/dev/null" \
    || morir "psql no está instalado en el servidor. Instalalo con: apt-get install -y postgresql-client"

  # Respaldo de las tablas que toca la migración, por si hay que volver atrás.
  STAMP="$(date +%Y%m%d_%H%M%S)"
  remoto "PGPASSWORD='$DB_PASS' pg_dump -h '$DB_HOST' -p '$DB_PORT' -U '$DB_USER' -d '$DB_NAME' \
            -t public.turnos -t public.tratamiento \
            -f /root/backup_turnos_${STAMP}.sql" \
    && ok "respaldo en /root/backup_turnos_${STAMP}.sql" \
    || aviso "no se pudo hacer el respaldo (pg_dump); la migración es idempotente, sigo igual"

  remoto "PGPASSWORD='$DB_PASS' psql -v ON_ERROR_STOP=1 -h '$DB_HOST' -p '$DB_PORT' -U '$DB_USER' -d '$DB_NAME' \
            -f '$BACK_DIR/$MIGRACION'" \
    || morir "falló la migración SQL (no se aplicó nada: corre dentro de una transacción)"
  ok "migración aplicada"

  remoto "PGPASSWORD='$DB_PASS' psql -h '$DB_HOST' -p '$DB_PORT' -U '$DB_USER' -d '$DB_NAME' -c \
    \"SELECT (SELECT COUNT(*) FROM turnos WHERE tratamiento IS NOT NULL) AS turnos_con_tratamiento, \
             (SELECT COUNT(*) FROM turno_tratamiento) AS filas_detalle;\""
fi

# ------------------------------ BACKEND ------------------------------------
if hacer back; then
  paso "Backend: actualizando y compilando"
  remoto "cd '$BACK_DIR' && git fetch origin '$RAMA' && git checkout '$RAMA' && git reset --hard 'origin/$RAMA'"
  ok "código actualizado ($(remoto "cd '$BACK_DIR' && git log -1 --format='%h %s'"))"

  MVN_CMD="./mvnw"
  remoto "[ -f '$BACK_DIR/.mvn/wrapper/maven-wrapper.properties' ]" || MVN_CMD="mvn"
  remoto "cd '$BACK_DIR' && $MVN_CMD -q -B -DskipTests clean package" \
    || morir "falló la compilación del backend (no se reinició nada, el servicio sigue con la versión anterior)"
  ok "jar compilado"

  paso "Backend: reiniciando servicio $SERVICIO"
  remoto "systemctl restart '$SERVICIO'" || morir "no pude reiniciar $SERVICIO"
  sleep 6
  remoto "systemctl is-active --quiet '$SERVICIO'" \
    || { remoto "journalctl -u '$SERVICIO' -n 40 --no-pager"; morir "$SERVICIO no quedó levantado"; }
  ok "$SERVICIO activo"
fi

# ------------------------------ FRONTEND -----------------------------------
if hacer front; then
  paso "Frontend: actualizando y compilando"
  remoto "cd '$FRONT_DIR' && git fetch origin '$RAMA' && git checkout '$RAMA' && git reset --hard 'origin/$RAMA'"
  ok "código actualizado ($(remoto "cd '$FRONT_DIR' && git log -1 --format='%h %s'"))"

  remoto "cd '$FRONT_DIR' && (npm ci || npm install) && npm run build" \
    || morir "falló el build del frontend (no se tocó $WEB_ROOT)"
  ok "build generado"

  paso "Frontend: publicando en $WEB_ROOT"
  STAMP="$(date +%Y%m%d_%H%M%S)"
  remoto "cp -a '$WEB_ROOT' '${WEB_ROOT}.bak_${STAMP}'" \
    && ok "respaldo del sitio anterior en ${WEB_ROOT}.bak_${STAMP}" \
    || aviso "no se pudo respaldar $WEB_ROOT"
  remoto "rm -rf '$WEB_ROOT'/* && cp -a '$FRONT_DIR/dist/.' '$WEB_ROOT/'"
  remoto "nginx -t && systemctl reload nginx" || aviso "no pude recargar nginx (revisá a mano)"
  ok "frontend publicado"
fi

paso "Listo"
echo -e "${VERDE}Deploy terminado.${OFF} Entrá a la app y probá: calendario en el celular y un turno con dos tratamientos.\n"
