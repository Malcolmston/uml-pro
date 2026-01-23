import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { User } from "./User"
import { Team } from "./Team"
import TeamRole from "../teamRole"

@Entity()
export class TeamMember {

    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User)
    @JoinColumn()
    user: User

    @Column()
    userId: number

    @ManyToOne(() => Team)
    @JoinColumn()
    team: Team

    @Column()
    teamId: number

    @Column({
        type: "enum",
        enum: TeamRole,
        default: TeamRole.MEMBER
    })
    role: TeamRole

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @DeleteDateColumn()
    deletedAt: Date
}
