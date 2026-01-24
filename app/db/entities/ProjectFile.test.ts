import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ProjectFile } from './ProjectFile'
import * as s3 from '../../utils/s3'

vi.mock('../../utils/s3', () => ({
  uploadFile: vi.fn(() => Promise.resolve({ data: { path: 'test.txt' }, error: null })),
  deleteFile: vi.fn(() => Promise.resolve({ data: {}, error: null })),
  renameFile: vi.fn(() => Promise.resolve({ data: {}, error: null }))
}))

describe('ProjectFile Entity', () => {
  let projectFile: ProjectFile

  beforeEach(() => {
    vi.clearAllMocks()
    projectFile = new ProjectFile()
    projectFile.projectId = 1
    projectFile.fileName = 'test.txt'
    projectFile.s3Bucket = 'project/test-files'
    projectFile.s3Key = 'test.txt'
    projectFile.fileSize = 1024
    projectFile.mimeType = 'text/plain'
  })

  describe('Field Validation', () => {
    it('should have all required fields', () => {
      expect(projectFile.projectId).toBe(1)
      expect(projectFile.fileName).toBe('test.txt')
      expect(projectFile.s3Bucket).toBe('project/test-files')
      expect(projectFile.s3Key).toBe('test.txt')
      expect(projectFile.fileSize).toBe(1024)
      expect(projectFile.mimeType).toBe('text/plain')
    })

    it('should have optional s3Url field', () => {
      expect(projectFile).toHaveProperty('s3Url')
    })
  })

  describe('@AfterLoad Hook', () => {
    it('should store original fileName and s3Key', () => {
      projectFile.afterLoad()

      expect(projectFile['originalFileName']).toBe('test.txt')
      expect(projectFile['originalS3Key']).toBe('test.txt')
    })
  })

  describe('@BeforeInsert Hook', () => {
    it('should validate fileName is required', async () => {
      projectFile.fileName = ''

      await expect(projectFile.beforeInsert()).rejects.toThrow('File name is required')
    })

    it('should validate s3Bucket is required', async () => {
      projectFile.s3Bucket = ''

      await expect(projectFile.beforeInsert()).rejects.toThrow('S3 bucket is required')
    })

    it('should auto-generate s3Key from fileName if not provided', async () => {
      projectFile.s3Key = ''

      await projectFile.beforeInsert()

      expect(projectFile.s3Key).toBe('test.txt')
    })

    it('should keep provided s3Key if exists', async () => {
      projectFile.s3Key = 'custom/path/file.txt'

      await projectFile.beforeInsert()

      expect(projectFile.s3Key).toBe('custom/path/file.txt')
    })

    it('should store original values after insert', async () => {
      await projectFile.beforeInsert()

      expect(projectFile['originalFileName']).toBe('test.txt')
      expect(projectFile['originalS3Key']).toBe('test.txt')
    })
  })

  describe('@BeforeUpdate Hook - File Renaming', () => {
    beforeEach(() => {
      projectFile['originalFileName'] = 'old.txt'
      projectFile['originalS3Key'] = 'old.txt'
      projectFile.fileName = 'new.txt'
    })

    it('should rename file in S3 when fileName changes', async () => {
      vi.mocked(s3.renameFile).mockResolvedValue({ data: { message: 'Renamed' }, error: null })

      await projectFile.beforeUpdate()

      expect(s3.renameFile).toHaveBeenCalledWith('project/test-files', 'old.txt', 'new.txt')
    })

    it('should update s3Key when fileName changes and s3Key matched original fileName', async () => {
      vi.mocked(s3.renameFile).mockResolvedValue({ data: { message: 'Renamed' }, error: null })

      await projectFile.beforeUpdate()

      expect(projectFile.s3Key).toBe('new.txt')
    })

    it('should not rename if fileName unchanged', async () => {
      projectFile['originalFileName'] = 'test.txt'
      projectFile.fileName = 'test.txt'

      await projectFile.beforeUpdate()

      expect(s3.renameFile).not.toHaveBeenCalled()
    })

    it('should throw error if S3 rename fails', async () => {
      vi.mocked(s3.renameFile).mockResolvedValue({
        data: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error: { name: 'StorageError', message: 'Rename failed', __isStorageError: true } as any
      })

      await expect(projectFile.beforeUpdate()).rejects.toThrow('Failed to rename file in S3')
    })

    it('should update original values after successful rename', async () => {
      vi.mocked(s3.renameFile).mockResolvedValue({ data: { message: 'Renamed' }, error: null })

      await projectFile.beforeUpdate()

      expect(projectFile['originalFileName']).toBe('new.txt')
      expect(projectFile['originalS3Key']).toBe('new.txt')
    })

    it('should not update s3Key if it was custom path', async () => {
      projectFile['originalS3Key'] = 'custom/old.txt'
      projectFile.s3Key = 'custom/old.txt'
      vi.mocked(s3.renameFile).mockResolvedValue({ data: { message: 'Renamed' }, error: null })

      await projectFile.beforeUpdate()

      // s3Key should remain as-is since it doesn't match originalFileName
      expect(projectFile.s3Key).toBe('custom/old.txt')
    })
  })

  describe('@BeforeRemove Hook - File Deletion', () => {
    it('should delete file from S3 on remove', async () => {
      vi.mocked(s3.deleteFile).mockResolvedValue({ data: [], error: null })

      await projectFile.beforeRemove()

      expect(s3.deleteFile).toHaveBeenCalledWith('project/test-files', 'test.txt')
    })

    it('should throw error if S3 deletion fails', async () => {
      vi.mocked(s3.deleteFile).mockResolvedValue({
        data: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error: { name: 'StorageError', message: 'Delete failed', __isStorageError: true } as any
      })

      await expect(projectFile.beforeRemove()).rejects.toThrow('Failed to delete file from S3')
    })
  })

  describe('Foreign Key Relationships', () => {
    it('should have projectId foreign key', () => {
      expect(projectFile.projectId).toBeDefined()
      expect(projectFile).toHaveProperty('project')
    })

    it('should reference Project entity', () => {
      expect(projectFile).toHaveProperty('project')
    })
  })

  describe('File Metadata', () => {
    it('should store file size', () => {
      projectFile.fileSize = 2048
      expect(projectFile.fileSize).toBe(2048)
    })

    it('should store mime type', () => {
      projectFile.mimeType = 'application/pdf'
      expect(projectFile.mimeType).toBe('application/pdf')
    })

    it('should allow null file size', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      projectFile.fileSize = null as any
      expect(projectFile.fileSize).toBeNull()
    })

    it('should allow null mime type', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      projectFile.mimeType = null as any
      expect(projectFile.mimeType).toBeNull()
    })
  })

  describe('Timestamp Fields', () => {
    it('should be able to set createdAt', () => {
      const date = new Date()
      projectFile.createdAt = date
      expect(projectFile.createdAt).toBe(date)
    })

    it('should be able to set updatedAt', () => {
      const date = new Date()
      projectFile.updatedAt = date
      expect(projectFile.updatedAt).toBe(date)
    })

    it('should be able to set deletedAt', () => {
      const date = new Date()
      projectFile.deletedAt = date
      expect(projectFile.deletedAt).toBe(date)
    })
  })
})
