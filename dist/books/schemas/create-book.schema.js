"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBookSchema = void 0;
const zod_1 = require("zod");
exports.CreateBookSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    subtitle: zod_1.z.string().optional(),
    isbn: zod_1.z.string().optional(),
    publisherId: zod_1.z.string().uuid().optional(),
    price: zod_1.z.number().nonnegative().optional(),
    availability: zod_1.z.boolean().optional(),
    authors: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    genres: zod_1.z.array(zod_1.z.string().uuid()).optional(),
});
//# sourceMappingURL=create-book.schema.js.map