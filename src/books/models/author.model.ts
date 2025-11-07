import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'authors' })
export class Author extends Model<Author> {
  @Column({ primaryKey: true, type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id!: string;

  @Column(DataType.TEXT)
  first_name!: string;

  @Column(DataType.TEXT)
  last_name!: string;
}
