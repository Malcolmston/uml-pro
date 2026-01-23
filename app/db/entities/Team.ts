import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, BeforeInsert, BeforeUpdate, AfterLoad } from "typeorm"
import TeamRole from "../teamRole"
import { canCreate, canRead, canUpdate, canDelete, canList, canModifyRule, canLimitRule, canListRule } from "../../utils/rules"

@Entity()
export class Team {
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: false})
    name: string

    @Column({
        type: "json",
        nullable: true
    })
    customRules: object | null

    @Column({
        type: "enum",
        enum: TeamRole,
        default: TeamRole.MEMBER
    })
    defaultRole: TeamRole

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @DeleteDateColumn()
    deletedAt: Date

    /**
     * Check if a team member with a specific role can perform an action on a resource
     */
    canPerform(role: TeamRole, action: string, resource: string): boolean | null {
        // First check custom rules if they exist
        if (this.customRules) {
            const customRule = (this.customRules as any)[action]?.[resource]
            if (customRule !== undefined) {
                return customRule
            }
        }

        // Fall back to default role-based rules
        switch (action) {
            case 'create':
                return canCreate(role as any, resource as any)
            case 'read':
                return canRead(role as any, resource as any)
            case 'update':
                return canUpdate(role as any, resource as any)
            case 'delete':
                return canDelete(role as any, resource as any)
            case 'list':
                return canList(role as any, resource as any)
            default:
                return false
        }
    }

    /**
     * Check if a role can modify team rules
     */
    canModifyTeamRules(role: TeamRole): boolean | null {
        return canModifyRule(role as any)
    }

    /**
     * Check if a role can set rule limits
     */
    canSetRuleLimits(role: TeamRole): boolean | null {
        return canLimitRule(role as any)
    }

    /**
     * Check if a role can list rules
     */
    canListTeamRules(role: TeamRole): boolean | null {
        return canListRule(role as any)
    }

    /**
     * Set custom rules for the team
     */
    setCustomRules(role: TeamRole, rules: object): void {
        if (!this.canModifyTeamRules(role)) {
            throw new Error(`Role '${role}' does not have permission to modify team rules`)
        }

        this.customRules = rules
    }

    /**
     * Get effective rules for a role (custom rules override default rules)
     */
    getEffectiveRules(role: TeamRole): object {
        const defaultRules = {
            create: {
                bucket: canCreate(role as any, 'bucket'),
                file: canCreate(role as any, 'file'),
                folder: canCreate(role as any, 'folder')
            },
            read: {
                bucket: canRead(role as any, 'bucket'),
                file: canRead(role as any, 'file')
            },
            update: {
                bucket: canUpdate(role as any, 'bucket'),
                file: canUpdate(role as any, 'file')
            },
            delete: {
                bucket: canDelete(role as any, 'bucket'),
                file: canDelete(role as any, 'file')
            },
            list: {
                bucket: canList(role as any, 'bucket'),
                file: canList(role as any, 'file'),
                folder: canList(role as any, 'folder')
            }
        }

        // Merge custom rules if they exist
        if (this.customRules) {
            return { ...defaultRules, ...this.customRules }
        }

        return defaultRules
    }
}
