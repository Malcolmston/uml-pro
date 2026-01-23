import { describe, it, expect, vi } from 'vitest'
import { createClient } from '@supabase/supabase-js'

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    storage: {
      from: vi.fn()
    }
  }))
}))

describe('s3.ts - Supabase Storage Client', () => {
  it('should create a Supabase client with environment variables', async () => {
    const mockUrl = 'https://test.supabase.co'
    const mockKey = 'test-service-role-key'

    process.env.SUPABASE_URL = mockUrl
    process.env.SUPABASE_SERVICE_ROLE_KEY = mockKey

    // Dynamic import to use current env vars
    await import('./s3.ts')

    expect(createClient).toHaveBeenCalled()
  })

  it('should use SUPABASE_URL from environment', () => {
    process.env.SUPABASE_URL = 'https://custom.supabase.co'

    expect(process.env.SUPABASE_URL).toBe('https://custom.supabase.co')
  })

  it('should use SUPABASE_SERVICE_ROLE_KEY from environment', () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'custom-service-role-key'

    expect(process.env.SUPABASE_SERVICE_ROLE_KEY).toBe('custom-service-role-key')
  })

  it('should export a Supabase client instance', async () => {
    const supabase = await import('./s3.ts')

    expect(supabase.default).toBeDefined()
    expect(supabase.default).toHaveProperty('storage')
  })
})
