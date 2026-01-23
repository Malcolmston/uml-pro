import adminRules from './chart/admin.json'
import memberRules from './chart/member.json'
import viewRules from './chart/view.json'

type RoleType = 'admin' | 'member' | 'viewer'
type ActionType = 'create' | 'read' | 'update' | 'write' | 'execute' | 'delete' | 'list'
type ResourceType = 'bucket' | 'file' | 'folder'

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

export { rulesMap }
