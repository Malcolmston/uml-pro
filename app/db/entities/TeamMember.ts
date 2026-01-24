import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, Unique } from "typeorm"
import { User } from "./User"
import { Team } from "./Team"
import TeamRole from "../teamRole"

@Entity('team_members')
@Unique(['team', 'user']) // Prevent duplicate members in the same team
export class TeamMember {

    @PrimaryGeneratedColumn()
    id: number | null = null

    @ManyToOne(() => User)
    @JoinColumn()
    user: User | null = null

    @Column({ type: 'int' })
    userId: number | null = null

    @ManyToOne(() => Team)
    @JoinColumn()
    team: Team | null = null

    @Column({ type: 'int' })
    teamId: number | null = null

    @Column({
        type: "enum",
        enum: TeamRole,
        default: TeamRole.MEMBER
    })
    role: TeamRole = TeamRole.MEMBER

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @DeleteDateColumn()
    deletedAt: Date | null
}
