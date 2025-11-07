import { z } from "zod";

export const CreateBookSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  isbn: z.string().optional(),
  publisherId: z.string().uuid().optional(),
  price: z.number().nonnegative().optional(),
  availability: z.boolean().optional(),
  authors: z.array(z.string().uuid()).optional(),
  genres: z.array(z.string().uuid()).optional(),
});
