# Database Schema

## Tables

### user

```sql
CREATE TABLE user (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deletedAt DATETIME(6) NULL
);

CREATE UNIQUE INDEX IDX_user_email ON user(email);
CREATE UNIQUE INDEX IDX_user_username ON user(username);
```

**Constraints:**
- Age must be at least 12 (enforced at application level via `@BeforeInsert` and `@BeforeUpdate` hooks)
- Password is automatically hashed using bcrypt with salt rounds of 10

**Hooks:**
- `@BeforeInsert`: Validates age ≥ 12, hashes password
- `@BeforeUpdate`: Validates age ≥ 12, hashes password if changed

---

### project

```sql
CREATE TABLE project (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) NOT NULL,
    visibility ENUM('public', 'private', 'internal') NOT NULL DEFAULT 'public',
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deletedAt DATETIME(6) NULL
);
```

**Enums:**
- `visibility`: `'public'`, `'private'`, `'internal'`

**Hooks:**
- `@BeforeInsert`: Creates S3 buckets (`project/{name}-files`, `project/{name}-rules`, `project/{name}-backups`)
- `@BeforeUpdate`: Renames S3 buckets if project name changes
- `@BeforeRemove`: Deletes all associated S3 buckets

---

### project_file

```sql
CREATE TABLE project_file (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    projectId INTEGER NOT NULL,
    fileName VARCHAR(255) NOT NULL,
    s3Key VARCHAR(255) NOT NULL,
    s3Bucket VARCHAR(255) NOT NULL,
    fileSize INTEGER NULL,
    mimeType VARCHAR(255) NULL,
    s3Url TEXT NULL,
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deletedAt DATETIME(6) NULL,
    FOREIGN KEY (projectId) REFERENCES project(id)
);

CREATE INDEX IDX_project_file_projectId ON project_file(projectId);
```

**Hooks:**
- `@AfterLoad`: Stores original fileName and s3Key for change detection
- `@BeforeInsert`: Validates required fields, auto-generates s3Key from fileName if not provided
- `@BeforeUpdate`: Renames file in S3 if fileName changes
- `@BeforeRemove`: Deletes file from S3 storage

---

### team

```sql
CREATE TABLE team (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    customRules JSON NULL,
    defaultRole ENUM('admin', 'member', 'viewer') NOT NULL DEFAULT 'member',
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deletedAt DATETIME(6) NULL
);
```

**Enums:**
- `defaultRole`: `'admin'`, `'member'`, `'viewer'`

**Fields:**
- `customRules`: JSON field storing team-specific permission overrides
- `defaultRole`: Default role assigned to new team members

**Methods:**
- `canPerform(role, action, resource)`: Check if role can perform action on resource (checks custom rules first, then defaults)
- `canModifyTeamRules(role)`: Check if role can modify team rules
- `canSetRuleLimits(role)`: Check if role can set rule limits
- `canListTeamRules(role)`: Check if role can list rules
- `setCustomRules(role, rules)`: Set custom rules for team (with permission check)
- `getEffectiveRules(role)`: Get merged default and custom rules for role

---

### team_member

```sql
CREATE TABLE team_member (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    userId INTEGER NOT NULL,
    teamId INTEGER NOT NULL,
    role ENUM('admin', 'member', 'viewer') NOT NULL DEFAULT 'member',
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deletedAt DATETIME(6) NULL,
    FOREIGN KEY (userId) REFERENCES user(id),
    FOREIGN KEY (teamId) REFERENCES team(id)
);

CREATE INDEX IDX_team_member_userId ON team_member(userId);
CREATE INDEX IDX_team_member_teamId ON team_member(teamId);
```

**Enums:**
- `role`: `'admin'`, `'member'`, `'viewer'`

---

## Enums

### Visibility
```typescript
enum Visibility {
    PUBLIC = 'public',
    PRIVATE = 'private',
    INTERNAL = 'internal'
}
```

### TeamRole
```typescript
enum TeamRole {
    ADMIN = 'admin',
    MEMBER = 'member',
    VIEWER = 'viewer'
}
```

---

## Permission System

### Role Permissions

Permissions are defined in JSON files (`admin.json`, `member.json`, `view.json`) with the following structure:

```json
{
  "create": { "bucket": true/false/null, "file": true/false/null, "folder": true/false/null },
  "read": { "bucket": true/false/null, "file": true/false/null },
  "update": { "bucket": true/false/null, "file": true/false/null },
  "write": { "bucket": true/false/null, "file": true/false/null },
  "execute": { "bucket": true/false/null, "file": true/false/null },
  "delete": { "bucket": true/false/null, "file": true/false/null },
  "list": { "bucket": true/false/null, "file": true/false/null, "folder": true/false/null },
  "rule": { "modify": true/false, "limit": true/false, "list": true/false }
}
```

**Permission values:**
- `true`: Allowed
- `false`: Denied
- `null`: Allow without modification (special case)

**Default Role Permissions:**

| Action | Admin | Member | Viewer |
|--------|-------|--------|--------|
| Create Bucket | ✓ | ✗ | ✗ |
| Create File | ✓ | ✓ | ✗ |
| Create Folder | ✓ | ✓ | ✗ |
| Read Bucket | ✓ | ✓ | ✓ |
| Read File | ✓ | ✓ | ✓ |
| Update Bucket | ✓ | ✗ | ✗ |
| Update File | ✓ | ✓ | ✗ |
| Delete Bucket | ✓ | ✗ | ✗ |
| Delete File | ✓ | null | ✗ |
| Execute File | ✓ | null | ✗ |
| List Bucket | ✓ | ✗ | ✓ |
| List File | ✓ | ✓ | ✓ |
| List Folder | ✓ | ✓ | ✓ |
| Modify Rules | ✓ | ✗ | ✗ |
| Limit Rules | ✓ | ✗ | ✗ |
| List Rules | ✓ | ✓ | ✓ |

---

## Storage Integration

The system integrates with Supabase Storage for file management:

### S3 Functions Available:
- `createBucket(name)`: Create storage bucket
- `deleteBucket(name)`: Delete storage bucket
- `renameBucket(oldName, newName)`: Rename bucket (note: not directly supported, creates new and migrates)
- `uploadFile(bucket, file, path)`: Upload file to bucket
- `deleteFile(bucket, filePath)`: Delete file from bucket
- `renameFile(bucket, oldPath, newPath)`: Rename/move file within bucket
- `moveFile(sourceBucket, sourcePath, destBucket, destPath)`: Move file between buckets
- `getFile(bucket, filePath)`: Download file from bucket
- `getAllFiles(bucket, path)`: List all files in bucket
- `fileExists(bucket, fileName)`: Check if file exists

### Permission Helpers:
- `canCreateBucket(role)`, `canDeleteBucket(role)`, `canListBucket(role)`, `canUpdateBucket(role)`
- `canCreateFile(role)`, `canReadFile(role)`, `canUpdateFile(role)`, `canDeleteFile(role)`, `canListFile(role)`
- `canCreateFolder(role)`, `canListFolder(role)`
- `createBucketWithRules(name, role, isPublic)`: Create bucket with role-based access control

---

## Notes

- All timestamp columns (`createdAt`, `updatedAt`, `deletedAt`) are managed automatically by TypeORM
- `deletedAt` is used for soft deletes - records are not physically deleted but marked as deleted
- The `uuid` field in `project` table is auto-generated using TypeORM's `@Generated("uuid")` decorator
- S3 bucket operations are automatically handled through entity lifecycle hooks
- Custom team rules override default role permissions
