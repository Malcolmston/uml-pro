import { createClient } from '@supabase/supabase-js'
import {
    S3Client,
    CreateBucketCommand,
    HeadBucketCommand,
    DeleteBucketCommand,
    HeadObjectCommand,
    PutObjectCommand,
    DeleteObjectCommand,
    CopyObjectCommand,
    GetObjectCommand,
    ListObjectsV2Command
} from '@aws-sdk/client-s3'
import { canCreate, canRead, canDelete, canUpdate, canList } from './rules'

type RoleType = 'admin' | 'member' | 'viewer'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : null

const s3Endpoint = process.env.S3_ENDPOINT
const s3AccessKeyId = process.env.AWS_ACCESS_KEY_ID
const s3SecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
const s3Region = process.env.AWS_REGION || 'us-east-1'

const useS3 = !!(s3Endpoint && s3AccessKeyId && s3SecretAccessKey)
const s3Client = useS3
    ? new S3Client({
        region: s3Region,
        endpoint: s3Endpoint,
        credentials: {
            accessKeyId: s3AccessKeyId,
            secretAccessKey: s3SecretAccessKey
        },
        forcePathStyle: true
    })
    : null

const getSupabase = () => {
    if (!supabase) {
        throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
    }
    return supabase
}

const isNotFoundError = (error: unknown) => {
    if (!error || typeof error !== 'object') {
        return false
    }
    const err = error as { name?: string; $metadata?: { httpStatusCode?: number } }
    return err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404
}


/**
 * Creates a new storage bucket with the specified name.
 *
 * @param {string} name - The name of the bucket to be created. It must be a non-empty string.
 * @return {Promise<{data: {name: string}, error: null} | {data: null, error: Error}>} Returns the created bucket or error.
 * @throws {Error} Throws an error if the bucket name is not provided.
 */
async function createBucket(name: string) {
    if (!name) {
        throw new Error('Bucket name is required')
    }

    if (useS3 && s3Client) {
        try {
            await s3Client.send(new CreateBucketCommand({ Bucket: name }))
            return { data: { name }, error: null }
        } catch (error) {
            return { data: null, error: error as Error }
        }
    }

    const { data, error } = await getSupabase().storage.createBucket(name)
    return error ? { data: null, error } : { data, error: null }
}

/**
 * Checks if a bucket with the specified name exists.
 *
 * @param {string} name - The name of the bucket to check.
 * @return {Promise<boolean>} Returns true if the bucket exists, false otherwise.
 */
async function bucketExsists(name: string): Promise<boolean> {
    if (useS3 && s3Client) {
        try {
            await s3Client.send(new HeadBucketCommand({ Bucket: name }))
            return true
        } catch (error) {
            return !isNotFoundError(error)
        }
    }

    const { data } = await getSupabase().storage.getBucket(name)
    return data !== null
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

    if (useS3 && s3Client) {
        try {
            await s3Client.send(new DeleteBucketCommand({ Bucket: name }))
            return { data: { message: 'Deleted' }, error: null }
        } catch (error) {
            return { data: null, error: error as Error }
        }
    }

    const { data, error } = await getSupabase().storage.deleteBucket(name)
    return error ? { data: null, error } : { data, error: null }
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

    if (useS3 && s3Client) {
        try {
            await s3Client.send(new HeadObjectCommand({ Bucket: bucket, Key: fileName }))
            return true
        } catch (error) {
            return !isNotFoundError(error)
        }
    }

    const { data, error } = await getSupabase().storage
        .from(bucket)
        .list(fileName.split('/').slice(0, -1).join('/') || '', {
            search: fileName.split('/').pop()
        })

    return !error && data.length > 0
}

/**
 * Uploads a file to the specified Supabase storage bucket.
 *
 * @param {string} bucket - The name of the bucket to upload the file to.
 * @param {File} file - The file to be uploaded.
 * @param {string} [path] - Optional path within the bucket. If not provided, uses the file name.
 * @return {Promise<{data: {path: string}, error: null} | {data: null, error: Error}>} Returns the upload result with path or error.
 */
