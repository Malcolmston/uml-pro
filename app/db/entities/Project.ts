import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, BeforeInsert, Generated } from "typeorm"
import Visibility from "../visibility";
import {bucketExsists, createBucket} from "../../utils/s3";


@Entity()
export class Project {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @Generated("uuid")
    uuid: string

    @Column({
        type: "enum",
        enum: Visibility,
        default: Visibility.PUBLIC
    })
    visibility: Visibility

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
    async beforeInsert() {
        await Project.createBuckets(this.name)
    }

    private static async createBuckets(name: string) {
        const buckets = [
            `project/${name}-files`,
            `project/${name}-rules`,
            `project/${name}-backups`
        ]

        for (const bucketName of buckets) {
            if (bucketExsists(bucketName)) {
                throw new Error(`Bucket '${bucketName}' already exists`)
            }
            createBucket(bucketName)
        }
    }
}
