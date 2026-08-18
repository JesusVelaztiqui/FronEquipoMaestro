#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Solo LEE el servidor para descubrir cómo está desplegada la app.
# No modifica nada. Pide la contraseña una vez.
#
#   ./diagnostico-servidor.sh
#   ./diagnostico-servidor.sh > diagnostico.txt   # para pegarlo después
# ---------------------------------------------------------------------------
set -uo pipefail
SERVIDOR="${SERVIDOR:-root@45.55.201.134}"

ssh -o ConnectTimeout=15 "$SERVIDOR" 'bash -s' <<'REMOTO'
set -uo pipefail
tit() { printf '\n===== %s =====\n' "$1"; }

tit "Puertos escuchando (busco 9099 del back y 80/443 del front)"
(ss -tlnp 2>/dev/null || netstat -tlnp 2>/dev/null) | head -40

tit "Procesos java / node"
ps -eo pid,etime,args | grep -iE '[j]ava|[n]ode' | head -20

tit "Docker"
if command -v docker >/dev/null; then
  docker ps -a --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}' 2>/dev/null | head -20
  echo "--- compose files:"
  find / -xdev \( -name 'docker-compose*.y*ml' -o -name 'compose.y*ml' \) 2>/dev/null | head -20
else
  echo "docker no instalado"
fi

tit "Servicios systemd habilitados (no del sistema)"
systemctl list-units --type=service --state=running --no-pager --no-legend 2>/dev/null \
  | grep -viE 'systemd|dbus|cron|ssh|rsyslog|polkit|udev|getty|networkd|resolved|snapd|unattended|multipathd|irqbalance|accounts|chrony|packagekit' \
  | head -25

tit "Archivos .jar en el servidor"
find / -xdev -name '*.jar' -not -path '*/.m2/*' -not -path '*/node_modules/*' 2>/dev/null | head -20

tit "Repos git"
find / -xdev -name .git -maxdepth 7 -type d 2>/dev/null | sed 's#/\.git$##' | head -20

tit "Raíces que sirve nginx"
if [ -d /etc/nginx ]; then
  grep -rhnE '^\s*(root|server_name|proxy_pass)' /etc/nginx/sites-enabled /etc/nginx/conf.d 2>/dev/null | head -30
else
  echo "sin /etc/nginx"
fi

tit "Contenido de /opt y /var/www"
ls -la /opt /var/www 2>/dev/null | head -30

tit "Postgres en 17010"
(ss -tlnp 2>/dev/null | grep 17010) || echo "nada escuchando en 17010"
command -v psql >/dev/null && echo "psql: instalado ($(psql --version))" || echo "psql: NO instalado"

tit "Herramientas de build"
for c in git mvn java node npm nginx; do
  printf '%-6s ' "$c"
  command -v "$c" >/dev/null && ("$c" --version 2>&1 | head -1) || echo "no instalado"
done
REMOTO
