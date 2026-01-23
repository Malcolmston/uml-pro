import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, BeforeInsert, BeforeUpdate } from "typeorm"

@Entity()
export class Project {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @Generated("uuid")
    uuid: string;

    @Column({nullable: false})
    name: string

    @Column({nullable: true})
    description: string

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @DeleteDateColumn()
    deletedAt: Date
}
