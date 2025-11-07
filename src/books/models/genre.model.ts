import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'genres' })
export class Genre extends Model<Genre> {
  @Column({ primaryKey: true, type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  id!: string;

  @Column({ unique: true })
  name!: string;
}
