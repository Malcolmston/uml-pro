import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'
import Database from '@/app/db/connect'
import Invite from '@/app/db/invite'
import TeamRole from '@/app/db/teamRole'
import * as jwtNode from '@/app/utils/jwt-node'
import * as emailUtils from '@/app/utils/email'
import * as helpers from '../../../../_helpers'
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

vi.mock('../../../../_helpers', () => ({
    ensureDb: vi.fn(),
    getMembership: vi.fn(),
    getTeamById: vi.fn(),
}))

describe('POST /api/v1/teams/[id]/members/invite/resend', () => {
    const mockInviteRepo = { 
        findOne: vi.fn(), 
        save: vi.fn().mockImplementation((entity) => Promise.resolve(entity)),
        update: vi.fn().mockResolvedValue({ affected: 1 })
    }
    const mockUserId = 1
    const mockTeamId = 100
    const mockInviteId = 10
    
    const mockInvite = {
        id: mockInviteId,
        teamId: mockTeamId,
        token: 'old-token',
        email: 'test@example.com',
        status: Invite.PENDING,
        role: TeamRole.MEMBER
    }

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(jwtNode.getUserIdFromRequest).mockReturnValue(mockUserId)
        vi.mocked(Database.getRepository).mockReturnValue(mockInviteRepo as unknown as Repository<TeamInvite>)
        
        vi.mocked(helpers.getMembership).mockResolvedValue({ role: TeamRole.ADMIN } as unknown as TeamMember)
        vi.mocked(helpers.getTeamById).mockResolvedValue({ id: mockTeamId, name: 'Test Team' } as unknown as Team)
        
        mockInviteRepo.findOne.mockResolvedValue({ ...mockInvite })
        mockInviteRepo.save.mockImplementation((invite) => Promise.resolve(invite))
    })

    const createRequest = (body: unknown) => {
        return new NextRequest(`http://localhost:3000/api/v1/teams/${mockTeamId}/members/invite/resend`, {
            method: 'POST',
            body: JSON.stringify(body),
        })
    }

    const context = { params: Promise.resolve({ id: String(mockTeamId) }) }

    it('should return 401 if not authenticated', async () => {
        vi.mocked(jwtNode.getUserIdFromRequest).mockReturnValue(null)
        const req = createRequest({ inviteId: mockInviteId })
        const res = await POST(req, context)
        expect(res.status).toBe(401)
    })

    it('should return 400 for invalid team id', async () => {
        const req = createRequest({ inviteId: mockInviteId })
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

    it('should return 400 if inviteId is missing', async () => {
        const req = createRequest({})
        const res = await POST(req, context)
        expect(res.status).toBe(400)
    })

    it('should return 403 if user is not admin', async () => {
        vi.mocked(helpers.getMembership).mockResolvedValue({ role: TeamRole.MEMBER } as unknown as TeamMember)
        const req = createRequest({ inviteId: mockInviteId })
        const res = await POST(req, context)
        expect(res.status).toBe(403)
    })

    it('should return 404 if invite not found', async () => {
        mockInviteRepo.findOne.mockResolvedValue(null)
        const req = createRequest({ inviteId: mockInviteId })
        const res = await POST(req, context)
        expect(res.status).toBe(404)
    })

    it('should return 400 if invite is not pending', async () => {
        mockInviteRepo.findOne.mockResolvedValue({ ...mockInvite, status: Invite.ACCEPTED })
        const req = createRequest({ inviteId: mockInviteId })
        const res = await POST(req, context)
        expect(res.status).toBe(400)
    })

    it('should return 404 if team not found', async () => {
        vi.mocked(helpers.getTeamById).mockResolvedValue(null)
        const req = createRequest({ inviteId: mockInviteId })
        const res = await POST(req, context)
        expect(res.status).toBe(404)
    })

    it('should successfully resend invite with new token', async () => {
        const req = createRequest({ inviteId: mockInviteId })
        const res = await POST(req, context)
        
        expect(res.status).toBe(200)
        expect(mockInviteRepo.update).toHaveBeenCalled()
        const updateArgs = mockInviteRepo.update.mock.calls[0][1]
        expect(updateArgs.token).not.toBe('old-token')
        
        expect(emailUtils.sendTeamInviteEmail).toHaveBeenCalledWith(expect.objectContaining({
            email: 'test@example.com',
            teamName: 'Test Team',
            teamId: mockTeamId,
            token: updateArgs.token
        }))
    })

    it('should revert token and return 500 if email fails', async () => {
        vi.mocked(emailUtils.sendTeamInviteEmail).mockRejectedValue(new Error('Email failed'))
        
        const req = createRequest({ inviteId: mockInviteId })
        const res = await POST(req, context)
        
        expect(res.status).toBe(500)
        // Verify rollback (second update call should have original token)
        expect(mockInviteRepo.update).toHaveBeenCalledTimes(2)
        const revertedInvite = mockInviteRepo.update.mock.calls[1][1]
        expect(revertedInvite.token).toBe('old-token')
    })
})
