import type { Role } from "./types";

export type Permission =
  | "users.manage"
  | "shipments.view"
  | "shipments.create"
  | "shipments.update_info"
  | "tracking.update"
  | "fleet.view"
  | "fleet.manage"
  | "locations.view"
  | "locations.manage"
  | "feedback.view"
  | "notifications.view"
  | "audit.view"
  | "settings.view"
  | "settings.manage"
  | "files.upload";

const ALL: Permission[] = [
  "users.manage",
  "shipments.view",
  "shipments.create",
  "shipments.update_info",
  "tracking.update",
  "fleet.view",
  "fleet.manage",
  "locations.view",
  "locations.manage",
  "feedback.view",
  "notifications.view",
  "audit.view",
  "settings.view",
  "settings.manage",
  "files.upload",
];

const ROLE_PERMISSIONS: Record<Role, Set<Permission>> = {
  Superadmin: new Set(ALL),
  Admin: new Set([
    "users.manage",
    "shipments.view",
    "shipments.create",
    "shipments.update_info",
    "tracking.update",
    "fleet.view",
    "fleet.manage",
    "locations.view",
    "locations.manage",
    "feedback.view",
    "notifications.view",
    "audit.view",
    "settings.view",
    "settings.manage",
    "files.upload",
  ]),
  Driver: new Set([
    "shipments.view",
    "tracking.update",
    "fleet.view",
    "locations.view",
    "feedback.view",
    "notifications.view",
    "files.upload",
  ]),
  Viewer: new Set([
    "shipments.view",
    "fleet.view",
    "locations.view",
    "feedback.view",
    "notifications.view",
    "settings.view",
  ]),
  // Customer-side portal account: same base as Viewer, plus creating
  // shipments - visibility is further narrowed to just its own
  // customer_id inside routes/shipments.ts (rbac alone can't express that
  // row-level scoping).
  "Cust-Admin": new Set([
    "shipments.view",
    "shipments.create",
    "fleet.view",
    "locations.view",
    "feedback.view",
    "notifications.view",
    "settings.view",
  ]),
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.has(permission) ?? false;
}
