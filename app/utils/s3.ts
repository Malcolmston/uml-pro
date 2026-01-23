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
 * Deletes a storage bucket with the specified name.
 *
 * @param {string} name - The name of the bucket to delete.
 * @return {Promise<{data: {message: string}, error: null} | {data: null, error: Error}>} Returns success message or error.
 * @throws {Error} Throws an error if the bucket name is not provided.
 */
async function deleteBucket(name: string) {
    if (!name) {
        throw new Error('Bucket name is required')
    }

    const { data, error } = await supabase.storage.deleteBucket(name)

    if (error) {
        return { data: null, error }
    }

    return { data, error: null }
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

/**
 * Deletes a file from the specified Supabase storage bucket.
 *
 * @param {string} bucket - The name of the bucket containing the file.
 * @param {string} filePath - The path of the file to delete.
 * @return {Promise<{data: {}, error: null} | {data: null, error: Error}>} Returns success data or error.
 */
async function deleteFile(bucket: string, filePath: string) {
    if (!bucket) {
        throw new Error('Bucket name is required')
    }

    if (!filePath) {
        throw new Error('File path is required')
    }

    const { data, error } = await supabase.storage
        .from(bucket)
        .remove([filePath])

    if (error) {
        return { data: null, error }
    }

    return { data, error: null }
}

/**
 * Renames a file in the specified Supabase storage bucket.
 *
 * @param {string} bucket - The name of the bucket containing the file.
 * @param {string} oldPath - The current path of the file.
 * @param {string} newPath - The new path for the file.
 * @return {Promise<{data: {}, error: null} | {data: null, error: Error}>} Returns success data or error.
 */
async function renameFile(bucket: string, oldPath: string, newPath: string) {
    if (!bucket) {
        throw new Error('Bucket name is required')
    }

    if (!oldPath) {
        throw new Error('Old file path is required')
    }

    if (!newPath) {
        throw new Error('New file path is required')
    }

    const { data, error } = await supabase.storage
        .from(bucket)
        .move(oldPath, newPath)

    if (error) {
        return { data: null, error }
    }

    return { data, error: null }
}

/**
 * Gets a file from the specified bucket by name/path.
 *
 * @param {string} bucket - The name of the bucket.
 * @param {string} filePath - The path of the file to retrieve.
 * @return {Promise<{data: Blob, error: null} | {data: null, error: Error}>} Returns file blob or error.
 */
async function getFile(bucket: string, filePath: string) {
    if (!bucket) {
        throw new Error('Bucket name is required')
    }

    if (!filePath) {
        throw new Error('File path is required')
    }

    const { data, error } = await supabase.storage
        .from(bucket)
        .download(filePath)

    if (error) {
        return { data: null, error }
    }

    return { data, error: null }
}

/**
 * Gets all files in the specified bucket.
 *
 * @param {string} bucket - The name of the bucket.
 * @param {string} [path] - Optional path within the bucket. Defaults to root.
 * @return {Promise<{data: Array, error: null} | {data: null, error: Error}>} Returns list of files or error.
 */
async function getAllFiles(bucket: string, path?: string) {
    if (!bucket) {
        throw new Error('Bucket name is required')
    }

    const { data, error } = await supabase.storage
        .from(bucket)
        .list(path || '', {
            limit: 1000,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' }
        })

    if (error) {
        return { data: null, error }
    }

    return { data, error: null }
}

/**
 * Moves a file from one location to another within the same bucket or across buckets.
 *
 * @param {string} sourceBucket - The name of the source bucket.
 * @param {string} sourcePath - The current path of the file.
 * @param {string} destinationBucket - The name of the destination bucket.
 * @param {string} destinationPath - The destination path for the file.
 * @return {Promise<{data: {}, error: null} | {data: null, error: Error}>} Returns success data or error.
 */
async function moveFile(sourceBucket: string, sourcePath: string, destinationBucket: string, destinationPath: string) {
    if (!sourceBucket) {
        throw new Error('Source bucket name is required')
    }

    if (!sourcePath) {
        throw new Error('Source file path is required')
    }

    if (!destinationBucket) {
        throw new Error('Destination bucket name is required')
    }

    if (!destinationPath) {
        throw new Error('Destination file path is required')
    }

    // If moving within the same bucket, use the move operation
    if (sourceBucket === destinationBucket) {
        return renameFile(sourceBucket, sourcePath, destinationPath)
    }

    // For cross-bucket moves, download and re-upload
    try {
        // Download the file from source bucket
        const { data: downloadData, error: downloadError } = await supabase.storage
            .from(sourceBucket)
            .download(sourcePath)

        if (downloadError) {
            return { data: null, error: downloadError }
        }

        // Upload to destination bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(destinationBucket)
            .upload(destinationPath, downloadData, {
                cacheControl: '3600',
                upsert: false
            })

        if (uploadError) {
            return { data: null, error: uploadError }
        }

        // Delete from source bucket
        const { error: deleteError } = await supabase.storage
            .from(sourceBucket)
            .remove([sourcePath])

        if (deleteError) {
            // File was copied but not deleted from source
            return {
                data: null,
                error: new Error(`File copied to destination but failed to delete from source: ${deleteError.message}`)
            }
        }

        return { data: uploadData, error: null }
    } catch (err) {
        return {
            data: null,
            error: err instanceof Error ? err : new Error('Unknown error occurred during file move')
        }
    }
}

export default supabase
