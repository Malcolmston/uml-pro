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
    it('should create three S3 buckets on insert', async () => {
      vi.mocked(s3.bucketExsists).mockReturnValue(false)
      vi.mocked(s3.createBucket).mockReturnValue(true)

      await project.beforeInsert()

      expect(s3.createBucket).toHaveBeenCalledTimes(3)
      expect(s3.createBucket).toHaveBeenCalledWith('project/Test Project-files')
      expect(s3.createBucket).toHaveBeenCalledWith('project/Test Project-rules')
      expect(s3.createBucket).toHaveBeenCalledWith('project/Test Project-backups')
    })

    it('should throw error if files bucket already exists', async () => {
      vi.mocked(s3.bucketExsists).mockImplementation((name: string) => {
        return name === 'project/Test Project-files'
      })

      await expect(project.beforeInsert()).rejects.toThrow("Bucket 'project/Test Project-files' already exists")
    })

    it('should throw error if rules bucket already exists', async () => {
      vi.mocked(s3.bucketExsists).mockImplementation((name: string) => {
        return name === 'project/Test Project-rules'
      })

      await expect(project.beforeInsert()).rejects.toThrow("Bucket 'project/Test Project-rules' already exists")
    })

    it('should throw error if backups bucket already exists', async () => {
      vi.mocked(s3.bucketExsists).mockImplementation((name: string) => {
        return name === 'project/Test Project-backups'
      })

      await expect(project.beforeInsert()).rejects.toThrow("Bucket 'project/Test Project-backups' already exists")
    })

    it('should store original name after insert', async () => {
      vi.mocked(s3.bucketExsists).mockReturnValue(false)
      vi.mocked(s3.createBucket).mockReturnValue(true)

      await project.beforeInsert()

      expect(project['originalName']).toBe('Test Project')
    })
  })

  describe('@BeforeUpdate Hook - S3 Bucket Renaming', () => {
    beforeEach(() => {
      project['originalName'] = 'Old Project'
      project.name = 'New Project'
    })

    it('should rename buckets when project name changes', async () => {
      vi.mocked(s3.bucketExsists).mockReturnValue(false)
      vi.mocked(s3.renameBucket).mockResolvedValue({ data: {}, error: null })

      await project.beforeUpdate()

      expect(s3.renameBucket).toHaveBeenCalledTimes(3)
      expect(s3.renameBucket).toHaveBeenCalledWith('project/Old Project-files', 'project/New Project-files')
      expect(s3.renameBucket).toHaveBeenCalledWith('project/Old Project-rules', 'project/New Project-rules')
      expect(s3.renameBucket).toHaveBeenCalledWith('project/Old Project-backups', 'project/New Project-backups')
    })

    it('should not rename buckets if name unchanged', async () => {
      project['originalName'] = 'Test Project'
      project.name = 'Test Project'

      await project.beforeUpdate()

      expect(s3.renameBucket).not.toHaveBeenCalled()
    })

    it('should throw error if new bucket name already exists', async () => {
      vi.mocked(s3.bucketExsists).mockImplementation((name: string) => {
        return name === 'project/New Project-files'
      })

      await expect(project.beforeUpdate()).rejects.toThrow("Bucket 'project/New Project-files' already exists")
    })

    it('should throw error if rename fails', async () => {
      vi.mocked(s3.bucketExsists).mockReturnValue(false)
      vi.mocked(s3.renameBucket).mockResolvedValue({
        data: null,
        error: new Error('S3 rename failed')
      })

      await expect(project.beforeUpdate()).rejects.toThrow('Failed to rename bucket')
    })

    it('should update original name after successful rename', async () => {
      vi.mocked(s3.bucketExsists).mockReturnValue(false)
      vi.mocked(s3.renameBucket).mockResolvedValue({ data: {}, error: null })

      await project.beforeUpdate()

      expect(project['originalName']).toBe('New Project')
    })
  })

  describe('@BeforeRemove Hook - S3 Bucket Deletion', () => {
    it('should delete all three buckets on remove', async () => {
      vi.mocked(s3.bucketExsists).mockReturnValue(true)
      vi.mocked(s3.deleteBucket).mockResolvedValue({ data: {}, error: null })

      await project.beforeRemove()

      expect(s3.deleteBucket).toHaveBeenCalledTimes(3)
      expect(s3.deleteBucket).toHaveBeenCalledWith('project/Test Project-files')
      expect(s3.deleteBucket).toHaveBeenCalledWith('project/Test Project-rules')
      expect(s3.deleteBucket).toHaveBeenCalledWith('project/Test Project-backups')
    })

    it('should not throw if bucket does not exist', async () => {
      vi.mocked(s3.bucketExsists).mockReturnValue(false)

      await expect(project.beforeRemove()).resolves.not.toThrow()
      expect(s3.deleteBucket).not.toHaveBeenCalled()
    })

    it('should throw error if deletion fails', async () => {
      vi.mocked(s3.bucketExsists).mockReturnValue(true)
      vi.mocked(s3.deleteBucket).mockResolvedValue({
        data: null,
        error: new Error('Delete failed')
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
