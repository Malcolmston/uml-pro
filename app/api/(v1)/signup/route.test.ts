import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'
import Database from '@/app/db/connect'
import * as jwtNode from '@/app/utils/jwt-node'
import * as emailUtils from '@/app/utils/email'
import { Repository } from 'typeorm'
import { User } from '@/app/db/entities/User'

// Mock dependencies
vi.mock('@/app/db/connect', () => ({
    default: {
        isInitialized: true,
        initialize: vi.fn(),
        getRepository: vi.fn(),
    }
}))

vi.mock('@/app/utils/jwt-node', () => ({
    signJwt: vi.fn(),
}))

vi.mock('@/app/utils/email', () => ({
    sendWelcomeEmail: vi.fn(),
}))

describe('POST /api/v1/signup', () => {
    const mockUserRepo = { findOne: vi.fn(), save: vi.fn() }
    
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(Database.getRepository).mockReturnValue(mockUserRepo as unknown as Repository<User>)
        vi.mocked(jwtNode.signJwt).mockReturnValue('mock-token')
        
        mockUserRepo.findOne.mockResolvedValue(null)
        mockUserRepo.save.mockImplementation((user) => {
            user.id = 1
            return Promise.resolve(user)
        })
    })

    const createRequest = (body: unknown) => {
        return new NextRequest(`http://localhost:3000/api/v1/signup`, {
            method: 'POST',
            body: JSON.stringify(body),
        })
    }

    const validBody = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        username: 'johndoe',
        password: 'password123',
        cofPassword: 'password123',
        age: 20
    }

    it('should return 400 if age is less than 13', async () => {
        const req = createRequest({ ...validBody, age: 12 })
        const res = await POST(req)
        expect(res.status).toBe(400)
        expect(await res.json()).toEqual({ error: "You must be at least 13 years old to sign up" })
    })

    it('should return 400 if required fields are missing', async () => {
        const req = createRequest({ ...validBody, email: '' })
        const res = await POST(req)
        expect(res.status).toBe(400)
        expect(await res.json()).toEqual({ error: "Missing required fields" })
    })

    it('should return 400 if passwords do not match', async () => {
        const req = createRequest({ ...validBody, cofPassword: 'different' })
        const res = await POST(req)
        expect(res.status).toBe(400)
        expect(await res.json()).toEqual({ error: "Passwords do not match" })
    })

    it('should return 400 if user was deleted', async () => {
        mockUserRepo.findOne.mockResolvedValue({ deletedAt: new Date() })
        const req = createRequest(validBody)
        const res = await POST(req)
        expect(res.status).toBe(400)
        expect((await res.json()).error).toBe("User was deleted")
    })

    it('should return 400 if user already exists', async () => {
        mockUserRepo.findOne.mockResolvedValue({ id: 1 })
        const req = createRequest(validBody)
        const res = await POST(req)
        expect(res.status).toBe(400)
        expect(await res.json()).toEqual({ error: "User already exists, please signin" })
    })

    it('should return 500 if JWT signing fails', async () => {
        vi.mocked(jwtNode.signJwt).mockReturnValue(null)
        const req = createRequest(validBody)
        const res = await POST(req)
        expect(res.status).toBe(500)
        expect(await res.json()).toEqual({ error: "JWT secret not configured" })
    })

    it('should successfully create user and send email', async () => {
        const req = createRequest(validBody)
        const res = await POST(req)
        
        expect(res.status).toBe(201)
        expect(mockUserRepo.save).toHaveBeenCalled()
        expect(emailUtils.sendWelcomeEmail).toHaveBeenCalledWith(validBody.email, validBody.firstName)
        expect(await res.json()).toMatchObject({
            success: true,
            token: 'mock-token',
            user: {
                id: 1,
                email: validBody.email,
                username: validBody.username
            }
        })
    })

    it('should succeed even if email fails', async () => {
        vi.mocked(emailUtils.sendWelcomeEmail).mockRejectedValue(new Error('Email failed'))
        
        const req = createRequest(validBody)
        const res = await POST(req)
        
        expect(res.status).toBe(201)
        // User should still be created
        expect(mockUserRepo.save).toHaveBeenCalled()
    })
})
