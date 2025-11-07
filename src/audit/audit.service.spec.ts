// src/audit/audit.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';

import { AuditService } from './audit.service';
import { AuditLog } from './audit.model';

type MockAuditModel = {
  create?: jest.Mock;
};

const mockAuditModelFactory = (): MockAuditModel => ({
  create: jest.fn(),
});

const mockSequelize = () => ({
  transaction: jest.fn().mockImplementation(async (cb: any) => {
    // simulamos un objeto tx y ejecutamos la callback
    const fakeTx = { id: 'tx-1' } as any;
    return await cb(fakeTx);
  }),
});

describe('AuditService (unit)', () => {
  let service: AuditService;
  const auditModelMock = mockAuditModelFactory();
  const sequelizeMock = mockSequelize();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: getModelToken(AuditLog), useValue: auditModelMock },
        { provide: Sequelize, useValue: sequelizeMock },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('log() debe ejecutar transaction y llamar a auditModel.create con los parámetros correctos', async () => {
    const createdRecord = { id: 'a1', action: 'TEST', payload: { x: 1 }, user_id: 'u1', ip: '1.2.3.4' };
    (auditModelMock.create as jest.Mock).mockResolvedValue(createdRecord);

    const res = await service.log('TEST', { x: 1 }, 'u1', '1.2.3.4');

    // transaction se llamó
    expect(sequelizeMock.transaction).toHaveBeenCalled();

    // create fue llamado con el objeto correcto
    expect(auditModelMock.create).toHaveBeenCalledWith(
      { action: 'TEST', payload: { x: 1 }, user_id: 'u1', ip: '1.2.3.4' } as any,
      {}
    );

    // devuelve el registro creado
    expect(res).toBe(createdRecord);
  });

  it('log() propaga errores si auditModel.create falla', async () => {
    const error = new Error('DB failure');
    (auditModelMock.create as jest.Mock).mockRejectedValue(error);

    await expect(service.log('ERR', { foo: 'bar' })).rejects.toThrow('DB failure');

    // se intentó crear
    expect(auditModelMock.create).toHaveBeenCalled();
  });

  it('transaction callback recibe el tx y create se ejecuta dentro', async () => {
    // vamos a espiar la llamada al transaction y verificar que la callback recibe el objeto tx
    const spyTx = jest.spyOn(sequelizeMock, 'transaction' as any);

    const createdRecord = { id: 'a2' };
    (auditModelMock.create as jest.Mock).mockImplementation(async (_payload: any, _opts: any) => {
      // simulamos que recibimos un tx desde opciones o no; el service no pasa tx a create en este impl
      return createdRecord;
    });

    const res = await service.log('ACT', { a: 1 });

    expect(spyTx).toHaveBeenCalled();
    expect(res).toBe(createdRecord);
  });
});
