import { PassThrough } from 'stream';
import { streamBooksToCsv } from './csv';

// Mock BooksService type (only the method we need)
type BooksService = {
  findAll: jest.Mock<any, any>;
};

// Helper to consume a readable stream into a string
function streamToString(stream: PassThrough): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    stream.on('data', (chunk) => (data += chunk.toString()));
    stream.on('end', () => resolve(data));
    stream.on('error', (err) => reject(err));
  });
}

describe('streamBooksToCsv', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('streams a single page of books to CSV and forwards title option to service', async () => {
    const mockBooks = [
      { id: 1, title: 'Book A', isbn: '111', price: 10, availability: true },
      { id: 2, title: 'Book B', isbn: '222', price: 20, availability: false },
    ];

    const booksService: BooksService = {
      findAll: jest
        .fn()
        // first call returns rows
        .mockResolvedValueOnce({ rows: mockBooks })
        // second call returns empty rows to stop the loop
        .mockResolvedValueOnce({ rows: [] }),
    } as any;

    const stream = await streamBooksToCsv(booksService as any, { title: 'search-me' });
    const csv = await streamToString(stream as PassThrough);

    // service called with the provided title
    expect(booksService.findAll.mock.calls[0][0]).toEqual({ page: 1, limit: 500, title: 'search-me' });

    // CSV should contain header and rows
    expect(csv).toContain('id,title,isbn,price,availability');
    expect(csv).toContain('1,Book A,111,10,true');
    expect(csv).toContain('2,Book B,222,20,false');
  });

  it('paginates when results reach pageSize and continues until a short page', async () => {
    // Create 500 mock rows for page 1 and 2 rows for page 2
    const pageSize = 500;
    const page1Rows = Array.from({ length: pageSize }, (_, i) => ({
      id: i + 1,
      title: `Book ${i + 1}`,
      isbn: `${1000 + i}`,
      price: i,
      availability: i % 2 === 0,
    }));
    const page2Rows = [
      { id: 501, title: 'Book 501', isbn: '1501', price: 501, availability: true },
    ];

    const booksService: BooksService = {
      findAll: jest
        .fn()
        .mockResolvedValueOnce({ rows: page1Rows })
        .mockResolvedValueOnce({ rows: page2Rows })
        .mockResolvedValueOnce({ rows: [] }),
    } as any;

    const stream = await streamBooksToCsv(booksService as any);
    const csv = await streamToString(stream as PassThrough);

    // should have called page 1 and page 2
    expect(booksService.findAll.mock.calls[0][0]).toEqual({ page: 1, limit: 500, title: undefined });
    expect(booksService.findAll.mock.calls[1][0]).toEqual({ page: 2, limit: 500, title: undefined });

    // verify some values present from both pages
    expect(csv).toContain('1,Book 1,1000,0,true');
    expect(csv).toContain('500,Book 500,1499,499,false');
    expect(csv).toContain('501,Book 501,1501,501,true');
  });

  it('returns an empty stream (no data) when service immediately returns no rows', async () => {
    const booksService: BooksService = {
      findAll: jest.fn().mockResolvedValueOnce({ rows: [] }),
    } as any;

    const stream = await streamBooksToCsv(booksService as any);
    const csv = await streamToString(stream as PassThrough);

    // When there are no rows at all, the CSV output should be empty (no headers/rows)
    expect(csv.trim()).toBe('');
  });
});
