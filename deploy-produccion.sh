#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Actualiza Equipo Maestro en producción (45.55.201.134).
#
# Cómo está armado el servidor (relevado el 2026-08-18):
#   - Backend : proceso suelto `java -jar /opt/app/jar/EquipoMestro-0.0.1-SNAPSHOT.jar`
#               en el puerto 9099. NO es un servicio systemd.
#   - Frontend: nginx sirve /var/www/equipomaestro
#   - Base    : PostgreSQL 17 en el puerto 17010
#   - El servidor NO tiene maven, node ni npm, y no hay repos git.
#     Por eso se compila acá y se suben los artefactos por scp.
#
#   ./deploy-produccion.sh              # todo (db + back + front)
#   ./deploy-produccion.sh db           # solo la migración de base
#   ./deploy-produccion.sh back         # solo el backend
#   ./deploy-produccion.sh front        # solo el frontend
#   ./deploy-produccion.sh back front   # combinables
#
# Pide la contraseña UNA sola vez (reusa la conexión SSH).
# ---------------------------------------------------------------------------

set -euo pipefail

# ----------------------------- CONFIG --------------------------------------
SERVIDOR="${SERVIDOR:-root@45.55.201.134}"

# Repos locales (el script vive en el repo del front)
AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONT_LOCAL="${FRONT_LOCAL:-$AQUI}"
BACK_LOCAL="${BACK_LOCAL:-$(cd "$AQUI/../BackEquipoMestro" 2>/dev/null && pwd || echo "")}"

# Rutas en el servidor
JAR_DIR="${JAR_DIR:-/opt/app/jar}"
JAR_NOMBRE="${JAR_NOMBRE:-EquipoMestro-0.0.1-SNAPSHOT.jar}"
WEB_ROOT="${WEB_ROOT:-/var/www/equipomaestro}"
PUERTO_BACK="${PUERTO_BACK:-9099}"

# Base de datos (igual que application.properties)
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-17010}"
DB_NAME="${DB_NAME:-EquipoMaestro}"
DB_USER="${DB_USER:-equipo_user}"
DB_PASS="${DB_PASS:-prod@jesus#ve#2026_DEs}"

MIGRACION="src/main/resources/db/2026-08-17_turno_tratamiento.sql"
# ---------------------------------------------------------------------------

AZUL="\033[1;34m"; VERDE="\033[1;32m"; ROJO="\033[1;31m"; AMAR="\033[1;33m"; OFF="\033[0m"
paso()  { echo -e "\n${AZUL}==>${OFF} $*"; }
ok()    { echo -e "${VERDE}  ✓${OFF} $*"; }
aviso() { echo -e "${AMAR}  !${OFF} $*"; }
morir() { echo -e "\n${ROJO}==> ERROR:${OFF} $*\n" >&2; exit 1; }

