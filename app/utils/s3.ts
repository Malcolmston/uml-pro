import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)


/**
 * Creates a new storage bucket with the specified name.
 *
 * @param {string} name - The name of the bucket to be created. It must be a non-empty string.
 * @return {boolean} Returns true if the bucket is successfully created, or false if a bucket with the specified name already exists.
 * @throws {Error} Throws an error if the bucket name is not provided.
 */
function createBucket(name: string): boolean {
    if (!name) {
        throw new Error('Bucket name is required')
    }

    if (bucketExsists(name)) {
        return false
    }

    return supabase.storage.createBucket(name)
}

/**
 * Checks if a bucket with the specified name exists.
 *
 * @param {string} name - The name of the bucket to check.
 * @return {boolean} Returns true if the bucket exists, false otherwise.
 */
function bucketExsists(name: string): boolean {
    return supabase.storage.getBucket(name) !== null
}

/**
 * Checks if a file exists in the specified bucket.
 *
 * @param {string} bucket - The name of the bucket to check.
 * @param {string} fileName - The name/path of the file to check.
 * @return {Promise<boolean>} Returns true if the file exists, false otherwise.
 */
async function fileExists(bucket: string, fileName: string): Promise<boolean> {
    if (!bucket) {
        throw new Error('Bucket name is required')
    }

    if (!fileName) {
        throw new Error('File name is required')
    }

    const { data, error } = await supabase.storage
        .from(bucket)
        .list(fileName.split('/').slice(0, -1).join('/') || '', {
            search: fileName.split('/').pop()
        })

    if (error) {
        return false
    }

    return data.length > 0
}

/**
 * Uploads a file to the specified Supabase storage bucket.
 *
 * @param {string} bucket - The name of the bucket to upload the file to.
 * @param {File} file - The file to be uploaded.
 * @param {string} [path] - Optional path within the bucket. If not provided, uses the file name.
 * @return {Promise<{data: {path: string}, error: null} | {data: null, error: Error}>} Returns the upload result with path or error.
 */
async function uploadFile(bucket: string, file: File, path?: string) {
    if (!bucket) {
        throw new Error('Bucket name is required')
    }

    if (!file) {
        throw new Error('File is required')
    }

    const filePath = path || file.name

    // Check if file already exists
    const exists = await fileExists(bucket, filePath)
    if (exists) {
        return {
            data: null,
            error: new Error(`File '${filePath}' already exists in bucket '${bucket}'`)
        }
    }

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        })

    if (error) {
        return { data: null, error }
    }

    return { data, error: null }
}

export default supabase
