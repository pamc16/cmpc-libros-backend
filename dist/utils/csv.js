"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamBooksToCsv = streamBooksToCsv;
const stream_1 = require("stream");
const fastcsv = require("fast-csv");
async function streamBooksToCsv(booksService, opts) {
    const pass = new stream_1.PassThrough();
    const csvStream = fastcsv.format({ headers: true });
    csvStream.pipe(pass);
    const pageSize = 500;
    let page = 1;
    while (true) {
        const result = await booksService.findAll({ page, limit: pageSize, title: opts?.title });
        const rows = result.rows ?? result;
        if (!rows || rows.length === 0)
            break;
        for (const r of rows) {
            csvStream.write({
                id: r.id,
                title: r.title,
                isbn: r.isbn,
                price: r.price,
                availability: r.availability
            });
        }
        if (rows.length < pageSize)
            break;
        page++;
    }
    csvStream.end();
    return pass;
}
//# sourceMappingURL=csv.js.map