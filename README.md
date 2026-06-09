# Premios Oscar Frontend

Frontend del sistema de Premios Oscar. Esta construido con Next.js y consume la API del backend para autenticacion, administracion de entidades, votacion e historicos.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Base UI

## Funcionalidades principales

- login y registro
- sesion por cookie `oscar_token`
- navegacion por rol
- gestion de peliculas
- gestion de profesionales
- gestion de categorias/premios
- gestion de ceremonias
- gestion de actuaciones musicales
- votacion para miembros de academia
- consulta de auditoria para administradores
- reportes e historicos conectados a Cassandra

## Rutas principales

- `/`
- `/login`
- `/register`
- `/movies`
- `/professionals`
- `/categories`
- `/ceremonies`
- `/votes`
- `/history`
- `/audit`

## Requisitos previos

- Node.js 20 o superior
- npm
- backend levantado y funcionando

## Puerto de desarrollo

El frontend corre en:

- `http://localhost:3001`

Esto esta definido en el script:

```json
"dev": "next dev -p 3001"
```

## Configuracion requerida

Este proyecto necesita un archivo `.env` en la carpeta `TP_Premios_Oscar_Front`.

Contenido recomendado:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Importante:

- el backend debe estar efectivamente levantado en `http://localhost:8000`
- si el backend usa otro puerto, hay que actualizar `NEXT_PUBLIC_API_URL`

## Levantar el proyecto

### 1. Verificar que el backend este operativo

Antes de levantar el front, asegurate de que:

- Docker del backend este arriba
- la API responda

Chequeo rapido:

```bash
curl http://localhost:8000/health
```

### 2. Entrar a la carpeta del frontend

```bash
cd TP_Premios_Oscar_Front
```

### 3. Crear el archivo `.env`

En Windows PowerShell:

```powershell
Set-Content .env "NEXT_PUBLIC_API_URL=http://localhost:8000/api"
```

En Git Bash:

```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env
```

### 4. Instalar dependencias

```bash
npm install
```

### 5. Levantar el servidor de desarrollo

```bash
npm run dev
```

### 6. Abrir la aplicacion

Ir a:

```text
http://localhost:3001
```

## Orden recomendado de arranque del entorno completo

Si arrancas todo desde cero, el orden correcto es:

1. Levantar Docker del backend
2. Levantar backend
3. Levantar frontend

Ejemplo completo:

```bash
cd TP_Premios_Oscar_Back
docker compose up -d
npm install
npm run dev
```

En otra terminal:

```bash
cd TP_Premios_Oscar_Front
npm install
npm run dev
```

## Usuarios de prueba

Password para todos: `asd123`

- `admin@oscar.com`
- `miembro@oscar.com`
- `miembro2@oscar.com`
- `miembro3@oscar.com`
- `usuario@oscar.com`
- `usuario2@oscar.com`
- `usuario3@oscar.com`

## Notas utiles

- El frontend usa cookies HTTP-only para mantener la sesion.
- La cookie principal es `oscar_token`.
- Si reinicias Redis o el backend y queda una cookie vieja, el middleware del front la invalida automaticamente.
- Si el login no redirige correctamente, revisar primero `NEXT_PUBLIC_API_URL`.
- Si las pantallas cargan vacias o fallan requests, revisar que el backend este en `PORT=8000`.

## Scripts disponibles

- `npm run dev` -> desarrollo en `localhost:3001`
- `npm run build` -> build de produccion
- `npm run start` -> levantar build de produccion
- `npm run lint` -> lint
