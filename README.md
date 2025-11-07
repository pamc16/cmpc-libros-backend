# CMPC-libros Backend (scaffold)

NestJS + Sequelize + PostgreSQL project scaffold with:
- Modular architecture (books, auth, audit)
- JWT authentication
- Sequelize (sequelize-typescript)
- Zod validations for requests (ZodValidationPipe)
- CSV export streaming example
- Soft delete (paranoid) configured on Book model
- Audit logging model and service

## How to use

1. Copy `.env.example` to `.env` and set credentials.
2. Install deps:
   ```
   npm install
   ```
3. Start dev:
   ```
   npm run start:dev
   ```

Notes:
- This is a scaffold. Run migrations or use `sequelize.sync()` in development.
- The project includes a custom Zod validation pipe used in controllers.

