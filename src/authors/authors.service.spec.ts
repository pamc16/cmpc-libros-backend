// src/authors/authors.service.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/sequelize";
import { Sequelize } from "sequelize-typescript";
import { NotFoundException } from "@nestjs/common";
import { Op } from "sequelize";

import { AuthorsService } from "./authors.service";
import { Author } from "src/books/models/author.model"; // ajusta si tu path es distinto

type MockModel = {
  create?: jest.Mock;
  findAndCountAll?: jest.Mock;
  findByPk?: jest.Mock;
  findOne?: jest.Mock;
};

const mockModelFactory = (): MockModel => ({
  create: jest.fn(),
  findAndCountAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
});

const mockSequelize = () => ({
  transaction: jest.fn().mockImplementation(async (cb: any) => {
    // ejecutar callback con tx falso
    return await cb({} as any);
  }),
});

describe("AuthorsService (unit)", () => {
  let service: AuthorsService;
  const authorModelMock = mockModelFactory();
  const sequelizeMock = mockSequelize();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorsService,
        { provide: getModelToken(Author), useValue: authorModelMock },
        { provide: Sequelize, useValue: sequelizeMock },
      ],
    }).compile();

    service = module.get<AuthorsService>(AuthorsService);
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("creates an author inside a transaction and returns it", async () => {
      const payload = { name: "Isabel Allende", bio: "..." };
      const created = { id: "a1", ...payload };
      (authorModelMock.create as jest.Mock).mockResolvedValue(created);

      const res = await service.create(payload, "user-1");

      expect(sequelizeMock.transaction).toHaveBeenCalled();
      expect(authorModelMock.create).toHaveBeenCalledWith(
        payload,
        expect.any(Object)
      );
      expect(res).toBe(created);
    });
  });

  describe("findAll", () => {
    it("returns findAndCountAll result with defaults", async () => {
      const fake = { rows: [{ id: "a1" }], count: 1 };
      (authorModelMock.findAndCountAll as jest.Mock).mockResolvedValue(fake);

      const res = await service.findAll();
      expect(authorModelMock.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
          limit: 20,
          offset: 0,
          order: [["first_name", "ASC"]],
        })
      );
      expect(res).toBe(fake);
    });

    it("applies pagination params", async () => {
      (authorModelMock.findAndCountAll as jest.Mock).mockResolvedValue({
        rows: [],
        count: 0,
      });
      await service.findAll({ page: 2, limit: 5 });
      expect(authorModelMock.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 5,
          offset: 5,
        })
      );
    });

    it("applies search filter using ILIKE on name and bio", async () => {
      (authorModelMock.findAndCountAll as jest.Mock).mockResolvedValue({
        rows: [],
        count: 0,
      });
      await service.findAll({ search: "garcia" });

      expect(authorModelMock.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            [Op.or]: expect.any(Array),
          }),
        })
      );

      const calledWhere = (authorModelMock.findAndCountAll as jest.Mock).mock
        .calls[0][0].where;
      expect(Array.isArray(calledWhere[Op.or])).toBeTruthy();
      // comprobar que la ILIKE contiene la cadena buscada
      const values = calledWhere[Op.or].map((clause: any) => {
        const key = Object.keys(clause)[0];
        return clause[key][Op.iLike];
      });
      expect(values.some((v: string) => v.includes("garcia"))).toBeTruthy();
    });
  });

  describe("findOne", () => {
    it("returns author when found", async () => {
      const a = { id: "a1", name: "X" };
      (authorModelMock.findByPk as jest.Mock).mockResolvedValue(a);
      const res = await service.findOne("a1");
      expect(authorModelMock.findByPk).toHaveBeenCalledWith("a1");
      expect(res).toBe(a);
    });

    it("throws NotFoundException when not found", async () => {
      (authorModelMock.findByPk as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne("missing")).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("update", () => {
    it("updates and returns the author", async () => {
      const existing: any = {
        id: "a1",
        update: jest.fn().mockResolvedValue(undefined),
      };
      (authorModelMock.findByPk as jest.Mock).mockResolvedValue(existing);

      const dto = { name: "Nuevo" };
      const res = await service.update("a1", dto, "user-1");

      expect(sequelizeMock.transaction).toHaveBeenCalled();
      expect(authorModelMock.findByPk).toHaveBeenCalledWith(
        "a1",
        expect.any(Object)
      );
      expect(existing.update).toHaveBeenCalledWith(dto, expect.any(Object));
      expect(res).toBe(existing);
    });

    it("throws NotFoundException when author missing", async () => {
      (authorModelMock.findByPk as jest.Mock).mockResolvedValue(null);
      await expect(service.update("no", {}, "u")).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("remove", () => {
    it("destroys and returns deleted flag", async () => {
      const existing: any = {
        id: "a1",
        destroy: jest.fn().mockResolvedValue(undefined),
      };
      (authorModelMock.findByPk as jest.Mock).mockResolvedValue(existing);

      const res = await service.remove("a1", "user-1");

      expect(sequelizeMock.transaction).toHaveBeenCalled();
      expect(authorModelMock.findByPk).toHaveBeenCalledWith(
        "a1",
        expect.any(Object)
      );
      expect(existing.destroy).toHaveBeenCalledWith(expect.any(Object));
      expect(res).toEqual({ deleted: true });
    });

    it("throws NotFoundException when missing", async () => {
      (authorModelMock.findByPk as jest.Mock).mockResolvedValue(null);
      await expect(service.remove("no", "u")).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe("restore", () => {
    it("restores a soft-deleted author and returns it", async () => {
      const existing: any = {
        id: "a1",
        restore: jest.fn().mockResolvedValue(undefined),
      };
      (authorModelMock.findOne as jest.Mock).mockResolvedValue(existing);

      const res = await service.restore("a1", "user-1");

      expect(sequelizeMock.transaction).toHaveBeenCalled();
      expect(authorModelMock.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "a1" },
          paranoid: false,
          transaction: expect.any(Object),
        })
      );
      expect(existing.restore).toHaveBeenCalledWith(
        expect.objectContaining({ transaction: expect.any(Object) })
      );
      expect(res).toBe(existing);
    });

    it("throws NotFoundException when missing", async () => {
      (authorModelMock.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.restore("no", "u")).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
