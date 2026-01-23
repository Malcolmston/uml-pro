import '@testing-library/jest-dom'
import { vi } from 'vitest'
import 'reflect-metadata'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

// Mock S3 utilities
vi.mock('./app/utils/s3', () => ({
  bucketExsists: vi.fn().mockResolvedValue(false),
  createBucket: vi.fn().mockResolvedValue({ data: { name: 'test' }, error: null }),
  deleteBucket: vi.fn().mockResolvedValue({ data: { message: 'Deleted' }, error: null }),
  renameBucket: vi.fn().mockResolvedValue({ data: { message: 'Renamed' }, error: null }),
  uploadFile: vi.fn().mockResolvedValue({ data: {}, error: null }),
  deleteFile: vi.fn().mockResolvedValue({ data: [], error: null }),
  renameFile: vi.fn().mockResolvedValue({ data: { message: 'Renamed' }, error: null }),
  moveFile: vi.fn().mockResolvedValue({ data: {}, error: null }),
  getFile: vi.fn().mockResolvedValue({ data: null, error: null }),
  getAllFiles: vi.fn().mockResolvedValue({ data: [], error: null }),
  fileExists: vi.fn().mockResolvedValue(false),
}))

// Don't mock bcrypt - use real implementation for tests
