import { createSequelizeInstance } from "./database.config";

describe('createSequelizeInstance', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // clear module cache if needed
    process.env = { ...ORIGINAL_ENV };
    jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    (console.debug as jest.Mock).mockRestore();
  });

  it('returns config with defaults when env vars are not set', () => {
    delete process.env.DB_HOST;
    delete process.env.DB_PORT;
    delete process.env.DB_USER;
    delete process.env.DB_PASS;
    delete process.env.DB_NAME;

    const cfg = createSequelizeInstance();

    expect(cfg.dialect).toBe('postgres');
    expect(cfg.host).toBe('localhost');
    expect(cfg.port).toBe(5432);
    expect(cfg.username).toBe('postgres');
    expect(cfg.password).toBe('123456789');
    expect(cfg.database).toBe('db-cmpc-libros');

    // models should include known model class names
    const modelNames = (cfg.models || []).map((m: any) => m.name);
    expect(modelNames).toEqual(expect.arrayContaining(['Book', 'Author', 'Publisher', 'Genre', 'Inventory', 'AuditLog', 'BookAuthor', 'BookGenre', 'BookPublisher']));

    // other options
    expect(cfg.autoLoadModels).toBe(true);
    expect(cfg.synchronize).toBe(false);
    expect(typeof cfg.logging).toBe('function');
    expect(cfg.pool).toMatchObject({ max: 10, min: 0, acquire: 30000, idle: 10000 });
    expect(cfg.define).toMatchObject({ underscored: true, timestamps: true });
  });

  it('respects environment variables when provided and logging calls console.debug', () => {
    process.env.DB_HOST = 'db.example.com';
    process.env.DB_PORT = '6543';
    process.env.DB_USER = 'myuser';
    process.env.DB_PASS = 'secret';
    process.env.DB_NAME = 'mydb';

    const cfg = createSequelizeInstance();

    expect(cfg.host).toBe('db.example.com');
    expect(cfg.port).toBe(6543);
    expect(cfg.username).toBe('myuser');
    expect(cfg.password).toBe('secret');
    expect(cfg.database).toBe('mydb');

    // Call logging to ensure it uses console.debug
    (cfg.logging as Function)('test-message');
    expect(console.debug).toHaveBeenCalledWith('[sequelize]', 'test-message');
  });
});
