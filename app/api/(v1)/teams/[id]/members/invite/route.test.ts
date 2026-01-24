import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'
import Database from '@/app/db/connect'
import TeamRole from '@/app/db/teamRole'
import * as jwtNode from '@/app/utils/jwt-node'
import * as emailUtils from '@/app/utils/email'
import * as helpers from '../../../_helpers'
import { Repository } from 'typeorm'
import { TeamMember } from '@/app/db/entities/TeamMember'
import { Team } from '@/app/db/entities/Team'
import { TeamInvite } from '@/app/db/entities/TeamInvite'

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
    sendTeamInviteEmail: vi.fn(),
}))

vi.mock('../../../_helpers', () => ({
    ensureDb: vi.fn(),
    getMembership: vi.fn(),
    getTeamById: vi.fn(),
}))

describe('POST /api/v1/teams/[id]/members/invite', () => {
    const mockInviteRepo = { save: vi.fn(), delete: vi.fn() }
    const mockUserId = 1
    const mockTeamId = 100
    
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(jwtNode.getUserIdFromRequest).mockReturnValue(mockUserId)
        vi.mocked(Database.getRepository).mockReturnValue(mockInviteRepo as unknown as Repository<TeamInvite>)
        
        vi.mocked(helpers.getMembership).mockResolvedValue({ role: TeamRole.ADMIN } as unknown as TeamMember)
        vi.mocked(helpers.getTeamById).mockResolvedValue({ id: mockTeamId, name: 'Test Team' } as unknown as Team) // Using Team from imports? Wait, I added Team import? No I added TeamMember and TeamInvite. I forgot Team?
        
        mockInviteRepo.save.mockImplementation((invite) => {
            invite.id = 1
            return Promise.resolve(invite)
        })
        mockInviteRepo.delete.mockResolvedValue({ affected: 1 })
    })

    const createRequest = (body: unknown) => {
        return new NextRequest(`http://localhost:3000/api/v1/teams/${mockTeamId}/members/invite`, {
            method: 'POST',
            body: JSON.stringify(body),
        })
    }

    const context = { params: Promise.resolve({ id: String(mockTeamId) }) }

    it('should return 401 if not authenticated', async () => {
        vi.mocked(jwtNode.getUserIdFromRequest).mockReturnValue(null)
        const req = createRequest({})
        const res = await POST(req, context)
        expect(res.status).toBe(401)
    })

    it('should return 400 for invalid team id', async () => {
        const req = createRequest({})
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

    it('should return 400 for invalid email', async () => {
        const req = createRequest({ email: 'invalid-email' })
        const res = await POST(req, context)
        expect(res.status).toBe(400)
    })

    it('should return 400 for invalid role', async () => {
        const req = createRequest({ email: 'test@example.com', role: 'invalid-role' })
        const res = await POST(req, context)
        expect(res.status).toBe(400)
    })

    it('should return 403 if user is not admin', async () => {
        vi.mocked(helpers.getMembership).mockResolvedValue({ role: TeamRole.MEMBER } as unknown as TeamMember)
        const req = createRequest({ email: 'test@example.com' })
        const res = await POST(req, context)
        expect(res.status).toBe(403)
    })

    it('should return 404 if team not found', async () => {
        vi.mocked(helpers.getTeamById).mockResolvedValue(null)
        const req = createRequest({ email: 'test@example.com' })
        const res = await POST(req, context)
        expect(res.status).toBe(404)
    })

    it('should successfully create invite and send email', async () => {
        const req = createRequest({ email: 'test@example.com', role: TeamRole.MEMBER })
        const res = await POST(req, context)
        
        expect(res.status).toBe(201)
        expect(mockInviteRepo.save).toHaveBeenCalled()
        expect(emailUtils.sendTeamInviteEmail).toHaveBeenCalledWith(expect.objectContaining({
            email: 'test@example.com',
            teamName: 'Test Team'
        }))
    })

    it('should rollback and return 500 if email fails', async () => {
        vi.mocked(emailUtils.sendTeamInviteEmail).mockRejectedValue(new Error('Email failed'))
        
        const req = createRequest({ email: 'test@example.com' })
        const res = await POST(req, context)
        
        expect(res.status).toBe(500)
        expect(mockInviteRepo.delete).toHaveBeenCalled()
    })
})
