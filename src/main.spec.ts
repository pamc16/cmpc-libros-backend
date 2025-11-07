// src/main.spec.ts
import { ValidationPipe } from '@nestjs/common';

jest.mock('dotenv', () => ({ config: jest.fn() }));

const mockEnableCors = jest.fn();
const mockUseGlobalPipes = jest.fn();
const mockGet = jest.fn();
const mockListen = jest.fn();
const mockUse = jest.fn();
const mockGetUrl = jest.fn();

// Mock Nest application returned by NestFactory.create
const mockApp: any = {
  enableCors: mockEnableCors,
  useGlobalPipes: mockUseGlobalPipes,
  get: mockGet,
  listen: mockListen,
  use: mockUse,
  getUrl: mockGetUrl,
};

// Mock NestFactory.create to return our mock app
jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn().mockImplementation(async () => mockApp),
  },
}));

// Mock express.static so that calling express.static(...) returns a dummy handler
jest.mock('express', () => ({
  static: jest.fn(() => 'STATIC_HANDLER'),
}));

// Ensure Sequelize class is available to be returned by app.get
class MockSequelize {
  sync = jest.fn();
}

// Prevent console.log from polluting test output and capture calls
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('main bootstrap', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env.PORT = '4000';
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

  it('falls back to default port 3000 when PORT not set', async () => {
    delete process.env.PORT;

    const sequelize = new MockSequelize();
    mockGet.mockReturnValue(sequelize);
    mockGetUrl.mockResolvedValue('http://localhost:3000');
    mockListen.mockResolvedValue(undefined);

    await jest.isolateModulesAsync(async () => {
      await require('./main');
    });

    expect(mockListen).toHaveBeenCalled();
    const listenArg = mockListen.mock.calls[0][0];
    // accept numeric or string
    expect(listenArg === '3000' || listenArg === 3000).toBeTruthy();
  });
});
