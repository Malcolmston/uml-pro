import { describe, it, expect } from 'vitest'
import {
  hasPermission,
  getRolePermissions,
  canCreate,
  canRead,
  canUpdate,
  canWrite,
  canExecute,
  canDelete,
  canList,
  canModifyRule,
  canLimitRule,
  canListRule
} from './rules'

describe('rules.ts - Permission System', () => {
  describe('hasPermission', () => {
    it('should return true for admin creating bucket', () => {
      expect(hasPermission('admin', 'create', 'bucket')).toBe(true)
    })

    it('should return false for member creating bucket', () => {
      expect(hasPermission('member', 'create', 'bucket')).toBe(false)
    })

    it('should return false for viewer creating file', () => {
      expect(hasPermission('viewer', 'create', 'file')).toBe(false)
    })

    it('should return true for viewer reading file', () => {
      expect(hasPermission('viewer', 'read', 'file')).toBe(true)
    })

    it('should return false for null permissions', () => {
      expect(hasPermission('member', 'execute', 'file')).toBe(false)
    })
  })

  describe('getRolePermissions', () => {
    it('should return admin permissions', () => {
      const permissions = getRolePermissions('admin')
      expect(permissions).toBeDefined()
      expect(permissions.create).toBeDefined()
      expect(permissions.rule).toBeDefined()
    })

    it('should return member permissions', () => {
      const permissions = getRolePermissions('member')
      expect(permissions).toBeDefined()
      expect(permissions.create.bucket).toBe(false)
      expect(permissions.create.file).toBe(true)
    })

    it('should return viewer permissions', () => {
      const permissions = getRolePermissions('viewer')
      expect(permissions).toBeDefined()
      expect(permissions.read.file).toBe(true)
      expect(permissions.create.file).toBe(false)
    })
  })

  describe('canCreate', () => {
    it('should allow admin to create buckets', () => {
      expect(canCreate('admin', 'bucket')).toBe(true)
    })

    it('should not allow member to create buckets', () => {
      expect(canCreate('member', 'bucket')).toBe(false)
    })

    it('should allow member to create files', () => {
      expect(canCreate('member', 'file')).toBe(true)
    })

    it('should not allow viewer to create anything', () => {
      expect(canCreate('viewer', 'file')).toBe(false)
      expect(canCreate('viewer', 'folder')).toBe(false)
    })
  })

  describe('canRead', () => {
    it('should allow all roles to read files', () => {
      expect(canRead('admin', 'file')).toBe(true)
      expect(canRead('member', 'file')).toBe(true)
      expect(canRead('viewer', 'file')).toBe(true)
    })

    it('should allow all roles to read buckets', () => {
      expect(canRead('admin', 'bucket')).toBe(true)
      expect(canRead('member', 'bucket')).toBe(true)
      expect(canRead('viewer', 'bucket')).toBe(true)
    })
  })

  describe('canUpdate', () => {
    it('should allow admin to update files and buckets', () => {
      expect(canUpdate('admin', 'file')).toBe(true)
      expect(canUpdate('admin', 'bucket')).toBe(true)
    })

    it('should allow member to update files but not buckets', () => {
      expect(canUpdate('member', 'file')).toBe(true)
      expect(canUpdate('member', 'bucket')).toBe(false)
    })

    it('should not allow viewer to update anything', () => {
      expect(canUpdate('viewer', 'file')).toBe(false)
      expect(canUpdate('viewer', 'bucket')).toBe(false)
    })
  })

  describe('canWrite', () => {
    it('should allow admin to write to files and buckets', () => {
      expect(canWrite('admin', 'file')).toBe(true)
      expect(canWrite('admin', 'bucket')).toBe(true)
    })

    it('should allow member to write files but not buckets', () => {
      expect(canWrite('member', 'file')).toBe(true)
      expect(canWrite('member', 'bucket')).toBe(false)
    })

    it('should not allow viewer to write', () => {
      expect(canWrite('viewer', 'file')).toBe(false)
    })
  })

  describe('canExecute', () => {
    it('should allow admin to execute files', () => {
      expect(canExecute('admin', 'file')).toBe(true)
    })

    it('should return null for member execute on files', () => {
      expect(canExecute('member', 'file')).toBeNull()
    })

    it('should not allow viewer to execute', () => {
      expect(canExecute('viewer', 'file')).toBe(false)
    })

    it('should not allow any role to execute buckets', () => {
      expect(canExecute('admin', 'bucket')).toBe(false)
      expect(canExecute('member', 'bucket')).toBe(false)
    })
  })

  describe('canDelete', () => {
    it('should allow admin to delete files and buckets', () => {
      expect(canDelete('admin', 'file')).toBe(true)
      expect(canDelete('admin', 'bucket')).toBe(true)
    })

    it('should return null for member delete on files', () => {
      expect(canDelete('member', 'file')).toBeNull()
    })

    it('should not allow member to delete buckets', () => {
      expect(canDelete('member', 'bucket')).toBe(false)
    })

    it('should not allow viewer to delete anything', () => {
      expect(canDelete('viewer', 'file')).toBe(false)
      expect(canDelete('viewer', 'bucket')).toBe(false)
    })
  })

  describe('canList', () => {
    it('should allow all roles to list files and folders', () => {
      expect(canList('admin', 'file')).toBe(true)
      expect(canList('member', 'file')).toBe(true)
      expect(canList('viewer', 'file')).toBe(true)
      expect(canList('admin', 'folder')).toBe(true)
      expect(canList('member', 'folder')).toBe(true)
      expect(canList('viewer', 'folder')).toBe(true)
    })

    it('should allow admin to list buckets', () => {
      expect(canList('admin', 'bucket')).toBe(true)
    })

    it('should not allow member and viewer to list buckets', () => {
      expect(canList('member', 'bucket')).toBe(false)
      expect(canList('viewer', 'bucket')).toBe(true)
    })
  })

  describe('Rule Permissions', () => {
    it('should allow admin to modify rules', () => {
      expect(canModifyRule('admin')).toBe(true)
    })

    it('should not allow member to modify rules', () => {
      expect(canModifyRule('member')).toBe(false)
    })

    it('should not allow viewer to modify rules', () => {
      expect(canModifyRule('viewer')).toBe(false)
    })

    it('should allow admin to set rule limits', () => {
      expect(canLimitRule('admin')).toBe(true)
    })

    it('should not allow member to set rule limits', () => {
      expect(canLimitRule('member')).toBe(false)
    })

    it('should not allow viewer to set rule limits', () => {
      expect(canLimitRule('viewer')).toBe(false)
    })

    it('should allow all roles to list rules', () => {
      expect(canListRule('admin')).toBe(true)
      expect(canListRule('member')).toBe(true)
      expect(canListRule('viewer')).toBe(true)
    })
  })
})
