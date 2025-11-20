export function isSuperAdmin(role?: string | null) {
  return role === 'SUPER_ADMIN'
}

export function isGaamAdmin(role?: string | null) {
  return role === 'GAAM_ADMIN'
}

export function isAdminRole(role?: string | null) {
  return isSuperAdmin(role) || isGaamAdmin(role)
}

