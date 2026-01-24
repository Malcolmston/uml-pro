import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, BeforeInsert, BeforeUpdate, BeforeRemove, Generated } from "typeorm"
import Visibility from "../visibility";
import {bucketExsists, createBucket, deleteBucket, renameBucket} from "../../utils/s3";


@Entity()
export class Project {
    @PrimaryGeneratedColumn()
    id: number | null = null

    @Column({ type: 'uuid' })
    @Generated("uuid")
    uuid: string = ''

    @Column({
        type: "enum",
        enum: Visibility,
        default: Visibility.PUBLIC
    })
    visibility: Visibility = Visibility.PUBLIC

    @Column({ type: 'varchar', nullable: false })
    name: string = ''

    @Column({ type: 'text', nullable: true })
    description: string | null = null

    // Store the original name to detect changes
    private originalName?: string

    @CreateDateColumn()
    createdAt: Date | null = null

    @UpdateDateColumn()
    updatedAt: Date | null = null

    @DeleteDateColumn()
    deletedAt: Date | null = null

    @BeforeInsert()
    async beforeInsert() {
        await Project.createBuckets(this.name)
        this.originalName = this.name
    }

    @BeforeUpdate()
    async beforeUpdate() {
        // Check if name has changed
        if (this.originalName && this.originalName !== this.name) {
            await Project.renameBuckets(this.originalName, this.name)
            this.originalName = this.name
        }
    }

    @BeforeRemove()
    async beforeRemove() {
        await Project.deleteBuckets(this.name)
    }

    private static async createBuckets(name: string) {
        const buckets = [
            `project/${name}-files`,
            `project/${name}-rules`,
            `project/${name}-backups`
        ]

        for (const bucketName of buckets) {
            if (await bucketExsists(bucketName)) {
                throw new Error(`Bucket '${bucketName}' already exists`)
            }
            await createBucket(bucketName)
        }
    }

    private static async renameBuckets(oldName: string, newName: string) {
        const bucketTypes = ['files', 'rules', 'backups']

        for (const type of bucketTypes) {
            const oldBucketName = `project/${oldName}-${type}`
            const newBucketName = `project/${newName}-${type}`

            if (await bucketExsists(newBucketName)) {
                throw new Error(`Bucket '${newBucketName}' already exists`)
            }

            // Note: Supabase doesn't support direct bucket renaming
            // This will create new bucket, copy files, and delete old bucket
            const result = await renameBucket(oldBucketName, newBucketName)

            if (result.error) {
                throw new Error(`Failed to rename bucket '${oldBucketName}': ${result.error.message}`)
            }
        }
    }

    private static async deleteBuckets(name: string) {
        const bucketTypes = ['files', 'rules', 'backups']

        for (const type of bucketTypes) {
            const bucketName = `project/${name}-${type}`

            if (await bucketExsists(bucketName)) {
                const result = await deleteBucket(bucketName)

                if (result.error) {
                    throw new Error(`Failed to delete bucket '${bucketName}': ${result.error.message}`)
                }
            }
        }
    }
}
