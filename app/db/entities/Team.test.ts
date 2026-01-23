import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Team } from './Team'
import TeamRole from '../teamRole'
import * as rules from '../../utils/rules'

vi.mock('../../utils/rules', () => ({
  canCreate: vi.fn(),
  canRead: vi.fn(),
  canUpdate: vi.fn(),
  canDelete: vi.fn(),
  canList: vi.fn(),
  canModifyRule: vi.fn(),
  canLimitRule: vi.fn(),
  canListRule: vi.fn()
}))

describe('Team Entity', () => {
  let team: Team

  beforeEach(() => {
    vi.clearAllMocks()
    team = new Team()
    team.name = 'Engineering Team'
    team.defaultRole = TeamRole.MEMBER
    team.customRules = null
  })

  describe('Field Validation', () => {
    it('should have all required fields', () => {
      expect(team.name).toBe('Engineering Team')
      expect(team.defaultRole).toBe(TeamRole.MEMBER)
      expect(team.customRules).toBeNull()
    })

    it('should default role to MEMBER', () => {
      const newTeam = new Team()
      newTeam.name = 'New Team'
      expect(newTeam).toHaveProperty('defaultRole')
    })

    it('should allow custom rules as JSON', () => {
      team.customRules = { create: { file: true } }
      expect(team.customRules).toEqual({ create: { file: true } })
    })
  })

  describe('canPerform Method', () => {
    it('should check custom rules first if they exist', () => {
      team.customRules = {
        create: { file: false }
      }

      const result = team.canPerform(TeamRole.ADMIN, 'create', 'file')

      expect(result).toBe(false)
      expect(rules.canCreate).not.toHaveBeenCalled()
    })

    it('should fall back to default rules if no custom rules', () => {
      vi.mocked(rules.canCreate).mockReturnValue(true)

      const result = team.canPerform(TeamRole.ADMIN, 'create', 'bucket')

      expect(rules.canCreate).toHaveBeenCalledWith('admin', 'bucket')
      expect(result).toBe(true)
    })

    it('should handle create action', () => {
      vi.mocked(rules.canCreate).mockReturnValue(true)

      team.canPerform(TeamRole.MEMBER, 'create', 'file')

      expect(rules.canCreate).toHaveBeenCalledWith('member', 'file')
    })

    it('should handle read action', () => {
      vi.mocked(rules.canRead).mockReturnValue(true)

      team.canPerform(TeamRole.VIEWER, 'read', 'file')

      expect(rules.canRead).toHaveBeenCalledWith('viewer', 'file')
    })

    it('should handle update action', () => {
      vi.mocked(rules.canUpdate).mockReturnValue(true)

      team.canPerform(TeamRole.ADMIN, 'update', 'bucket')

      expect(rules.canUpdate).toHaveBeenCalledWith('admin', 'bucket')
    })

    it('should handle delete action', () => {
      vi.mocked(rules.canDelete).mockReturnValue(null)

      const result = team.canPerform(TeamRole.MEMBER, 'delete', 'file')

      expect(rules.canDelete).toHaveBeenCalledWith('member', 'file')
      expect(result).toBeNull()
    })

    it('should handle list action', () => {
      vi.mocked(rules.canList).mockReturnValue(true)

      team.canPerform(TeamRole.VIEWER, 'list', 'folder')

      expect(rules.canList).toHaveBeenCalledWith('viewer', 'folder')
    })

    it('should return false for unknown actions', () => {
      const result = team.canPerform(TeamRole.ADMIN, 'unknown', 'file')

      expect(result).toBe(false)
    })

    it('should return undefined from custom rules if action not found', () => {
      team.customRules = { create: { bucket: true } }

      vi.mocked(rules.canCreate).mockReturnValue(true)

      const result = team.canPerform(TeamRole.ADMIN, 'create', 'file')

      // Custom rules don't have 'file', so should fall back
      expect(rules.canCreate).toHaveBeenCalled()
    })
  })

  describe('Rule Permission Methods', () => {
    it('should check if role can modify team rules', () => {
      vi.mocked(rules.canModifyRule).mockReturnValue(true)

      const result = team.canModifyTeamRules(TeamRole.ADMIN)

      expect(rules.canModifyRule).toHaveBeenCalledWith('admin')
      expect(result).toBe(true)
    })

    it('should check if role can set rule limits', () => {
      vi.mocked(rules.canLimitRule).mockReturnValue(true)

      const result = team.canSetRuleLimits(TeamRole.ADMIN)

      expect(rules.canLimitRule).toHaveBeenCalledWith('admin')
      expect(result).toBe(true)
    })

    it('should check if role can list team rules', () => {
      vi.mocked(rules.canListRule).mockReturnValue(true)

      const result = team.canListTeamRules(TeamRole.MEMBER)

      expect(rules.canListRule).toHaveBeenCalledWith('member')
      expect(result).toBe(true)
    })
  })

  describe('setCustomRules Method', () => {
    it('should set custom rules if role has permission', () => {
      vi.mocked(rules.canModifyRule).mockReturnValue(true)

      const newRules = {
        create: { file: false }
      }

      team.setCustomRules(TeamRole.ADMIN, newRules)

      expect(team.customRules).toEqual(newRules)
    })

    it('should throw error if role does not have permission', () => {
      vi.mocked(rules.canModifyRule).mockReturnValue(false)

      const newRules = { create: { file: false } }

      expect(() => team.setCustomRules(TeamRole.VIEWER, newRules)).toThrow(
        "Role 'viewer' does not have permission to modify team rules"
      )
    })

    it('should allow admin to set custom rules', () => {
      vi.mocked(rules.canModifyRule).mockReturnValue(true)

      const newRules = {
        delete: { file: false }
      }

      expect(() => team.setCustomRules(TeamRole.ADMIN, newRules)).not.toThrow()
      expect(team.customRules).toEqual(newRules)
    })
  })

  describe('getEffectiveRules Method', () => {
    beforeEach(() => {
      vi.mocked(rules.canCreate).mockReturnValue(true)
      vi.mocked(rules.canRead).mockReturnValue(true)
      vi.mocked(rules.canUpdate).mockReturnValue(true)
      vi.mocked(rules.canDelete).mockReturnValue(true)
      vi.mocked(rules.canList).mockReturnValue(true)
    })

    it('should return default rules when no custom rules exist', () => {
      const effectiveRules = team.getEffectiveRules(TeamRole.ADMIN)

      expect(effectiveRules).toHaveProperty('create')
      expect(effectiveRules).toHaveProperty('read')
      expect(effectiveRules).toHaveProperty('update')
      expect(effectiveRules).toHaveProperty('delete')
      expect(effectiveRules).toHaveProperty('list')
    })

    it('should merge custom rules with default rules', () => {
      team.customRules = {
        create: { file: false }
      }

      const effectiveRules = team.getEffectiveRules(TeamRole.ADMIN) as any

      expect(effectiveRules.create.file).toBe(false)
    })

    it('should prioritize custom rules over default rules', () => {
      vi.mocked(rules.canCreate).mockReturnValue(true)
      team.customRules = {
        create: { bucket: false, file: false, folder: false }
      }

      const effectiveRules = team.getEffectiveRules(TeamRole.ADMIN) as any

      expect(effectiveRules.create).toEqual({ bucket: false, file: false, folder: false })
    })

    it('should include all action types', () => {
      const effectiveRules = team.getEffectiveRules(TeamRole.MEMBER) as any

      expect(effectiveRules).toHaveProperty('create')
      expect(effectiveRules).toHaveProperty('read')
      expect(effectiveRules).toHaveProperty('update')
      expect(effectiveRules).toHaveProperty('delete')
      expect(effectiveRules).toHaveProperty('list')
    })
  })

  describe('Team Roles', () => {
    it('should support ADMIN role', () => {
      team.defaultRole = TeamRole.ADMIN
      expect(team.defaultRole).toBe('admin')
    })

    it('should support MEMBER role', () => {
      team.defaultRole = TeamRole.MEMBER
      expect(team.defaultRole).toBe('member')
    })

    it('should support VIEWER role', () => {
      team.defaultRole = TeamRole.VIEWER
      expect(team.defaultRole).toBe('viewer')
    })
  })

  describe('Timestamp Fields', () => {
    it('should have createdAt field', () => {
      expect(team).toHaveProperty('createdAt')
    })

    it('should have updatedAt field', () => {
      expect(team).toHaveProperty('updatedAt')
    })

    it('should have deletedAt field for soft deletes', () => {
      expect(team).toHaveProperty('deletedAt')
    })
  })
})
