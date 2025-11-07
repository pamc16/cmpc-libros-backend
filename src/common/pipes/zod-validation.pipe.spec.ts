// src/common/pipes/zod-validation.pipe.spec.ts
import { BadRequestException } from "@nestjs/common";
import { z, ZodError, type ZodSchema } from "zod";
import { ZodValidationPipe } from "./zod-validation.pipe";

describe("ZodValidationPipe", () => {
  const schema = z.object({
    name: z.string().min(1, "name-required"),
    age: z.number().int().positive("age-positive"),
  });

  it("should parse valid input and return parsed value", () => {
    const pipe = new ZodValidationPipe(schema);
    const input = { name: "Alice", age: 30 };
    const res = pipe.transform(input);
    expect(res).toEqual(input);
  });

  it("should throw BadRequestException with mapped errors when ZodError occurs", () => {
    const pipe = new ZodValidationPipe(schema);
    // invalid input: name empty, age negative -> two errors
    const badInput = { name: "", age: -5 };

    try {
      pipe.transform(badInput);
      fail("Expected BadRequestException to be thrown");
    } catch (err: any) {
      expect(err).toBeInstanceOf(BadRequestException);

      // Nest puede envolver la respuesta de varias formas:
      // 1) lanzamos BadRequestException(array) -> err.getResponse() === array
      // 2) Nest muestra { statusCode, message, error } -> err.getResponse().message === array
      const rawResp = err.getResponse();
      let arr: any[] = [];

      if (Array.isArray(rawResp)) {
        arr = rawResp;
      } else if (rawResp && Array.isArray((rawResp as any).message)) {
        arr = (rawResp as any).message;
      } else if (
        rawResp &&
        (rawResp as any).message &&
        typeof (rawResp as any).message === "string"
      ) {
        // Algunas configuraciones ponen un string con detalles; fallback simple:
        // intentar parsear si contiene json (poco frecuente)
        try {
          const maybe = JSON.parse((rawResp as any).message);
          if (Array.isArray(maybe)) arr = maybe;
        } catch {
          // ignore
        }
      }

      // ahora assert más flexible sobre arr
      expect(Array.isArray(arr)).toBe(true);
      // debe tener al menos dos errores (name y age)
      const paths = arr.map((e: any) =>
        Array.isArray(e.path) ? e.path.join(".") : String(e.path)
      );
      expect(paths).toContain("name");
      expect(paths).toContain("age");

      const messages = arr.map((e: any) => e.message || e);
      expect(
        messages.some(
          (m: string) =>
            m.includes("name-required") || m.toLowerCase().includes("name")
        )
      ).toBeTruthy();
      expect(
        messages.some(
          (m: string) =>
            m.includes("age-positive") || m.toLowerCase().includes("age")
        )
      ).toBeTruthy();
    }
  });

  it("should rethrow non-Zod errors thrown by schema.parse", () => {
    // crear un "schema" mock que lanza un error distinto a ZodError
    const badSchema = {
      parse: jest.fn().mockImplementation(() => {
        throw new Error("boom!");
      }),
    } as unknown as ZodSchema<any>;

    const pipe = new ZodValidationPipe(badSchema);
    expect(() => pipe.transform({})).toThrow("boom!");
  });
});
