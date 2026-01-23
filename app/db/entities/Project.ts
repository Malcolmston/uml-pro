import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, BeforeInsert, BeforeUpdate } from "typeorm"
import Visibility from "../visibility";


@Entity()
export class Project {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @Generated("uuid")
    uuid: string;

    @Column({
        type: "enum",
        enum: Visibility,
        default: Visibility.PUBLIC
    })
    visibility: Visibility;

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
