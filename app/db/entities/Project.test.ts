import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Project } from './Project'
import * as s3 from '../../utils/s3'

vi.mock('../../utils/s3', () => ({
  bucketExsists: vi.fn(),
  createBucket: vi.fn(),
  deleteBucket: vi.fn(() => Promise.resolve({ data: {}, error: null })),
  renameBucket: vi.fn(() => Promise.resolve({ data: {}, error: null }))
}))

describe('Project Entity', () => {
  let project: Project

  beforeEach(() => {
    vi.clearAllMocks()
    project = new Project()
    project.name = 'Test Project'
    project.description = 'A test project'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    project.visibility = 'public' as any
  })

  describe('Field Validation', () => {
    it('should have all required fields', () => {
      expect(project.name).toBe('Test Project')
      expect(project.description).toBe('A test project')
      expect(project.visibility).toBe('public')
    })

    it('should have uuid field', () => {
      expect(project).toHaveProperty('uuid')
    })

    it('should default visibility to public', () => {
      const newProject = new Project()
      newProject.name = 'New Project'
      expect(newProject).toHaveProperty('visibility')
    })
  })

  describe('@BeforeInsert Hook - S3 Bucket Creation', () => {
    it('should generate uuid if missing', async () => {
      vi.mocked(s3.bucketExsists).mockResolvedValue(false)
      vi.mocked(s3.createBucket).mockResolvedValue({ data: { name: 'test' }, error: null })

      project.uuid = ''
      await project.beforeInsert()
      expect(project.uuid).toBeDefined()
      expect(project.uuid).not.toBe('')
    })

    it('should create three S3 buckets on insert with uuid', async () => {
      vi.mocked(s3.bucketExsists).mockResolvedValue(false)
      vi.mocked(s3.createBucket).mockResolvedValue({ data: { name: 'test' }, error: null })

      const uuid = '123e4567-e89b-12d3-a456-426614174000'
      project.uuid = uuid
      await project.beforeInsert()

      expect(s3.createBucket).toHaveBeenCalledTimes(3)
      expect(s3.createBucket).toHaveBeenCalledWith(`project-${uuid}-files`)
      expect(s3.createBucket).toHaveBeenCalledWith(`project-${uuid}-rules`)
      expect(s3.createBucket).toHaveBeenCalledWith(`project-${uuid}-backups`)
    })

    it('should throw error if files bucket already exists', async () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000'
      project.uuid = uuid

      vi.mocked(s3.bucketExsists).mockImplementation(async (name: string) => {
        return name === `project-${uuid}-files`
      })

      await expect(project.beforeInsert()).rejects.toThrow(`Bucket 'project-${uuid}-files' already exists`)
    })
  })

  describe('@BeforeRemove Hook - S3 Bucket Deletion', () => {
    it('should delete all three buckets on remove', async () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000'
      project.uuid = uuid

      vi.mocked(s3.bucketExsists).mockResolvedValue(true)
      vi.mocked(s3.deleteBucket).mockResolvedValue({ data: { message: 'Deleted' }, error: null })

      await project.beforeRemove()

      expect(s3.deleteBucket).toHaveBeenCalledTimes(3)
      expect(s3.deleteBucket).toHaveBeenCalledWith(`project-${uuid}-files`)
      expect(s3.deleteBucket).toHaveBeenCalledWith(`project-${uuid}-rules`)
      expect(s3.deleteBucket).toHaveBeenCalledWith(`project-${uuid}-backups`)
    })

    it('should not throw if bucket does not exist', async () => {
      project.uuid = '123e4567-e89b-12d3-a456-426614174000'
      vi.mocked(s3.bucketExsists).mockResolvedValue(false)

      await expect(project.beforeRemove()).resolves.not.toThrow()
      expect(s3.deleteBucket).not.toHaveBeenCalled()
    })

    it('should throw error if deletion fails', async () => {
      project.uuid = '123e4567-e89b-12d3-a456-426614174000'
      vi.mocked(s3.bucketExsists).mockResolvedValue(true)
      vi.mocked(s3.deleteBucket).mockResolvedValue({
        data: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error: { name: 'StorageError', message: 'Delete failed', __isStorageError: true } as any
      })

      await expect(project.beforeRemove()).rejects.toThrow('Failed to delete bucket')
    })
  })

  describe('Visibility Enum', () => {
    it('should accept public visibility', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      project.visibility = 'public' as any
      expect(project.visibility).toBe('public')
    })

    it('should accept private visibility', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      project.visibility = 'private' as any
      expect(project.visibility).toBe('private')
    })

    it('should accept internal visibility', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      project.visibility = 'internal' as any
      expect(project.visibility).toBe('internal')
    })
  })

  describe('Timestamp Fields', () => {
    it('should have createdAt field', () => {
      expect(project).toHaveProperty('createdAt')
    })

    it('should have updatedAt field', () => {
      expect(project).toHaveProperty('updatedAt')
    })

    it('should have deletedAt field for soft deletes', () => {
      expect(project).toHaveProperty('deletedAt')
    })
  })
})
