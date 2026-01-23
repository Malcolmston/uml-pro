import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, BeforeInsert, BeforeUpdate } from "typeorm"
import Visibility from "../visibility";
import {bucketExsists, createBucket} from "../../utils/s3";


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

    @BeforeInsert()
    beforeInsert() {
        Project.createBuckets(this.name);
    }

    private static createBuckets (name: string) {
        if( bucketExsists(`project/${name}-files`) ) throw new Error("Bucket already exists");
        else createBucket( `project/${name}-files`)
        if( bucketExsists(`project/${name}-rules`) ) throw new Error("Bucket already exists");
        else createBucket( `project/${name}-rules`)
        if( bucketExsists(`project/${name}-backups`) ) throw new Error("Bucket already exists");
        else createBucket( `project/${name}-backups`)
    }
}
