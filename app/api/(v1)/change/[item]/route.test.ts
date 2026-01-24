import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PUT } from './route'
import { NextRequest } from 'next/server'
import Database from '@/app/db/connect'
import { User } from '@/app/db/entities/User'
import * as jwtNode from '@/app/utils/jwt-node'
import * as emailUtils from '@/app/utils/email'
import { Repository } from 'typeorm'

// Mock dependencies
vi.mock('@/app/db/connect', () => ({
    default: {
        isInitialized: true,
        initialize: vi.fn(),
        getRepository: vi.fn(),
    }
}))

vi.mock('@/app/utils/jwt-node', () => ({
    getUserIdFromRequest: vi.fn(),
}))

vi.mock('@/app/utils/email', () => ({
    sendEmailChangedEmail: vi.fn(),
    sendUsernameChangedEmail: vi.fn(),
    sendPasswordChangedEmail: vi.fn(),
}))

// Mock User entity static method
User.comparePassword = vi.fn()

describe('PUT /api/v1/change/[item]', () => {
    const mockUserRepo = {
        findOne: vi.fn(),
        save: vi.fn(),
    }
    const mockUserId = 1
    const mockUser = {
        id: mockUserId,
        email: 'old@example.com',
        username: 'olduser',
        password: 'hashedpassword',
        firstname: 'Old',
        lastname: 'Name',
        originalPassword: null,
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(Database.getRepository).mockReturnValue(mockUserRepo as unknown as Repository<User>)
        vi.mocked(jwtNode.getUserIdFromRequest).mockReturnValue(mockUserId)
        mockUserRepo.findOne.mockResolvedValue({ ...mockUser })
        mockUserRepo.save.mockImplementation((u) => Promise.resolve(u))
    })

    const createRequest = (item: string, body: unknown) => {
        return new NextRequest(`http://localhost:3000/api/v1/change/${item}`, {
            method: 'PUT',
            body: JSON.stringify(body),
        })
    }

    const createContext = (item: string) => ({
        params: Promise.resolve({ item }),
    })

    it('should return 400 for unsupported item', async () => {
        const req = createRequest('invalid', {})
        const res = await PUT(req, createContext('invalid'))
        expect(res.status).toBe(400)
        expect(await res.json()).toEqual({ error: 'Unsupported field' })
    })

    it('should return 401 if not authenticated', async () => {
        vi.mocked(jwtNode.getUserIdFromRequest).mockReturnValue(null)
        const req = createRequest('email', { value: 'new@example.com' })
        const res = await PUT(req, createContext('email'))
        expect(res.status).toBe(401)
        expect(await res.json()).toEqual({ error: 'Unauthorized' })
    })

    it('should return 404 if user not found', async () => {
        mockUserRepo.findOne.mockResolvedValue(null)
        const req = createRequest('email', { value: 'new@example.com' })
        const res = await PUT(req, createContext('email'))
        expect(res.status).toBe(404)
        expect(await res.json()).toEqual({ error: 'User not found' })
    })

    describe('Email Change', () => {
        it('should update email and send notifications', async () => {
            const newEmail = 'new@example.com'
            const req = createRequest('email', { value: newEmail })
            
            const res = await PUT(req, createContext('email'))
            
            expect(res.status).toBe(200)
            expect(mockUserRepo.save).toHaveBeenCalled()
            expect(emailUtils.sendEmailChangedEmail).toHaveBeenCalledTimes(2)
            expect(emailUtils.sendEmailChangedEmail).toHaveBeenCalledWith(expect.objectContaining({
                to: newEmail,
                context: 'notify-new'
            }))
            expect(emailUtils.sendEmailChangedEmail).toHaveBeenCalledWith(expect.objectContaining({
                to: mockUser.email,
                context: 'notify-old'
            }))
        })

        it('should return 409 if email already in use', async () => {
            mockUserRepo.findOne
                .mockResolvedValueOnce({ ...mockUser }) // find user
                .mockResolvedValueOnce({ id: 2, email: 'exists@example.com' }) // check existing

            const req = createRequest('email', { value: 'exists@example.com' })
            const res = await PUT(req, createContext('email'))
            
            expect(res.status).toBe(409)
            expect(await res.json()).toEqual({ error: 'Email already in use' })
        })

        it('should rollback and return 500 if notification fails', async () => {
            vi.mocked(emailUtils.sendEmailChangedEmail).mockRejectedValue(new Error('Email failed'))
            
            const req = createRequest('email', { value: 'new@example.com' })
            const res = await PUT(req, createContext('email'))
            
            expect(res.status).toBe(500)
            // Verify rollback: save called with original email
            expect(mockUserRepo.save).toHaveBeenLastCalledWith(expect.objectContaining({
                email: mockUser.email
            }))
        })
    })

    describe('Username Change', () => {
        it('should update username and send notification', async () => {
            const newUsername = 'newuser'
            const req = createRequest('username', { value: newUsername })
            
            const res = await PUT(req, createContext('username'))
            
            expect(res.status).toBe(200)
            expect(mockUserRepo.save).toHaveBeenCalled()
            expect(emailUtils.sendUsernameChangedEmail).toHaveBeenCalledWith({
                email: mockUser.email,
                username: newUsername
            })
        })

        it('should return 409 if username already in use', async () => {
            mockUserRepo.findOne
                .mockResolvedValueOnce({ ...mockUser })
                .mockResolvedValueOnce({ id: 2, username: 'exists' })

            const req = createRequest('username', { value: 'exists' })
            const res = await PUT(req, createContext('username'))
            
            expect(res.status).toBe(409)
            expect(await res.json()).toEqual({ error: 'Username already in use' })
        })

        it('should rollback and return 500 if notification fails', async () => {
            vi.mocked(emailUtils.sendUsernameChangedEmail).mockRejectedValue(new Error('Email failed'))
            // Mock re-fetching user for rollback
            mockUserRepo.findOne
                .mockResolvedValueOnce({ ...mockUser }) // initial fetch
                .mockResolvedValueOnce(null) // check existing (none)
                .mockResolvedValueOnce({ ...mockUser, username: 'newuser' }) // fetch for rollback

            const req = createRequest('username', { value: 'newuser' })
            const res = await PUT(req, createContext('username'))
            
            expect(res.status).toBe(500)
            // Verify rollback
            expect(mockUserRepo.save).toHaveBeenLastCalledWith(expect.objectContaining({
                username: mockUser.username
            }))
        })
    })

    describe('Password Change', () => {
        it('should update password if current password is valid', async () => {
            vi.mocked(User.comparePassword).mockResolvedValue(true)
            
            const req = createRequest('password', { 
                currentPassword: 'oldpass', 
                newPassword: 'newpass' 
            })
            
            const res = await PUT(req, createContext('password'))
            
            expect(res.status).toBe(200)
            expect(mockUserRepo.save).toHaveBeenCalled()
            expect(emailUtils.sendPasswordChangedEmail).toHaveBeenCalled()
        })

        it('should return 401 if current password is invalid', async () => {
            vi.mocked(User.comparePassword).mockResolvedValue(false)
            
            const req = createRequest('password', { 
                currentPassword: 'wrong', 
                newPassword: 'newpass' 
            })
            
            const res = await PUT(req, createContext('password'))
            
            expect(res.status).toBe(401)
        })

        it('should rollback and return 500 if notification fails', async () => {
            vi.mocked(User.comparePassword).mockResolvedValue(true)
            vi.mocked(emailUtils.sendPasswordChangedEmail).mockRejectedValue(new Error('Email failed'))
            
            const req = createRequest('password', { 
                currentPassword: 'oldpass', 
                newPassword: 'newpass' 
            })
            
            const res = await PUT(req, createContext('password'))
            
            expect(res.status).toBe(500)
            // Verify rollback
            expect(mockUserRepo.save).toHaveBeenLastCalledWith(expect.objectContaining({
                password: mockUser.password
            }))
        })
    })
})
