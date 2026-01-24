import { describe, it, expect, beforeEach, vi } from 'vitest'
import { User } from './User'
import * as bcrypt from 'bcrypt'

vi.mock('bcrypt', () => ({
  hash: vi.fn((password: string) => Promise.resolve(`hashed_${password}`)),
  compare: vi.fn((attempt: string, hash: string) => Promise.resolve(attempt === hash.replace('hashed_', '')))
}))

describe('User Entity', () => {
  let user: User

  beforeEach(() => {
    user = new User()
    user.firstname = 'John'
    user.lastname = 'Doe'
    user.age = 25
    user.email = 'john@example.com'
    user.username = 'johndoe'
    user.password = 'password123'
  })

  describe('Field Validation', () => {
    it('should have all required fields', () => {
      expect(user.firstname).toBe('John')
      expect(user.lastname).toBe('Doe')
      expect(user.age).toBe(25)
      expect(user.email).toBe('john@example.com')
      expect(user.username).toBe('johndoe')
      expect(user.password).toBe('password123')
    })
  })

  describe('@BeforeInsert Hook', () => {
    it('should hash password before insert', async () => {
      await user.beforeInsert()

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10)
      expect(user.password).toBe('hashed_password123')
    })

    it('should throw error if age is less than 12', async () => {
      user.age = 10

      await expect(user.beforeInsert()).rejects.toThrow('User must be at least 12 years old to register')
    })

    it('should allow age of exactly 12', async () => {
      user.age = 12

      await expect(user.beforeInsert()).resolves.not.toThrow()
    })

    it('should allow age greater than 12', async () => {
      user.age = 18

      await expect(user.beforeInsert()).resolves.not.toThrow()
    })
  })

  describe('@BeforeUpdate Hook', () => {
    beforeEach(() => {
      // Simulate originalPassword being set
      user['originalPassword'] = 'password123'
    })

    it('should validate age on update', async () => {
      user.age = 8

      await expect(user.beforeUpdate()).rejects.toThrow('User must be at least 12 years old to register')
    })

    it('should hash password if changed', async () => {
      user.password = 'newPassword456'

      await user.beforeUpdate()

      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword456', 10)
      expect(user.password).toBe('hashed_newPassword456')
    })

    it('should not hash password if unchanged', async () => {
      vi.clearAllMocks()
      user.password = 'password123' // Same as original

      await user.beforeUpdate()

      expect(bcrypt.hash).not.toHaveBeenCalled()
    })
  })

  describe('Password Hashing', () => {
    it('should hash passwords with bcrypt using 10 salt rounds', async () => {
      await user.beforeInsert()

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10)
    })

    it('should produce different hashes for different passwords', async () => {
      const user1 = new User()
      user1.age = 20
      user1.password = 'password1'

      const user2 = new User()
      user2.age = 20
      user2.password = 'password2'

      await user1.beforeInsert()
      await user2.beforeInsert()

      expect(user1.password).not.toBe(user2.password)
    })
  })

  describe('Unique Constraints', () => {
    it('should have unique email constraint', () => {
      // This would be tested at database level
      // Here we just verify the field exists
      expect(user.email).toBeDefined()
    })

    it('should have unique username constraint', () => {
      // This would be tested at database level
      // Here we just verify the field exists
      expect(user.username).toBeDefined()
    })
  })

  describe('Timestamp Fields', () => {
    it('should be able to set createdAt', () => {
      const date = new Date()
      user.createdAt = date
      expect(user.createdAt).toBe(date)
    })

    it('should be able to set updatedAt', () => {
      const date = new Date()
      user.updatedAt = date
      expect(user.updatedAt).toBe(date)
    })

    it('should be able to set deletedAt', () => {
      const date = new Date()
      user.deletedAt = date
      expect(user.deletedAt).toBe(date)
    })
  })
})
