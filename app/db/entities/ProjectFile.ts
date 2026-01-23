import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { Project } from "./Project"

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
}
