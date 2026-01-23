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

---

### team

```sql
CREATE TABLE team (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    role ENUM('admin', 'member', 'viewer') NOT NULL DEFAULT 'member',
    name VARCHAR(255) NOT NULL,
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    deletedAt DATETIME(6) NULL
);
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

## Notes

- All timestamp columns (`createdAt`, `updatedAt`, `deletedAt`) are managed automatically by TypeORM
- `deletedAt` is used for soft deletes - records are not physically deleted but marked as deleted
- The `uuid` field in `project` table is auto-generated using TypeORM's `@Generated("uuid")` decorator
