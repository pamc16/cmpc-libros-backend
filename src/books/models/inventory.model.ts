import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { Book } from './book.model';

@Table({ tableName: 'inventory' })
export class Inventory extends Model<Inventory> {
  @Column({ primaryKey: true, type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id!: string;

  @ForeignKey(() => Book)
  @Column({ type: DataType.UUID })
  book_id!: string;

  @Column(DataType.INTEGER)
  quantity!: number;

  @Column(DataType.INTEGER)
  reserved!: number;
}
