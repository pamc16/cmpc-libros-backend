import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { Book } from './book.model';
import { Publisher } from '../../publishers/publisher.model';

@Table({ tableName: 'book_publisher', timestamps: false })
export class BookPublisher extends Model<BookPublisher> {
  @ForeignKey(() => Book)
  @Column({ type: DataType.UUID })
  book_id!: string;

  @ForeignKey(() => Publisher)
  @Column({ type: DataType.UUID })
  publisher_id!: string;
}
