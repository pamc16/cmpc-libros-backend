import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  BelongsToMany,
  HasMany,
} from "sequelize-typescript";
import { BookAuthor } from "./book-author.model";
import { Author } from "./author.model";
import { BookGenre } from "./book-genre.model";
import { Genre } from "./genre.model";
import { Publisher } from "../../publishers/publisher.model";
import { Inventory } from "./inventory.model";
import { BookPublisher } from "./book-publisher.model";

@Table({ tableName: "books", paranoid: false })
export class Book extends Model<Book> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column({ allowNull: false })
  title!: string;

  @Column(DataType.INTEGER)
  pages!: number;

  @Column(DataType.DECIMAL(10, 2))
  price!: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  availability!: boolean;

  @HasMany(() => Inventory)
  inventories!: Inventory[];

  @BelongsToMany(() => Author, () => BookAuthor)
  authors!: Author[];

  @BelongsToMany(() => Genre, () => BookGenre)
  genres!: Genre[];

  @BelongsToMany(() => Publisher, () => BookPublisher)
  publishers!: Publisher[];

  @Column({ allowNull: true })
  image!: string;
}
