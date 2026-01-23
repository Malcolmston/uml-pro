import '@testing-library/jest-dom'
import { vi } from 'vitest'
import 'reflect-metadata'

// Mock TypeORM decorators
vi.mock('typeorm', async () => {
  const actual = await vi.importActual('typeorm')
  return {
    ...actual,
    Entity: () => () => {},
    PrimaryGeneratedColumn: () => () => {},
    Column: () => () => {},
    CreateDateColumn: () => () => {},
    UpdateDateColumn: () => () => {},
    DeleteDateColumn: () => () => {},
    Generated: () => () => {},
    ManyToOne: () => () => {},
    OneToOne: () => () => {},
    OneToMany: () => () => {},
    ManyToMany: () => () => {},
    JoinColumn: () => () => {},
    JoinTable: () => () => {},
    BeforeInsert: () => () => {},
    BeforeUpdate: () => () => {},
    BeforeRemove: () => () => {},
    AfterLoad: () => () => {},
    AfterInsert: () => () => {},
    AfterUpdate: () => () => {},
    AfterRemove: () => () => {},
  }
})

// Mock the database connection
vi.mock('./app/db/index', () => ({
  default: {
    initialize: vi.fn().mockResolvedValue(undefined),
    isInitialized: false,
    getRepository: vi.fn(),
  }
}))

// Mock S3 utilities
vi.mock('./app/utils/s3', () => ({
  bucketExsists: vi.fn().mockReturnValue(false),
  createBucket: vi.fn().mockResolvedValue({ data: {}, error: null }),
  deleteBucket: vi.fn().mockResolvedValue({ data: {}, error: null }),
  renameBucket: vi.fn().mockResolvedValue({ data: {}, error: null }),
  uploadFile: vi.fn().mockResolvedValue({ data: {}, error: null }),
  deleteFile: vi.fn().mockResolvedValue({ data: {}, error: null }),
  renameFile: vi.fn().mockResolvedValue({ data: {}, error: null }),
  moveFile: vi.fn().mockResolvedValue({ data: {}, error: null }),
  getFile: vi.fn().mockResolvedValue({ data: null, error: null }),
  getAllFiles: vi.fn().mockResolvedValue({ data: [], error: null }),
}))

// Mock bcrypt
vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn().mockResolvedValue(true),
  },
  hash: vi.fn().mockResolvedValue('hashed_password'),
  compare: vi.fn().mockResolvedValue(true),
}))
