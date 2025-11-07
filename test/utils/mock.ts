// src/test/utils/mocks.ts
import { Sequelize } from 'sequelize-typescript';

export const mockModel = () => ({
  create: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  findAndCountAll: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  bulkCreate: jest.fn(),
  restore: jest.fn(),
});

export const mockSequelize = () => ({
  transaction: jest.fn().mockImplementation((cb) => {
    // simulate transaction by calling cb with a fake tx object
    const fakeTx = {};
    return Promise.resolve(cb(fakeTx));
  }),
});
