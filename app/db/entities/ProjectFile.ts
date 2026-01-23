import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, BeforeInsert, BeforeUpdate, BeforeRemove, AfterLoad } from "typeorm"
import { Project } from "./Project"
import { deleteFile, renameFile } from "../../utils/s3"

@Entity()
export class ProjectFile {

    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => Project)
    @JoinColumn()
    project: Project

    @Column()
    projectId: number

    @Column({ nullable: false })
    fileName: string

    @Column({ nullable: false })
    s3Key: string

    @Column({ nullable: false })
    s3Bucket: string

    @Column({ nullable: true })
    fileSize: number

    @Column({ nullable: true })
    mimeType: string

    @Column({ nullable: true })
    s3Url: string

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @DeleteDateColumn()
    deletedAt: Date

    // Store the original file name to detect changes
    private originalFileName?: string
    private originalS3Key?: string

    @AfterLoad()
    afterLoad() {
        this.originalFileName = this.fileName
        this.originalS3Key = this.s3Key
    }

    @BeforeInsert()
    async beforeInsert() {
        // Validate required fields
        if (!this.fileName) {
            throw new Error('File name is required')
        }
        if (!this.s3Bucket) {
            throw new Error('S3 bucket is required')
        }
        if (!this.s3Key) {
            this.s3Key = this.fileName
        }

        this.originalFileName = this.fileName
        this.originalS3Key = this.s3Key
    }

    @BeforeUpdate()
    async beforeUpdate() {
        // Check if file name has changed
        if (this.originalFileName && this.originalFileName !== this.fileName) {
            // Update s3Key if it was based on the original fileName
            if (this.originalS3Key === this.originalFileName) {
                this.s3Key = this.fileName
            }

            // Rename file in S3
            if (this.originalS3Key && this.s3Key !== this.originalS3Key) {
                const result = await renameFile(this.s3Bucket, this.originalS3Key, this.s3Key)

                if (result.error) {
                    throw new Error(`Failed to rename file in S3: ${result.error.message}`)
                }
            }

            this.originalFileName = this.fileName
            this.originalS3Key = this.s3Key
        }
    }

    @BeforeRemove()
    async beforeRemove() {
        // Delete file from S3
        const result = await deleteFile(this.s3Bucket, this.s3Key)

        if (result.error) {
            throw new Error(`Failed to delete file from S3: ${result.error.message}`)
        }
    }
}
