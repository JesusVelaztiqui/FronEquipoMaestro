# Servidor de producción — Equipo Maestro

Todo lo que hay que saber del servidor para no tener que volver a averiguarlo.
Relevado el **2026-08-18** con `./diagnostico-servidor.sh`.

---

## Acceso

| | |
|---|---|
| Host | `45.55.201.134` (droplet de DigitalOcean, Ubuntu 24.04) |
| Usuario | `root` |
| Entrar | `ssh root@45.55.201.134` |

Hoy entra por contraseña. Conviene pasar a clave, así ningún script vuelve a
pedirla y la contraseña deja de circular:

```bash
ssh-copy-id root@45.55.201.134
```

---

## Mapa de lo que corre

| Qué | Cómo corre | Puerto |
|---|---|---|
| Frontend | archivos estáticos servidos por nginx desde `/var/www/equipomaestro` | 80 / 443 |
| Backend | proceso suelto `java -jar /opt/app/jar/EquipoMestro-0.0.1-SNAPSHOT.jar` | 9099 |
| Base | PostgreSQL 17 (`postgresql@17-main.service`) | 17010 |

### Dominios (nginx)

| Dominio | Va a |
|---|---|
| `equipomaestro.com.py` | `root /var/www/equipomaestro` |
| `backmaestro.equipomaestro.com.py` | `proxy_pass http://127.0.0.1:9099` |

Config en `/etc/nginx/sites-enabled/`. El backend tiene context-path
`/backmaestro`, por eso el front apunta a
`https://backmaestro.equipomaestro.com.py/backmaestro/`.

### Rutas importantes

| Ruta | Qué es |
|---|---|
| `/opt/app/jar/` | el `.jar` del backend y sus respaldos |
| `/opt/app/jar/app.log` | log del backend |
| `/opt/app/uploads/` | imágenes de pacientes y turnos (`pDirectorio`) |
| `/var/www/equipomaestro/` | el build del frontend publicado |
| `/root/backup_turnos_*.sql` | respaldos de base que deja el deploy |

---

## ⚠️ Dos cosas que hay que tener presentes

**1. El backend NO sobrevive a un reinicio del servidor.**
Corre suelto con `nohup`, no como servicio systemd. Lleva meses arriba porque
nadie reinició la máquina, pero si el droplet se reinicia hay que levantarlo a
mano (ver abajo). Convertirlo en servicio systemd es una mejora pendiente.

**2. El servidor no tiene maven, node ni npm, y no hay repos git.**
Por eso **todo se compila en tu Mac y se sube compilado**. No intentes hacer
`git pull` ni `mvn package` allá: no están las herramientas.

---

## Actualizar producción

Desde tu Mac, en el repo del front:

```bash
cd ~/Desktop/ProyectoApp/FronEquipoMaestro && ./deploy-produccion.sh
```

Eso hace las tres cosas: migración de base, backend y frontend. Pide la
contraseña una sola vez. También acepta partes sueltas:

```bash
./deploy-produccion.sh db      # solo la migración de base
./deploy-produccion.sh back    # solo el backend
./deploy-produccion.sh front   # solo el frontend
./deploy-produccion.sh back front
```

El script **compila primero y recién después se conecta**: si algo no compila,
producción queda intacta.

### Respaldos que deja cada corrida

Con el timestamp de esa corrida (`_20260818_143000`, por ejemplo):

- `/opt/app/jar/EquipoMestro-0.0.1-SNAPSHOT.jar.bak_<stamp>`
- `/var/www/equipomaestro.bak_<stamp>`
- `/root/backup_turnos_<stamp>.sql` (tablas `turnos` y `tratamiento`)

---

## Comandos de mano

### Ver si el backend está vivo

```bash
ssh root@45.55.201.134 "pgrep -af 'java -jar' ; ss -tln | grep 9099"
```

### Ver el log del backend

```bash
ssh root@45.55.201.134 "tail -f /opt/app/jar/app.log"
```

### Levantar el backend (después de un reinicio, o si se cayó)

```bash
ssh root@45.55.201.134 "cd /opt/app/jar && setsid nohup java -jar EquipoMestro-0.0.1-SNAPSHOT.jar >> app.log 2>&1 &"
```

### Reiniciar el backend sin desplegar nada nuevo

```bash
ssh root@45.55.201.134 "pkill -f 'java -jar /opt/app/jar/EquipoMestro-0.0.1-SNAPSHOT.jar'; sleep 3; cd /opt/app/jar && setsid nohup java -jar EquipoMestro-0.0.1-SNAPSHOT.jar >> app.log 2>&1 &"
```

### Entrar a la base

```bash
ssh root@45.55.201.134
PGPASSWORD='...' psql -h 127.0.0.1 -p 17010 -U equipo_user -d EquipoMaestro
```

### Relevar el servidor de nuevo (solo lectura)

```bash
./diagnostico-servidor.sh
```

---

## Volver atrás

### Backend

```bash
ssh root@45.55.201.134
pkill -f 'java -jar /opt/app/jar/EquipoMestro-0.0.1-SNAPSHOT.jar'
cd /opt/app/jar
cp EquipoMestro-0.0.1-SNAPSHOT.jar.bak_<stamp> EquipoMestro-0.0.1-SNAPSHOT.jar
setsid nohup java -jar EquipoMestro-0.0.1-SNAPSHOT.jar >> app.log 2>&1 &
```

Si el backend no levanta, el propio deploy te imprime este comando ya armado
con el stamp correcto.

### Frontend

```bash
ssh root@45.55.201.134 "rm -rf /var/www/equipomaestro/* && cp -a /var/www/equipomaestro.bak_<stamp>/. /var/www/equipomaestro/ && systemctl reload nginx"
```

### Base

Las migraciones corren dentro de una transacción: si fallan, no queda nada
aplicado a medias. Si igual hay que revertir datos, está el `pg_dump` de las
tablas en `/root/backup_turnos_<stamp>.sql`.

---

## Si algo no anda

| Síntoma | Dónde mirar |
|---|---|
| La web carga pero no trae datos | ¿el backend está vivo? `pgrep -af 'java -jar'` y `tail /opt/app/jar/app.log` |
| 502 en `backmaestro...` | el backend se cayó; levantarlo con el comando de arriba |
| La web quedó en blanco | `ls /var/www/equipomaestro` — si está vacío, restaurar el `.bak_<stamp>` |
| El deploy no encuentra rutas | correr `./diagnostico-servidor.sh` y comparar con este documento |
| Cambios que no se ven | caché del navegador; el build usa nombres con hash, probar recarga dura |

---

## Pendientes conocidos

- El backend debería ser un servicio `systemd` para arrancar solo tras un
  reinicio y reponerse si se cae.
- La contraseña de la base está en texto plano en `application.properties` y en
  `deploy-produccion.sh`. Debería salir de variables de entorno.
- En la config de nginx del backend hay un comentario `# ❌ Sin barra final`
  sobre el `proxy_pass`, sin resolver.