async function uploadFile(bucket: string, file: File | Blob, path?: string) {
    if (!bucket) {
        throw new Error('Bucket name is required')
    }

    if (!file) {
        throw new Error('File is required')
    }

    const fileName = 'name' in file ? file.name : ''
    const filePath = path || fileName
    if (!filePath) {
        throw new Error('File name is required')
    }

    // Check if file already exists
    const exists = await fileExists(bucket, filePath)
    if (exists) {
        return {
            data: null,
            error: new Error(`File '${filePath}' already exists in bucket '${bucket}'`)
        }
    }

    if (useS3 && s3Client) {
        try {
            const body = new Uint8Array(await file.arrayBuffer())
            await s3Client.send(new PutObjectCommand({ Bucket: bucket, Key: filePath, Body: body }))
            return { data: { path: filePath }, error: null }
        } catch (error) {
            return { data: null, error: error as Error }
        }
    }

    const { data, error } = await getSupabase().storage
        .from(bucket)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        })

    return error ? { data: null, error } : { data, error: null }
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

    if (useS3 && s3Client) {
        try {
            await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: filePath }))
            return { data: {}, error: null }
        } catch (error) {
            return { data: null, error: error as Error }
        }
    }

    const { data, error } = await getSupabase().storage
        .from(bucket)
        .remove([filePath])

    return error ? { data: null, error } : { data, error: null }
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

    if (useS3 && s3Client) {
        const copySource = `${bucket}/${encodeURIComponent(oldPath)}`
        try {
            await s3Client.send(new CopyObjectCommand({
                Bucket: bucket,
                CopySource: copySource,
                Key: newPath
            }))
            await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: oldPath }))
            return { data: {}, error: null }
        } catch (error) {
            return { data: null, error: error as Error }
        }
    }

    const { data, error } = await getSupabase().storage
        .from(bucket)
        .move(oldPath, newPath)

    return error ? { data: null, error } : { data, error: null }
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

    if (useS3 && s3Client) {
        try {
            const { Body } = await s3Client.send(new GetObjectCommand({ Bucket: bucket, Key: filePath }))
            return { data: Body as Blob, error: null }
        } catch (error) {
            return { data: null, error: error as Error }
        }
    }

    const { data, error } = await getSupabase().storage
        .from(bucket)
        .download(filePath)

    return error ? { data: null, error } : { data, error: null }
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

    if (useS3 && s3Client) {
        try {
            const { Contents } = await s3Client.send(new ListObjectsV2Command({
                Bucket: bucket,
                Prefix: path || ''
            }))
            const data = (Contents || []).map(item => ({ name: item.Key ?? '' }))
            return { data, error: null }
        } catch (error) {
            return { data: null, error: error as Error }
        }
    }

    const { data, error } = await getSupabase().storage
        .from(bucket)
        .list(path || '', {
            limit: 1000,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' }
        })

    return error ? { data: null, error } : { data, error: null }
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
        if (useS3 && s3Client) {
            const copySource = `${sourceBucket}/${encodeURIComponent(sourcePath)}`
            await s3Client.send(new CopyObjectCommand({
                Bucket: destinationBucket,
                CopySource: copySource,
                Key: destinationPath
            }))
            await s3Client.send(new DeleteObjectCommand({ Bucket: sourceBucket, Key: sourcePath }))
            return { data: { path: destinationPath }, error: null }
        }

        const { data: downloadData, error: downloadError } = await getSupabase().storage
            .from(sourceBucket)
            .download(sourcePath)

        if (downloadError) {
            return { data: null, error: downloadError }
        }

        const { data: uploadData, error: uploadError } = await getSupabase().storage
            .from(destinationBucket)
            .upload(destinationPath, downloadData, {
                cacheControl: '3600',
                upsert: false
            })

        if (uploadError) {
            return { data: null, error: uploadError }
        }

        const { error: deleteError } = await getSupabase().storage
            .from(sourceBucket)
            .remove([sourcePath])

        if (deleteError) {
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

// Permission check helpers
export const canCreateBucket = (role: RoleType) => canCreate(role, 'bucket')
export const canDeleteBucket = (role: RoleType) => canDelete(role, 'bucket')
export const canListBucket = (role: RoleType) => canList(role, 'bucket')
export const canUpdateBucket = (role: RoleType) => canUpdate(role, 'bucket')

export const canCreateFile = (role: RoleType) => canCreate(role, 'file')
export const canReadFile = (role: RoleType) => canRead(role, 'file')
export const canUpdateFile = (role: RoleType) => canUpdate(role, 'file')
export const canDeleteFile = (role: RoleType) => canDelete(role, 'file')
export const canListFile = (role: RoleType) => canList(role, 'file')

export const canCreateFolder = (role: RoleType) => canCreate(role, 'folder')
export const canListFolder = (role: RoleType) => canList(role, 'folder')

/**
 * Creates a bucket with role-based access rules.
 *
 * @param {string} name - The name of the bucket
 * @param {RoleType} role - The role to set permissions for
 * @param {boolean} isPublic - Whether the bucket should be public
 * @return {Promise<{data: any, error: null} | {data: null, error: Error}>}
 */
async function createBucketWithRules(name: string, role: RoleType, isPublic: boolean = false) {
    if (!name) {
        throw new Error('Bucket name is required')
    }

    if (!canCreateBucket(role)) {
        return {
            data: null,
            error: new Error(`Role '${role}' does not have permission to create buckets`)
        }
    }

    if (await bucketExsists(name)) {
        return {
            data: null,
            error: new Error(`Bucket '${name}' already exists`)
        }
    }

    if (useS3 && s3Client) {
        return createBucket(name)
    }

    const { data, error } = await getSupabase().storage.createBucket(name, {
        public: isPublic,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: null
    })

    if (error) {
        return { data: null, error }
    }

    return { data, error: null }
}

/**
 * Renames a storage bucket by creating a new bucket, copying all files, and deleting the old bucket.
 * Note: Supabase doesn't support direct bucket renaming.
 *
 * @param {string} oldName - The current name of the bucket.
 * @param {string} newName - The new name for the bucket.
 * @return {Promise<{data: {message: string}, error: null} | {data: null, error: Error}>} Returns success message or error.
 */
async function renameBucket(oldName: string, newName: string) {
    if (!oldName || !newName) {
        throw new Error('Both old and new bucket names are required')
    }

    if (oldName === newName) {
        return { data: { message: 'Bucket names are the same' }, error: null }
    }

    // Create new bucket
    const createResult = await createBucket(newName)
    if (createResult.error) {
        return { data: null, error: createResult.error }
    }

    // Get all files from old bucket
    const { data: files, error: listError } = await getAllFiles(oldName)
    if (listError) {
        // Clean up new bucket if list fails
        await deleteBucket(newName)
        return { data: null, error: listError }
    }

    // Copy each file to new bucket
    if (files && files.length > 0) {
        for (const file of files) {
            const moveResult = await moveFile(oldName, file.name, newName, file.name)
            if (moveResult.error) {
                // Clean up new bucket if move fails
                await deleteBucket(newName)
                return { data: null, error: moveResult.error }
            }
        }
    }

    // Delete old bucket
    const deleteResult = await deleteBucket(oldName)
    if (deleteResult.error) {
        return { data: null, error: deleteResult.error }
    }

    return { data: { message: `Bucket renamed from '${oldName}' to '${newName}'` }, error: null }
}

export default supabase
export {
    createBucket,
    bucketExsists,
    deleteBucket,
    renameBucket,
    fileExists,
    uploadFile,
    deleteFile,
    renameFile,
    moveFile,
    getFile,
    getAllFiles,
    createBucketWithRules
}
