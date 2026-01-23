import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({nullable: false})
  firstname: string

  @Column({nullable: false})
  lastname: string

  @Column({nullable: false})
  age: number

  @Column({ unique: true, nullable: false})
  email: string

  @Column({ unique: true, nullable: false})
  username: string

  @Column({nullable: false})
  password: string
}
