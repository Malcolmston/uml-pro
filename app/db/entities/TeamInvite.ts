import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { Team } from "./Team"
import { User } from "./User"
import TeamRole from "../teamRole"
import Invite from "../invite"

@Entity()
export class TeamInvite {
  @PrimaryGeneratedColumn()
  id: number | null = null

  @ManyToOne(() => Team)
  @JoinColumn()
  team: Team | null = null

  @Column({ type: "int" })
  teamId: number | null = null

  @ManyToOne(() => User)
  @JoinColumn()
  invitedBy: User | null = null

  @Column({ type: "int" })
  invitedById: number | null = null

  @Column({ type: "varchar", nullable: false })
  email: string = ""

  @Column({
    type: "enum",
    enum: TeamRole,
    default: TeamRole.MEMBER,
  })
  role: TeamRole = TeamRole.MEMBER

  @Column({ type: "varchar", nullable: false })
  token: string = ""

  @Column({
    type: "enum",
    enum: Invite,
    default: Invite.PENDING,
  })
  status: Invite = Invite.PENDING

  @Column({ type: "timestamptz", nullable: true })
  acceptedAt: Date | null = null

  @CreateDateColumn()
  createdAt: Date | null = null

  @UpdateDateColumn()
  updatedAt: Date | null = null

  @DeleteDateColumn()
  deletedAt: Date | null = null
}
