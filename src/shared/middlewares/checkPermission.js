import createError from "../utils/createError.js";

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return createError(res, 401, "Unauthorized");
    }

    const hasPermission = req.user.roles.some((role) =>
      allowedRoles.includes(role)
    );

    if (!hasPermission) {
      return createError(res, 403, "Forbidden: Bạn không có quyền truy cập");
    }

    next();
  };
};
