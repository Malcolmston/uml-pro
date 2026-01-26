import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'
import Database from '@/app/db/connect'
import Invite from '@/app/db/invite'
import * as jwtNode from '@/app/utils/jwt-node'
import { Repository } from 'typeorm'
import { User } from '@/app/db/entities/User'
import { TeamInvite } from '@/app/db/entities/TeamInvite'

// Mock dependencies
vi.mock('@/app/db/connect', () => ({
    default: {
        isInitialized: true,
        initialize: vi.fn(),
        getRepository: vi.fn(),
        transaction: vi.fn(),
    }
}))

vi.mock('@/app/utils/jwt-node', () => ({
    getUserIdFromRequest: vi.fn(),
}))

vi.mock('../../../../_helpers', () => ({
    ensureDb: vi.fn(),
}))

describe('POST /api/v1/teams/[id]/members/invite/accept', () => {
    const mockUserRepo = { findOne: vi.fn() }
    const mockInviteRepo = { findOne: vi.fn(), save: vi.fn(), update: vi.fn().mockResolvedValue({ affected: 1 }) }
    const mockMemberRepo = { findOne: vi.fn(), save: vi.fn() }
    const mockEntityManager = {
        getRepository: vi.fn((entity: unknown) => {
            const entityName = typeof entity === 'function' ? entity.name : (entity as { name: string }).name;
            if (entityName === 'TeamMember') return mockMemberRepo
            if (entityName === 'TeamInvite') return mockInviteRepo
            return null
        })
    }

    const mockUserId = 1
    const mockTeamId = 100
    const mockToken = 'valid-token'
    
    const mockUser = { id: mockUserId, email: 'user@example.com' }
    const mockInvite = { 
        id: 1, 
        teamId: mockTeamId, 
        token: mockToken, 
        email: 'user@example.com', 
        status: Invite.PENDING, 
        role: 'member' 
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(jwtNode.getUserIdFromRequest).mockReturnValue(mockUserId)
        vi.mocked(Database.getRepository).mockImplementation((entity: unknown) => {
            const entityName = typeof entity === 'function' ? entity.name : (entity as { name: string }).name;
            if (entityName === 'User') return mockUserRepo as unknown as Repository<User>
            if (entityName === 'TeamInvite') return mockInviteRepo as unknown as Repository<TeamInvite>
            return {} as unknown as Repository<User>
        })
        vi.mocked(Database.transaction).mockImplementation((...args: unknown[]) => {
            const cb = (args.length > 1 ? args[1] : args[0]) as (em: unknown) => Promise<unknown>
            return cb(mockEntityManager)
        })

        mockUserRepo.findOne.mockResolvedValue({ ...mockUser })
        mockInviteRepo.findOne.mockResolvedValue({ ...mockInvite })
        mockMemberRepo.findOne.mockResolvedValue(null) // No existing member
    })

    const createRequest = (body: unknown) => {
        return new NextRequest(`http://localhost:3000/api/v1/teams/${mockTeamId}/members/invite/accept`, {
            method: 'POST',
            body: JSON.stringify(body),
        })
    }

    const context = { params: Promise.resolve({ id: String(mockTeamId) }) }

    it('should return 401 if not authenticated', async () => {
        vi.mocked(jwtNode.getUserIdFromRequest).mockReturnValue(null)
        const req = createRequest({ token: mockToken })
        const res = await POST(req, context)
        expect(res.status).toBe(401)
    })

    it('should return 400 for invalid team id', async () => {
        const req = createRequest({ token: mockToken })
        const res = await POST(req, { params: Promise.resolve({ id: 'invalid' }) })
        expect(res.status).toBe(400)
    })

    it('should return 400 for invalid JSON', async () => {
        const req = new NextRequest(`http://localhost:3000/api`, {
            method: 'POST',
            body: 'invalid-json',
        })
        const res = await POST(req, context)
        expect(res.status).toBe(400)
    })

    it('should return 400 if token is missing', async () => {
        const req = createRequest({})
        const res = await POST(req, context)
        expect(res.status).toBe(400)
    })

    it('should return 404 if user not found', async () => {
        mockUserRepo.findOne.mockResolvedValue(null)
        const req = createRequest({ token: mockToken })
        const res = await POST(req, context)
        expect(res.status).toBe(404)
    })

    it('should return 404 if invite not found', async () => {
        mockInviteRepo.findOne.mockResolvedValue(null)
        const req = createRequest({ token: mockToken })
        const res = await POST(req, context)
        expect(res.status).toBe(404)
    })

    it('should return 409 if invite is not PENDING', async () => {
        mockInviteRepo.findOne.mockResolvedValue({ ...mockInvite, status: Invite.ACCEPTED })
        const req = createRequest({ token: mockToken })
        const res = await POST(req, context)
        expect(res.status).toBe(409)
    })

    it('should return 403 if invite email does not match user email', async () => {
        mockInviteRepo.findOne.mockResolvedValue({ ...mockInvite, email: 'other@example.com' })
        const req = createRequest({ token: mockToken })
        const res = await POST(req, context)
        expect(res.status).toBe(403)
    })

    it('should successfully accept invite', async () => {
        const req = createRequest({ token: mockToken })
        const res = await POST(req, context)
        
        expect(res.status).toBe(200)
        expect(mockMemberRepo.save).toHaveBeenCalledWith(expect.objectContaining({
            teamId: mockTeamId,
            userId: mockUserId,
            role: mockInvite.role
        }))
        expect(mockInviteRepo.update).toHaveBeenCalledWith(
            { id: mockInvite.id },
            expect.objectContaining({
                status: Invite.ACCEPTED,
                teamId: mockTeamId
            })
        )
    })

    it('should handle race condition (duplicate member) gracefully', async () => {
        // Simulate duplicate key error
        mockMemberRepo.save.mockRejectedValue({ code: '23505' })
        
        const req = createRequest({ token: mockToken })
        const res = await POST(req, context)
        
        expect(res.status).toBe(200)
        // Should still update invite status
        expect(mockInviteRepo.update).toHaveBeenCalledWith(
            { id: mockInvite.id },
            expect.objectContaining({
                status: Invite.ACCEPTED,
                teamId: mockTeamId
            })
        )
    })

    it('should return 500 if transaction fails', async () => {
        mockMemberRepo.save.mockRejectedValue(new Error('DB Error'))
        
        const req = createRequest({ token: mockToken })
        const res = await POST(req, context)
        
        expect(res.status).toBe(500)
    })
})
