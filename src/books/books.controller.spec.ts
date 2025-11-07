// src/books/books.controller.spec.ts
import "reflect-metadata";
import { Test, TestingModule } from "@nestjs/testing";
import { BooksController } from "./books.controller";
import { BooksService } from "./books.service";
import {
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { PassThrough } from "stream";

// mockear streamBooksToCsv (import relativo igual que en el controller)
jest.mock("../utils/csv", () => ({
  streamBooksToCsv: jest.fn(),
}));
import { streamBooksToCsv } from "../utils/csv";

describe("BooksController (unit)", () => {
  let controller: BooksController;
  let booksServiceMock: Partial<Record<keyof BooksService, jest.Mock>>;

  beforeEach(async () => {
    booksServiceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      restore: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [{ provide: BooksService, useValue: booksServiceMock }],
    }).compile();

    controller = module.get<BooksController>(BooksController);
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should call booksService.create with parsed arrays and image URL when file provided", async () => {
      const files = {
        image: [
          {
            originalname: "a.png",
            filename: "file.png",
            path: "/tmp/file.png",
          },
        ],
      };
      const body = {
        title: "T",
        authors: JSON.stringify(["a1"]),
        genres: JSON.stringify(["g1"]),
        publishers: JSON.stringify(["p1"]),
      };
      const req: any = { user: { id: "user-1" }, headers: {} };
      const created = { id: "b1", title: "T" };
      (booksServiceMock.create as jest.Mock).mockResolvedValue(created);

      const res = await controller.create(files as any, body as any, req);

      expect(booksServiceMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "T",
          authors: ["a1"],
          genres: ["g1"],
          publishers: ["p1"],
          image: "/uploads/books/file.png",
        }),
        "user-1"
      );
      expect(res).toBe(created);
    });

    it("should call booksService.create when no file provided and set image null", async () => {
      const files = {};
      const body = {
        title: "NoFile",
        authors: JSON.stringify([]),
        genres: JSON.stringify([]),
        publishers: JSON.stringify([]),
      };
      const req: any = { user: { id: "u2" }, headers: {} };
      (booksServiceMock.create as jest.Mock).mockResolvedValue({ id: "b2" });

      const res = await controller.create(files as any, body as any, req);
      expect(booksServiceMock.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: "NoFile", image: null }),
        "u2"
      );
      expect(res).toEqual({ id: "b2" });
    });

    it("should throw BadRequestException when body JSON is invalid (SyntaxError)", async () => {
      const files = {};
      const body = { authors: '["bad', genres: "[]", publishers: "[]" }; // invalid JSON
      const req: any = { user: { id: "u3" }, headers: {} };

      await expect(
        controller.create(files as any, body as any, req)
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(booksServiceMock.create).not.toHaveBeenCalled();
    });

    it("should wrap unexpected errors as InternalServerErrorException", async () => {
      const files = {};
      const body = {
        authors: JSON.stringify([]),
        genres: JSON.stringify([]),
        publishers: JSON.stringify([]),
      };
      const req: any = { user: { id: "u4" }, headers: {} };
      (booksServiceMock.create as jest.Mock).mockRejectedValue(
        new Error("BOOM")
      );

      await expect(
        controller.create(files as any, body as any, req)
      ).rejects.toBeInstanceOf(InternalServerErrorException);
    });
  });

  describe("findAll", () => {
    it("should call booksService.findAll with default params", () => {
      (booksServiceMock.findAll as jest.Mock).mockReturnValue({
        rows: [],
        count: 0,
      });

      controller.findAll(
        1,
        20,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
      expect(booksServiceMock.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 20,
          title: undefined,
          genre: undefined,
          publisher: undefined,
          author: undefined,
          availability: undefined,
          sort: [],
        })
      );
    });

    it("should coerce availability strings and pass boolean", () => {
      (booksServiceMock.findAll as jest.Mock).mockReturnValue({
        rows: [],
        count: 0,
      });

      controller.findAll(
        1,
        20,
        undefined,
        undefined,
        undefined,
        undefined,
        "true",
        undefined
      );
      expect(booksServiceMock.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ availability: true })
      );

      controller.findAll(
        1,
        20,
        undefined,
        undefined,
        undefined,
        undefined,
        "false",
        undefined
      );
      expect(booksServiceMock.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ availability: false })
      );
    });

    it("should throw BadRequestException for invalid availability value", () => {
      expect(() =>
        controller.findAll(
          1,
          20,
          undefined,
          undefined,
          undefined,
          undefined,
          "invalid",
          undefined
        )
      ).toThrow(BadRequestException);
    });

    it("should parse valid sort string and include array in opts", () => {
      (booksServiceMock.findAll as jest.Mock).mockReturnValue({
        rows: [],
        count: 0,
      });

      const sort = "title:asc,price:desc";
      controller.findAll(
        1,
        20,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        sort
      );

      expect(booksServiceMock.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          sort: expect.arrayContaining([
            expect.objectContaining({ field: "title", dir: "asc" }),
            expect.objectContaining({ field: "price", dir: "desc" }),
          ]),
        })
      );
    });

    it("should throw when sort field is not allowed", () => {
      expect(() =>
        controller.findAll(
          1,
          20,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          "badfield:asc"
        )
      ).toThrow(BadRequestException);
    });

    it("should throw when sort direction invalid", () => {
      expect(() =>
        controller.findAll(
          1,
          20,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          "title:bad"
        )
      ).toThrow(BadRequestException);
    });
  });

  describe("exportCsv", () => {
    it("should set headers and pipe stream to response", async () => {
      // usar un PassThrough como response (es writable) y agregar setHeader mock
      const resMock: any = new PassThrough();
      resMock.setHeader = jest.fn();

      // stream devuelto por streamBooksToCsv (otro PassThrough)
      const stream = new PassThrough();
      const pipeSpy = jest.spyOn(stream, "pipe");
      (streamBooksToCsv as jest.Mock).mockResolvedValue(stream);

      await controller.exportCsv(resMock, "abc");

      expect(resMock.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "text/csv"
      );
      expect(resMock.setHeader).toHaveBeenCalledWith(
        "Content-Disposition",
        `attachment; filename="books.csv"`
      );
      expect(streamBooksToCsv).toHaveBeenCalledWith(booksServiceMock, {
        title: "abc",
      });
      expect(pipeSpy).toHaveBeenCalledWith(resMock);

      pipeSpy.mockRestore();
    });
  });

  describe("findOne / update / remove / restore", () => {
    it("findOne should call service.findOne", () => {
      (booksServiceMock.findOne as jest.Mock).mockReturnValue({ id: "b1" });
      const res = controller.findOne("b1");
      expect(booksServiceMock.findOne).toHaveBeenCalledWith("b1");
      expect(res).toEqual({ id: "b1" });
    });

    it("update should parse arrays and call service.update with userId", () => {
      const body = {
        title: "X",
        authors: JSON.stringify(["a1"]),
        genres: JSON.stringify(["g1"]),
        publishers: JSON.stringify(["p1"]),
      };
      const req: any = { user: { id: "u100" } };
      (booksServiceMock.update as jest.Mock).mockReturnValue({ id: "b-upd" });

      const res = controller.update("b1", body as any, req);
      expect(booksServiceMock.update).toHaveBeenCalledWith(
        "b1",
        expect.objectContaining({
          title: "X",
          authors: ["a1"],
          genres: ["g1"],
          publishers: ["p1"],
        }),
        "u100"
      );
      expect(res).toEqual({ id: "b-upd" });
    });

    it("remove should call service.remove with userId", () => {
      const req: any = { user: { id: "uDel" } };
      (booksServiceMock.remove as jest.Mock).mockReturnValue({ deleted: true });

      const res = controller.remove("b2", req);
      expect(booksServiceMock.remove).toHaveBeenCalledWith("b2", "uDel");
      expect(res).toEqual({ deleted: true });
    });

    it("restore should call service.restore with userId", () => {
      const req: any = { user: { id: "uR" } };
      (booksServiceMock.restore as jest.Mock).mockReturnValue({ id: "bR" });

      const res = controller.restore("b3", req);
      expect(booksServiceMock.restore).toHaveBeenCalledWith("b3", "uR");
      expect(res).toEqual({ id: "bR" });
    });
  });
});
