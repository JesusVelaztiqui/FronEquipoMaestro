# Frontend — Equipo Maestro

React 19 + Vite 7, SCSS plano (sin framework de UI). Se compila acá y se sube
compilado al servidor.

Documentos hermanos:
- [`SERVIDOR.md`](SERVIDOR.md) — cómo está armado el servidor
- `DESPLIEGUE.md` del repo `BackEquipoMestro` — el backend

---

## Actualizar producción (lo que vas a usar el 99% de las veces)

```bash
cd ~/Desktop/ProyectoApp/FronEquipoMaestro && ./deploy-produccion.sh
```

Actualiza **todo**: base, backend y frontend. Una sola contraseña.
Para subir solo el front:

```bash
./deploy-produccion.sh front
```

El script compila primero; si el build falla, no toca producción.

---

## Trabajar en local

```bash
npm install
npm run dev          # http://localhost:5173
```

> **Ojo con el puerto 5173.** En esta Mac suele estar ocupado por el dev server
> de otro proyecto (DentalSoft, en `~/Desktop/Zentra Solutions`). Si al abrir
> `localhost:5173` ves otro login, es eso. Cerrá el otro server o usá
> `npm run dev -- --port 5175`.

| Comando | Qué hace |
|---|---|
| `npm run dev` | dev server con hot reload |
| `npm run build` | build de producción en `dist/` |
| `npm run preview` | sirve el `dist/` ya compilado |
| `npm run lint` | eslint |

Node en uso: **v22**.

---

## Configuración

La URL del backend sale de `VITE_BASEURL`:

| Archivo | Valor |
|---|---|
| `.env.Local` | `https://backmaestro.equipomaestro.com.py/backmaestro/` |
| `.env.production` | `https://backmaestro.equipomaestro.com.py/backmaestro/` |

Hoy los dos apuntan a producción: **desarrollando en local pegás contra la base
real**. Si querés un backend local, cambiá `.env.Local` a
`http://localhost:9099/backmaestro/`.

> **Trampa**: el archivo se llama `.env.Local` con L mayúscula, pero Vite busca
> `.env.local`. Funciona sólo porque el disco de la Mac es *case-insensitive*.
> En un filesystem case-sensitive (cualquier Linux) el dev server quedaría con
> `VITE_BASEURL` en `undefined`. Si algún día se compila en Linux, renombralo a
> minúsculas. El build de producción no depende de esto: usa `.env.production`.

Todas las URLs de la API están centralizadas en `src/services/urls.js`. No
armes URLs sueltas en las páginas.

---

## Estructura

```
src/
  pages/       una pantalla por archivo (Turnos, Pacientes, Caja, ...)
  components/  reutilizables (Tooltip/toasts, ModalDelete, NoEmpty, Formatos)
  layouts/     armazón con sidebar
  routes/      ruteo y guardas por rol
  services/    api.js (fetch + token) y urls.js (endpoints)
  hooks/       LoaderManager y demás
  styles/      un .scss por pantalla + variables.scss
  store/       estado global (zustand)
```

Convenciones que ya usa el código y conviene seguir:

- **Colores y tipografía**: variables CSS en `src/styles/variables.scss`
  (`--color-primario`, `--color-secundario`, `--color-fondo`, ...). No hardcodear.
- **Avisos al usuario**: `addToast({ type, title, message, duration })` de
  `components/Tooltip`. No `alert()`.
- **Campos obligatorios**: atributo `NoEmpty` en el input + `validate()` del
  hook `NoEmpty`.
- **Plata**: `formatNumerico()` para mostrar y `desformatear()` para leer. Los
  importes son enteros en guaraníes, sin decimales.
- **Fechas**: `formatoFecha()` / `formatearFechaHora()` de `components/Formatos`.

---

## Turnos: varios tratamientos por turno

Desde agosto 2026 un turno puede tener **1..N tratamientos**.

- El tratamiento **no es un select**: se eligen desde un modal de cards con
  multi-selección (`ModalTratamientos`, dentro de `src/pages/Turnos.jsx`).
- **Importe Total es único**: la suma de los tratamientos elegidos, read-only.
- Se **duplican por tratamiento**: *Porcentaje a descontar*, *Importe Recibido*,
  *Importe Laboratorio* y *Saldo*, cada bloque titulado con su tratamiento.
- El tope del importe recibido es el saldo pendiente **de ese** tratamiento
  (`saldoBase`). Al editar un turno se le devuelve lo ya cobrado en ese mismo
  turno, si no aparecería un tope falso.
- Al guardar se manda `tratamientos: [...]` con el detalle; los totales de
  cabecera van igual, pero **el back los recalcula** a partir del detalle.

---

## Calendario

`.cal-grid` usa `grid-template-columns: repeat(7, minmax(0, 1fr))`, **no `1fr`**.
Con `1fr` la pista no puede achicarse por debajo de su contenido, así que los
chips (hora + nombre del paciente) ensanchan la grilla y en móvil se corta la
columna del sábado. Las celdas llevan `min-width: 0` por lo mismo.

Si tocás los chips del calendario, probá siempre a 375px de ancho.

---

## Antes de subir

```bash
npm run lint
npm run build
```

`npm run lint` marca dos errores viejos en `Turnos.jsx` (`importetotal` y
`saldo` sin usar, de un destructuring a propósito). No son de tu cambio.