TAREAS=("$@")
[ ${#TAREAS[@]} -eq 0 ] && TAREAS=(db back front)
hacer() { local t="$1"; for x in "${TAREAS[@]}"; do [ "$x" = "$t" ] && return 0; done; return 1; }

STAMP="$(date +%Y%m%d_%H%M%S)"
JAR_REMOTO="$JAR_DIR/$JAR_NOMBRE"

# Una sola conexión SSH reutilizada por todo (ssh y scp).
SSH_CTL="${TMPDIR:-/tmp}/deploy-em-$$"
SSH_OPTS=(-o ConnectTimeout=15 -o ControlMaster=auto -o ControlPath="$SSH_CTL" -o ControlPersist=15m)
cerrar_ssh() { ssh -o ControlPath="$SSH_CTL" -O exit "$SERVIDOR" 2>/dev/null || true; rm -f "$SSH_CTL"; }
trap cerrar_ssh EXIT

remoto()  { ssh "${SSH_OPTS[@]}" "$SERVIDOR" "$@"; }
subir()   { scp "${SSH_OPTS[@]}" -q "$1" "$SERVIDOR:$2"; }
psql_r()  { remoto "PGPASSWORD='$DB_PASS' psql -h '$DB_HOST' -p '$DB_PORT' -U '$DB_USER' -d '$DB_NAME' $*"; }

# ======================== COMPILAR ACÁ (antes de tocar el server) ==========
# Si algo no compila, nos enteramos antes de haber modificado nada en producción.

if hacer back || hacer db; then
  [ -n "$BACK_LOCAL" ] && [ -d "$BACK_LOCAL" ] \
    || morir "no encontré el repo del backend. Poné la ruta en BACK_LOCAL."
fi

if hacer back; then
  paso "Compilando el backend acá"
  command -v mvn >/dev/null || morir "mvn no está instalado en esta Mac"
  ( cd "$BACK_LOCAL" && mvn -q -B -DskipTests clean package ) \
    || morir "falló la compilación del backend (no se tocó producción)"
  JAR_LOCAL="$BACK_LOCAL/target/$JAR_NOMBRE"
  [ -f "$JAR_LOCAL" ] || morir "no se generó $JAR_LOCAL"

  # El servidor tiene Java 21: el .class no puede ser de una versión mayor.
  VER_CLASS=$(unzip -p "$JAR_LOCAL" 'BOOT-INF/classes/EquipoMaestro/models/Turnos.class' 2>/dev/null \
              | head -c 8 | od -An -tu1 | awk 'NR==1{print $8}')
  if [ -n "${VER_CLASS:-}" ] && [ "$VER_CLASS" -gt 65 ]; then
    morir "el jar quedó en bytecode $VER_CLASS y el servidor tiene Java 21 (65). Revisá maven.compiler.release en el pom."
  fi
  ok "jar listo ($(du -h "$JAR_LOCAL" | cut -f1), bytecode ${VER_CLASS:-?} = Java $(( ${VER_CLASS:-65} - 44 )))"
fi

if hacer front; then
  paso "Compilando el frontend acá"
  command -v npm >/dev/null || morir "npm no está instalado en esta Mac"
  ( cd "$FRONT_LOCAL" && npm run build ) \
    || morir "falló el build del frontend (no se tocó producción)"
  [ -f "$FRONT_LOCAL/dist/index.html" ] || morir "no se generó $FRONT_LOCAL/dist"
  ok "dist listo ($(du -sh "$FRONT_LOCAL/dist" | cut -f1))"
fi

# ------------------------------- CONEXIÓN ----------------------------------
paso "Conectando a $SERVIDOR"
echo "  (si pide contraseña, se ingresa UNA sola vez para todo el deploy)"
remoto "echo ok" >/dev/null || morir "no pude conectar por SSH a $SERVIDOR"
ok "SSH ok"

# ------------------------------- BASE --------------------------------------
if hacer db; then
  paso "Base de datos: aplicando la migración"
  [ -f "$BACK_LOCAL/$MIGRACION" ] || morir "no encontré la migración en $BACK_LOCAL/$MIGRACION"

  remoto "PGPASSWORD='$DB_PASS' pg_dump -h '$DB_HOST' -p '$DB_PORT' -U '$DB_USER' -d '$DB_NAME' \
            -t public.turnos -t public.tratamiento -f /root/backup_turnos_${STAMP}.sql" \
    && ok "respaldo en /root/backup_turnos_${STAMP}.sql" \
    || aviso "no se pudo respaldar con pg_dump; la migración es idempotente y transaccional, sigo"

  subir "$BACK_LOCAL/$MIGRACION" "/tmp/migracion_${STAMP}.sql"
  remoto "PGPASSWORD='$DB_PASS' psql -v ON_ERROR_STOP=1 -h '$DB_HOST' -p '$DB_PORT' -U '$DB_USER' \
            -d '$DB_NAME' -f /tmp/migracion_${STAMP}.sql" \
    || morir "falló la migración (corre en una transacción: no quedó aplicada a medias)"
  remoto "rm -f /tmp/migracion_${STAMP}.sql"
  ok "migración aplicada"

  psql_r "-c \"SELECT (SELECT COUNT(*) FROM turnos WHERE tratamiento IS NOT NULL) AS turnos_con_tratamiento,
                      (SELECT COUNT(*) FROM turno_tratamiento) AS filas_detalle;\""
fi

# ------------------------------ BACKEND ------------------------------------
if hacer back; then
  paso "Backend: subiendo el jar"
  remoto "mkdir -p '$JAR_DIR'"
  remoto "[ -f '$JAR_REMOTO' ] && cp '$JAR_REMOTO' '$JAR_DIR/${JAR_NOMBRE}.bak_${STAMP}'" \
    && ok "jar anterior respaldado en $JAR_DIR/${JAR_NOMBRE}.bak_${STAMP}" \
    || aviso "no había jar previo para respaldar"

  subir "$JAR_LOCAL" "$JAR_DIR/${JAR_NOMBRE}.nuevo"
  ok "jar subido"

  paso "Backend: reiniciando el proceso"
  # El back corre suelto (no systemd): se baja el proceso viejo y se levanta el nuevo.
  PID_VIEJO="$(remoto "pgrep -f 'java -jar $JAR_REMOTO' || true" | tr -d '[:space:]')"
  if [ -n "$PID_VIEJO" ]; then
    remoto "kill $PID_VIEJO" || true
    for _ in 1 2 3 4 5 6 7 8 9 10; do
      remoto "kill -0 $PID_VIEJO 2>/dev/null" || break
      sleep 1
    done
    remoto "kill -0 $PID_VIEJO 2>/dev/null" && { remoto "kill -9 $PID_VIEJO" || true; sleep 2; }
    ok "proceso anterior detenido (PID $PID_VIEJO)"
  else
    aviso "no encontré el proceso anterior corriendo"
  fi

  remoto "mv '$JAR_DIR/${JAR_NOMBRE}.nuevo' '$JAR_REMOTO'"
  remoto "cd '$JAR_DIR' && setsid nohup java -jar '$JAR_REMOTO' >> '$JAR_DIR/app.log' 2>&1 < /dev/null &" || true

  paso "Backend: esperando que levante en el puerto $PUERTO_BACK"
  ARRIBA=0
  for _ in $(seq 1 30); do
    sleep 2
    if remoto "ss -tln | grep -q ':$PUERTO_BACK '"; then ARRIBA=1; break; fi
  done
  if [ "$ARRIBA" != "1" ]; then
    echo -e "\n${ROJO}--- últimas líneas de $JAR_DIR/app.log ---${OFF}"
    remoto "tail -n 40 '$JAR_DIR/app.log'" || true
    echo -e "\n${AMAR}Para volver al jar anterior:${OFF}"
    echo "  ssh $SERVIDOR \"pkill -f 'java -jar $JAR_REMOTO'; cp '$JAR_DIR/${JAR_NOMBRE}.bak_${STAMP}' '$JAR_REMOTO'; cd '$JAR_DIR' && setsid nohup java -jar '$JAR_REMOTO' >> app.log 2>&1 &\""
    morir "el backend no levantó"
  fi
  ok "backend escuchando en $PUERTO_BACK (PID $(remoto "pgrep -f 'java -jar $JAR_REMOTO' | head -1"))"
fi

# ------------------------------ FRONTEND -----------------------------------
if hacer front; then
  paso "Frontend: publicando en $WEB_ROOT"
  remoto "[ -d '$WEB_ROOT' ]" || morir "no existe $WEB_ROOT en el servidor"

  remoto "cp -a '$WEB_ROOT' '${WEB_ROOT}.bak_${STAMP}'" \
    && ok "sitio anterior respaldado en ${WEB_ROOT}.bak_${STAMP}" \
    || aviso "no se pudo respaldar $WEB_ROOT"

  tar -C "$FRONT_LOCAL/dist" -czf - . \
    | remoto "rm -rf '$WEB_ROOT'/* && tar -C '$WEB_ROOT' -xzf -" \
    || morir "falló la subida del frontend (el respaldo está en ${WEB_ROOT}.bak_${STAMP})"

  remoto "chown -R www-data:www-data '$WEB_ROOT'" || aviso "no pude ajustar el dueño de $WEB_ROOT"
  remoto "nginx -t >/dev/null 2>&1 && systemctl reload nginx" || aviso "no pude recargar nginx (revisá a mano)"
  ok "frontend publicado"
fi

paso "Listo"
echo -e "${VERDE}Deploy terminado.${OFF}"
echo "Probá: https://equipomaestro.com.py — calendario en el celular y un turno con dos tratamientos."
echo "Respaldos de esta corrida: sufijo _${STAMP}"
echo
