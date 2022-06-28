import { useContext } from "react";

import { AuthContext } from "../contexts/AuthContext";
import { validateUserPermissions } from "../utils/validateUserPermissions";

type UseCanParams = {
  permissions?: string[];
  roles?: string[];
};

export function useCan({ permissions, roles }: UseCanParams) {
  const { user, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) return false;
//   if (permissions?.length > 0) {
//     const hasAllPermissions = permissions.every((permission) => {  // todos de permissions[] vão retornar true
//       return user.permissions.includes(permission);
//     });

//     if (!hasAllPermissions) return false;
//   }

//   if (roles?.length > 0) {
//     const hasAllRoles = roles.some((role) => {  // qualaquer um que encontrar vai retornar true
//       return user.roles.includes(role);
//     });

//     if (!hasAllRoles) return false;
//   }

    const userHasValidPermissions = validateUserPermissions({
        user,
        permissions,
        roles
    })

  return userHasValidPermissions;
}
