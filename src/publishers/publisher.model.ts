import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'publishers' })
export class Publisher extends Model<Publisher> {
  @Column({ primaryKey: true, type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id!: string;

  @Column({ unique: true })
  name!: string;
}
