# 📚 CMPC Libros - Backend

Backend del sistema **CMPC Libros**, desarrollado con **NestJS** y **TypeScript**, que proporciona una API REST modular y escalable para la gestión de **autores**, **géneros**, **editoriales**, **libros** y **usuarios autenticados** mediante **JWT**.  

El proyecto cuenta con:
- Documentación automática con **Swagger (OpenAPI)**  
- Autenticación segura con **JWT**  
- Base de datos **PostgreSQL**  
- Contenedorización con **Docker Compose**  
- Pruebas unitarias con **Jest**  
- Código modular y fácilmente mantenible  

---

## 🚀 Tecnologías principales

| Tecnología | Uso |
|-------------|------|
| **NestJS** | Framework backend modular |
| **TypeScript** | Tipado estático y seguridad |
| **PostgreSQL** | Base de datos relacional |
| **Sequalize** | ORM para acceso a datos |
| **Swagger / OpenAPI** | Documentación interactiva |
| **JWT** | Autenticación basada en tokens |
| **Docker / Docker Compose** | Despliegue y entorno de desarrollo |
| **Jest** | Pruebas unitarias |

---

## 📁 Estructura del proyecto

cmpc-libros-backend/
├── src/
│ ├── auth/
│ │ ├── auth.controller.ts
│ │ ├── auth.service.ts
│ │ ├── dto/auth.dto.ts
│ │ └── strategies/jwt.strategy.ts
│ ├── authors/
│ │ ├── authors.controller.ts
│ │ ├── authors.service.ts
│ │ └── dto/
│ ├── genres/
│ │ ├── genres.controller.ts
│ │ ├── genres.service.ts
│ ├── publishers/
│ │ ├── publishers.controller.ts
│ │ ├── publishers.service.ts
│ ├── books/
│ │ ├── books.controller.ts
│ │ ├── books.service.ts
│ ├── app.module.ts
│ └── main.ts
├── test/
│ ├── authors.controller.spec.ts
│ ├── books.service.spec.ts
│ └── ...
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── README.md


---

## ⚙️ Instalación y configuración

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/cmpc-libros-backend.git
cd cmpc-libros-backend

2️⃣ Instalar dependencias
pnpm install

3️⃣ Crear archivo .env
# Puerto del servidor
PORT=3000

# Base de datos
DATABASE_URL=postgres://postgres:123456789@localhost:5432/db-cmpc-libros

# Entorno
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=123456789
DB_NAME=db-cmpc-libros
JWT_SECRET=change_me
JWT_EXPIRES_IN=3600s

🐳 Ejecución con Docker
1️⃣ Construir e iniciar los servicios
docker-compose up --build


Esto levantará:

🧠 NestJS Backend → http://localhost:3000

🐘 PostgreSQL Database → puerto 5432

2️⃣ Verificar contenedores
docker ps

3️⃣ (Opcional) Reiniciar entorno
docker-compose down -v && docker-compose up --build

🧠 Uso de la API

Una vez iniciado el servidor:

📍 Swagger UI:
http://localhost:3000/api

📍 API Base URL:
http://localhost:3000/

🔐 Autenticación JWT

Realiza un POST a /auth/login con las credenciales:

{
  "username": "admin",
  "password": "123456"
}


Obtendrás una respuesta con un token JWT:

{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}


Usa ese token en los encabezados:

Authorization: Bearer <token>

📘 Endpoints principales
🔑 Auth
Método	Ruta	Descripción
POST	/auth/login	Inicia sesión y devuelve token JWT.
👤 Authors
Método	Ruta	Descripción
POST	/authors	Crea un autor.
GET	/authors	Lista autores (paginación + búsqueda).
GET	/authors/:id	Obtiene un autor por ID.
PUT	/authors/:id	Actualiza un autor existente.
DELETE	/authors/:id	Elimina un autor.
🎭 Genres
Método	Ruta	Descripción
POST	/genres	Crea un género.
GET	/genres	Lista géneros.
GET	/genres/:id	Obtiene un género.
PUT	/genres/:id	Actualiza un género.
DELETE	/genres/:id	Elimina un género.
🏢 Publishers
Método	Ruta	Descripción
GET	/publishers	Lista editoriales.
GET	/publishers/:id	Obtiene una editorial.
📚 Books
Método	Ruta	Descripción
POST	/books	Crea un libro.
GET	/books	Lista libros (paginación + filtros).
GET	/books/:id	Obtiene un libro por ID.
PUT	/books/:id	Actualiza un libro.
DELETE	/books/:id	Elimina un libro.
🧾 Documentación Swagger

La documentación Swagger se genera automáticamente y puede accederse en:
👉 http://localhost:3000/api/docs

Ejemplo visual del Swagger UI
CMPC Libros API
├── /auth/login (POST)
├── /authors
│   ├── (GET) Listar autores
│   ├── (POST) Crear autor
│   ├── /:id (GET, PUT, DELETE)
├── /genres
│   ├── (GET) Listar géneros
│   ├── (POST) Crear género
├── /publishers
│   ├── (GET) Listar editoriales
│   ├── /:id (GET)
├── /books
│   ├── (GET) Listar libros
│   ├── (POST) Crear libro
│   ├── /:id (GET, PUT, DELETE)


Swagger permite probar todos los endpoints desde el navegador, incluyendo autenticación Bearer Token y envío de cuerpos JSON.

🧪 Pruebas

Ejecuta las pruebas unitarias con Jest:

pnpm run test


Para ver la cobertura:

pnpm run test:cov


Ejecutar en modo observador:

pnpm run test:ui

🧱 Arquitectura y decisiones de diseño
🔹 Modularidad

Cada entidad (authors, genres, publishers, books, auth) se implementa como módulo independiente. Esto permite escalabilidad y fácil mantenimiento.

🔹 DTOs

Cada endpoint tiene su propio DTO (Data Transfer Object) con validación y documentación Swagger integrada.

🔹 Inyección de dependencias

NestJS facilita el desacoplamiento mediante @Injectable() y el contenedor de dependencias.

🔹 Seguridad

El sistema usa JWT para autenticación y puede ampliarse con Guards para autorización por roles.

🔹 Documentación dinámica

Swagger se actualiza automáticamente según los decoradores de cada controlador (@ApiTags, @ApiOperation, @ApiResponse, etc.).

🧑‍💻 Autor

Desarrollado por:
Patricio Morales
🌐 GitHub

📧 morales.patricio1993@gmail.com

🪪 Licencia

Este proyecto está bajo licencia MIT.