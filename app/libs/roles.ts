export const SUPER_ADMIN_ROLES = ["superadmin", "super-admin"];
export const ADMIN_ROLES = ["admin", "owner", ...SUPER_ADMIN_ROLES];

export function normalizeRole(role?: string | null) {
  return String(role || "")
    .trim()
    .toLowerCase();
}

export function isSuperAdminRole(role?: string | null) {
  return SUPER_ADMIN_ROLES.includes(normalizeRole(role));
}

export function isAdminRole(role?: string | null) {
  return ADMIN_ROLES.includes(normalizeRole(role));
}

export function canManageFinalRepairs(role?: string | null) {
  return isAdminRole(role);
}

export function canViewAuditLogs(role?: string | null) {
  return isSuperAdminRole(role);
}

export function canRunBackups(role?: string | null) {
  return isSuperAdminRole(role);
}