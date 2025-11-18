import { UserRole } from '@prisma/client';

export const PERMISSIONS = {
  // Tenant Management
  MANAGE_TENANTS: ['SUPER_ADMIN'],
  VIEW_TENANTS: ['SUPER_ADMIN'],

  // Parking Lot Management
  CREATE_PARKING_LOT: ['SUPER_ADMIN', 'TENANT_ADMIN'],
  UPDATE_PARKING_LOT: ['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER'],
  DELETE_PARKING_LOT: ['SUPER_ADMIN', 'TENANT_ADMIN'],
  VIEW_PARKING_LOTS: ['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'STAFF'],

  // Parking Spot Management
  CREATE_PARKING_SPOT: ['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER'],
  UPDATE_PARKING_SPOT: ['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'STAFF'],
  DELETE_PARKING_SPOT: ['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER'],

  // Booking Management
  CREATE_BOOKING: [
    'SUPER_ADMIN',
    'TENANT_ADMIN',
    'MANAGER',
    'STAFF',
    'USER',
  ],
  UPDATE_BOOKING: ['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'STAFF'],
  DELETE_BOOKING: ['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER'],
  VIEW_ALL_BOOKINGS: ['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'STAFF'],
  VIEW_OWN_BOOKINGS: [
    'SUPER_ADMIN',
    'TENANT_ADMIN',
    'MANAGER',
    'STAFF',
    'USER',
  ],

  // User Management
  MANAGE_USERS: ['SUPER_ADMIN', 'TENANT_ADMIN'],
  VIEW_USERS: ['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER'],

  // Payment Management
  VIEW_PAYMENTS: ['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER'],
  PROCESS_REFUNDS: ['SUPER_ADMIN', 'TENANT_ADMIN'],

  // Analytics
  VIEW_ANALYTICS: ['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER'],
  VIEW_REPORTS: ['SUPER_ADMIN', 'TENANT_ADMIN'],
};

export function hasPermission(
  userRole: UserRole,
  permission: keyof typeof PERMISSIONS
): boolean {
  return PERMISSIONS[permission]?.includes(userRole) ?? false;
}

export function requirePermission(
  userRole: UserRole,
  permission: keyof typeof PERMISSIONS
) {
  if (!hasPermission(userRole, permission)) {
    throw new Error('Insufficient permissions');
  }
}
