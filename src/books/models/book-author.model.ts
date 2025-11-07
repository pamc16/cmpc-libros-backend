import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { Book } from './book.model';
import { Author } from './author.model';

@Table({ tableName: 'book_authors', timestamps: false })
export class BookAuthor extends Model<BookAuthor> {
  @ForeignKey(() => Book)
  @Column({ type: DataType.UUID })
  book_id!: string;

  @ForeignKey(() => Author)
  @Column({ type: DataType.UUID })
  author_id!: string;
}
