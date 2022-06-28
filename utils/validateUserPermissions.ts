type User = {
  permissions: string[];
  roles: string[];
};

type ValidateUserPermissionsParams = {
  user: User;
  permissions?: string[];
  roles?: string[];
};

export function validateUserPermissions({
  user,
  permissions,
  roles,
}: ValidateUserPermissionsParams) {
  if (permissions?.length > 0) {
    const hasAllPermissions = permissions.every((permission) => {
      // todos de permissions[] vão retornar true
      return user.permissions.includes(permission);
    });

    if (!hasAllPermissions) return false;
  }

  if (roles?.length > 0) {
    const hasAllRoles = roles.some((role) => {
      // qualaquer um que encontrar vai retornar true
      return user.roles.includes(role);
    });

    if (!hasAllRoles) return false;
  }

  return true;
}
