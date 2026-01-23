import adminRules from './chart/admin.json'
import memberRules from './chart/member.json'
import viewRules from './chart/view.json'

export type RoleType = 'admin' | 'member' | 'viewer'
export type ActionType = 'create' | 'read' | 'update' | 'write' | 'execute' | 'delete' | 'list' | 'rule'
export type ResourceType = 'bucket' | 'file' | 'folder'
export type RuleActionType = 'modify' | 'limit' | 'list'

interface Rules {
  [key: string]: {
    [key: string]: boolean | null
  }
}

const rulesMap: Record<RoleType, Rules> = {
  admin: adminRules as Rules,
  member: memberRules as Rules,
  viewer: viewRules as Rules
}

/**
 * Checks if a role has permission to perform an action on a resource.
 *
 * @param {RoleType} role - The role to check (admin, member, viewer)
 * @param {ActionType} action - The action to perform
 * @param {ResourceType} resource - The resource type
 * @return {boolean} Returns true if permitted, false otherwise. null permissions are treated as false.
 */
export function hasPermission(role: RoleType, action: ActionType, resource: ResourceType): boolean {
  const rules = rulesMap[role]

  if (!rules || !rules[action]) {
    return false
  }

  const permission = rules[action][resource]
  return permission === true
}

/**
 * Gets all permissions for a given role.
 *
 * @param {RoleType} role - The role to get permissions for
 * @return {Rules} Returns the rules object for the role
 */
export function getRolePermissions(role: RoleType): Rules {
  return rulesMap[role] || {}
}

/**
 * Checks if a role can create a resource. null = allow without modification.
 */
export function canCreate(role: RoleType, resource: ResourceType): boolean | null {
  const rules = rulesMap[role]
  if (!rules || !rules.create) return false
  const permission = rules.create[resource]
  return permission === undefined ? false : permission
}

/**
 * Checks if a role can read a resource. null = allow without modification.
 */
export function canRead(role: RoleType, resource: ResourceType): boolean | null {
  const rules = rulesMap[role]
  if (!rules || !rules.read) return false
  const permission = rules.read[resource]
  return permission === undefined ? false : permission
}

/**
 * Checks if a role can update a resource. null = allow without modification.
 */
export function canUpdate(role: RoleType, resource: ResourceType): boolean | null {
  const rules = rulesMap[role]
  if (!rules || !rules.update) return false
  const permission = rules.update[resource]
  return permission === undefined ? false : permission
}

/**
 * Checks if a role can write to a resource. null = allow without modification.
 */
export function canWrite(role: RoleType, resource: ResourceType): boolean | null {
  const rules = rulesMap[role]
  if (!rules || !rules.write) return false
  const permission = rules.write[resource]
  return permission === undefined ? false : permission
}

/**
 * Checks if a role can execute on a resource. null = allow without modification.
 */
export function canExecute(role: RoleType, resource: ResourceType): boolean | null {
  const rules = rulesMap[role]
  if (!rules || !rules.execute) return false
  const permission = rules.execute[resource]
  return permission === undefined ? false : permission
}

/**
 * Checks if a role can delete a resource. null = allow without modification.
 */
export function canDelete(role: RoleType, resource: ResourceType): boolean | null {
  const rules = rulesMap[role]
  if (!rules || !rules.delete) return false
  const permission = rules.delete[resource]
  return permission === undefined ? false : permission
}

/**
 * Checks if a role can list a resource. null = allow without modification.
 */
export function canList(role: RoleType, resource: ResourceType): boolean | null {
  const rules = rulesMap[role]
  if (!rules || !rules.list) return false
  const permission = rules.list[resource]
  return permission === undefined ? false : permission
}

/**
 * Checks if a role can perform a rule action (modify, limit, list rules).
 */
export function canModifyRule(role: RoleType): boolean | null {
  const rules = rulesMap[role]
  if (!rules || !rules.rule) return false
  return rules.rule['modify'] ?? false
}

/**
 * Checks if a role can set limits on rules.
 */
export function canLimitRule(role: RoleType): boolean | null {
  const rules = rulesMap[role]
  if (!rules || !rules.rule) return false
  return rules.rule['limit'] ?? false
}

/**
 * Checks if a role can list rules.
 */
export function canListRule(role: RoleType): boolean | null {
  const rules = rulesMap[role]
  if (!rules || !rules.rule) return false
  return rules.rule['list'] ?? false
}

export { rulesMap }
