import { PassThrough } from 'stream';
import * as fastcsv from 'fast-csv';
import { BooksService } from '../books/books.service';

export async function streamBooksToCsv(booksService: BooksService, opts?: { title?: string }) {
  const pass = new PassThrough();
  const csvStream = fastcsv.format({ headers: true });
  csvStream.pipe(pass);

  const pageSize = 500;
  let page = 1;
  while (true) {
    const result: any = await booksService.findAll({ page, limit: pageSize, title: opts?.title });
    const rows = result.rows ?? result;
    if (!rows || rows.length === 0) break;
    for (const r of rows) {
      csvStream.write({
        id: r.id,
        title: r.title,
        isbn: r.isbn,
        price: r.price,
        availability: r.availability
      });
    }
    if (rows.length < pageSize) break;
    page++;
  }
  csvStream.end();
  return pass;
}
