import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { Book } from './book.model';
import { Genre } from './genre.model';

@Table({ tableName: 'book_genres', timestamps: false })
export class BookGenre extends Model<BookGenre> {
  @ForeignKey(() => Book)
  @Column({ type: DataType.UUID })
  book_id!: string;

  @ForeignKey(() => Genre)
  @Column({ type: DataType.UUID })
  genre_id!: string;
}
