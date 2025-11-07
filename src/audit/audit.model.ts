import { Table, Column, Model, DataType, Default } from 'sequelize-typescript';

@Table({ tableName: 'audit_logs', timestamps: true })
export class AuditLog extends Model<AuditLog> {
  @Default(DataType.UUIDV4)
  @Column({ primaryKey: true, type: DataType.UUID })
  id!: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  action!: string;

  @Column({ type: DataType.JSONB })
  payload: any;

  @Column({ type: DataType.UUID, allowNull: true })
  user_id?: string = '';

  @Column({ type: DataType.TEXT, allowNull: true })
  ip?: string;
}
