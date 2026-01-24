import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockUpload = vi.fn()
const mockDownload = vi.fn()
const mockRemove = vi.fn()
const mockMove = vi.fn()
const mockList = vi.fn()

const mockStorage = {
  createBucket: vi.fn(),
  getBucket: vi.fn(),
  deleteBucket: vi.fn(),
  updateBucket: vi.fn(),
  from: vi.fn(() => ({
    upload: mockUpload,
    download: mockDownload,
    remove: mockRemove,
    move: mockMove,
    list: mockList
  }))
}

describe('s3.ts - Supabase Storage Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    vi.unmock('./s3')
    delete process.env.S3_ENDPOINT
    delete process.env.AWS_ACCESS_KEY_ID
    delete process.env.AWS_SECRET_ACCESS_KEY
    delete process.env.AWS_REGION
    delete process.env.USE_S3
    process.env.SUPABASE_URL = 'http://localhost'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
    vi.doMock('@supabase/supabase-js', () => ({
      createClient: vi.fn(() => ({
        storage: mockStorage
      }))
    }))
  })

  describe('Bucket Operations', () => {
    it('should create a bucket when it does not exist', async () => {
      mockStorage.createBucket.mockResolvedValue({ data: { name: 'test-bucket' }, error: null })

      const { createBucket } = await import('./s3')
      const result = await createBucket('test-bucket')

      expect(mockStorage.createBucket).toHaveBeenCalledWith('test-bucket')
      expect(result.error).toBeNull()
    })

    it('should delete a bucket', async () => {
      mockStorage.deleteBucket.mockResolvedValue({ data: { message: 'deleted' }, error: null })

      const { deleteBucket } = await import('./s3')
      const result = await deleteBucket('test-bucket')

      expect(mockStorage.deleteBucket).toHaveBeenCalledWith('test-bucket')
      expect(result.error).toBeNull()
    })

    it('should check if bucket exists', async () => {
      mockStorage.getBucket.mockResolvedValue({ data: { name: 'test-bucket' }, error: null })

      const { bucketExsists } = await import('./s3')
      const result = await bucketExsists('test-bucket')

      expect(mockStorage.getBucket).toHaveBeenCalledWith('test-bucket')
      expect(result).toBe(true)
    })
  })

  describe('File Operations', () => {
    it('should upload a file', async () => {
      mockList.mockResolvedValue({ data: [], error: null })
      mockUpload.mockResolvedValue({ data: { path: 'test.txt' }, error: null })

      const { uploadFile } = await import('./s3')
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' })
      const result = await uploadFile('bucket', mockFile)

      expect(mockUpload).toHaveBeenCalled()
      expect(result.error).toBeNull()
    })

    it('should download a file', async () => {
      const mockBlob = new Blob(['content'])
      mockDownload.mockResolvedValue({ data: mockBlob, error: null })

      const { getFile } = await import('./s3')
      const result = await getFile('bucket', 'test.txt')

      expect(mockDownload).toHaveBeenCalledWith('test.txt')
      expect(result.data).toBe(mockBlob)
      expect(result.error).toBeNull()
    })

    it('should delete a file', async () => {
      mockRemove.mockResolvedValue({ data: {}, error: null })

      const { deleteFile } = await import('./s3')
      const result = await deleteFile('bucket', 'test.txt')

      expect(mockRemove).toHaveBeenCalledWith(['test.txt'])
      expect(result.error).toBeNull()
    })

    it('should rename a file', async () => {
      mockMove.mockResolvedValue({ data: {}, error: null })

      const { renameFile } = await import('./s3')
      const result = await renameFile('bucket', 'old.txt', 'new.txt')

      expect(mockMove).toHaveBeenCalledWith('old.txt', 'new.txt')
      expect(result.error).toBeNull()
    })

    it('should list all files in a bucket', async () => {
      const mockFiles = [{ name: 'file1.txt' }, { name: 'file2.txt' }]
      mockList.mockResolvedValue({ data: mockFiles, error: null })

      const { getAllFiles } = await import('./s3')
      const result = await getAllFiles('bucket')

      expect(mockList).toHaveBeenCalled()
      expect(result.data).toEqual(mockFiles)
      expect(result.error).toBeNull()
    })

    it('should check if file exists', async () => {
      mockList.mockResolvedValue({ data: [{ name: 'test.txt' }], error: null })

      const { fileExists } = await import('./s3')
      const result = await fileExists('bucket', 'test.txt')

      expect(result).toBe(true)
    })
  })
})
