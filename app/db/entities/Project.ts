import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, BeforeInsert, BeforeRemove, ManyToOne, JoinColumn } from "typeorm"
import Visibility from "../visibility";
import {bucketExsists, createBucket, deleteBucket} from "../../utils/s3";
import { Team } from "./Team";
import { randomUUID } from "node:crypto";


@Entity()
export class Project {
    @PrimaryGeneratedColumn()
    id: number | null = null

    @Column({ type: 'uuid' })
    uuid: string = ''

    @Column({
        type: "enum",
        enum: Visibility,
        default: Visibility.PUBLIC
    })
    visibility: Visibility = Visibility.PUBLIC

    @Column({ type: 'varchar', nullable: false })
    name: string = ''

    @ManyToOne(() => Team, { nullable: true })
    @JoinColumn()
    team: Team | null = null

    @Column({ type: 'int', nullable: true })
    teamId: number | null = null

    @Column({ type: 'text', nullable: true })
    description: string | null = null

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @DeleteDateColumn()
    deletedAt: Date | null

    @BeforeInsert()
    async beforeInsert() {
        if (!this.uuid) {
            this.uuid = randomUUID()
        }
        await Project.createBuckets(this.uuid)
    }

    @BeforeRemove()
    async beforeRemove() {
        await Project.deleteBuckets(this.uuid)
    }

    private static async createBuckets(uuid: string) {
        const buckets = [
            `project-${uuid}-files`,
            `project-${uuid}-rules`,
            `project-${uuid}-backups`
        ]

        for (const bucketName of buckets) {
            if (await bucketExsists(bucketName)) {
                throw new Error(`Bucket '${bucketName}' already exists`)
            }
            await createBucket(bucketName)
        }
    }

    private static async deleteBuckets(uuid: string) {
        const bucketTypes = ['files', 'rules', 'backups']

        for (const type of bucketTypes) {
            const bucketName = `project-${uuid}-${type}`

            if (await bucketExsists(bucketName)) {
                const result = await deleteBucket(bucketName)

                if (result.error) {
                    throw new Error(`Failed to delete bucket '${bucketName}': ${result.error.message}`)
                }
            }
        }
    }
}
