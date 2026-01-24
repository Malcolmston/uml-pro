import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm"
import TeamRole from "../teamRole"
import { canCreate, canRead, canUpdate, canDelete, canList, canModifyRule, canLimitRule, canListRule, type RoleType, type ResourceType } from "../../utils/rules"

interface CustomRules {
    [action: string]: {
        [resource: string]: boolean | null
    }
}

@Entity('teams')
export class Team {
    @PrimaryGeneratedColumn()
    id: number | null = null

    @Column({ type: 'varchar', nullable: false })
    name: string = ''

    @Column({
        type: "json",
        nullable: true
    })
    customRules: CustomRules | null = null

    @Column({
        type: "enum",
        enum: TeamRole,
        default: TeamRole.MEMBER
    })
    defaultRole: TeamRole = TeamRole.MEMBER

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @DeleteDateColumn()
    deletedAt: Date | null

    /**
     * Check if a team member with a specific role can perform an action on a resource
     */
    canPerform(role: TeamRole, action: string, resource: string): boolean | null {
        // First check custom rules if they exist
        if (this.customRules) {
            const customRule = this.customRules[action]?.[resource]
            if (customRule !== undefined) {
                return customRule
            }
        }

        // Fall back to default role-based rules
        switch (action) {
            case 'create':
                return canCreate(role as RoleType, resource as ResourceType)
            case 'read':
                return canRead(role as RoleType, resource as ResourceType)
            case 'update':
                return canUpdate(role as RoleType, resource as ResourceType)
            case 'delete':
                return canDelete(role as RoleType, resource as ResourceType)
            case 'list':
                return canList(role as RoleType, resource as ResourceType)
            default:
                return false
        }
    }

    /**
     * Check if a role can modify team rules
     */
    canModifyTeamRules(role: TeamRole): boolean | null {
        return canModifyRule(role as RoleType)
    }

    /**
     * Check if a role can set rule limits
     */
    canSetRuleLimits(role: TeamRole): boolean | null {
        return canLimitRule(role as RoleType)
    }

    /**
     * Check if a role can list rules
     */
    canListTeamRules(role: TeamRole): boolean | null {
        return canListRule(role as RoleType)
    }

    /**
     * Set custom rules for the team
     */
    setCustomRules(role: TeamRole, rules: CustomRules): void {
        if (!this.canModifyTeamRules(role)) {
            throw new Error(`Role '${role}' does not have permission to modify team rules`)
        }

        this.customRules = rules
    }

    /**
     * Get effective rules for a role (custom rules override default rules)
     */
    getEffectiveRules(role: TeamRole): CustomRules {
        const defaultRules: CustomRules = {
            create: {
                bucket: canCreate(role as RoleType, 'bucket'),
                file: canCreate(role as RoleType, 'file'),
                folder: canCreate(role as RoleType, 'folder')
            },
            read: {
                bucket: canRead(role as RoleType, 'bucket'),
                file: canRead(role as RoleType, 'file')
            },
            update: {
                bucket: canUpdate(role as RoleType, 'bucket'),
                file: canUpdate(role as RoleType, 'file')
            },
            delete: {
                bucket: canDelete(role as RoleType, 'bucket'),
                file: canDelete(role as RoleType, 'file')
            },
            list: {
                bucket: canList(role as RoleType, 'bucket'),
                file: canList(role as RoleType, 'file'),
                folder: canList(role as RoleType, 'folder')
            }
        }

        // Merge custom rules if they exist
        if (this.customRules) {
            return { ...defaultRules, ...this.customRules }
        }

        return defaultRules
    }
}
