import { z } from 'zod';

export const createMembershipSchema = z.object({
  userId: z.string().cuid(),
  parkingLotId: z.string().cuid(),
  type: z.enum(['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  price: z.number().int().min(0),
  unlimitedAccess: z.boolean().default(true),
  maxHoursPerDay: z.number().int().min(1).optional(),
  maxEntriesPerDay: z.number().int().min(1).optional(),
  allowedVehicles: z.array(z.string()).optional(),
  autoRenew: z.boolean().default(false),
});

export const createPriceConfigSchema = z.object({
  parkingLotId: z.string().cuid(),
  name: z.string().min(3),
  priceType: z.enum(['PER_MINUTE', 'PER_HOUR', 'PER_DAY', 'FLAT_RATE']),
  pricePerMinute: z.number().int().min(0).optional(),
  pricePerHour: z.number().int().min(0).optional(),
  pricePerDay: z.number().int().min(0).optional(),
  flatRate: z.number().int().min(0).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  priority: z.number().int().default(0),
});

export const startParkingSessionSchema = z.object({
  vehicleId: z.string().cuid(),
  licensePlate: z.string().min(1),
  parkingLotId: z.string().cuid(),
  parkingSpotId: z.string().cuid().optional(),
  membershipId: z.string().cuid().optional(),
  entryNotes: z.string().optional(),
});

export const endParkingSessionSchema = z.object({
  sessionId: z.string().cuid(),
  exitTime: z.string().datetime().optional(),
  paymentMethod: z
    .enum([
      'CREDIT_CARD',
      'DEBIT_CARD',
      'CASH',
      'BANK_TRANSFER',
      'PAYPAL',
      'STRIPE',
    ])
    .optional(),
  exitNotes: z.string().optional(),
});

export const createInvoiceSchema = z.object({
  userId: z.string().cuid(),
  parkingLotId: z.string().cuid(),
  parkingSessionId: z.string().cuid().optional(),
  dueDate: z.string().datetime(),
  lineItems: z.array(
    z.object({
      description: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
      total: z.number(),
    })
  ),
  subtotal: z.number().int().min(0),
  tax: z.number().int().min(0).default(0),
  discount: z.number().int().min(0).default(0),
  notes: z.string().optional(),
});

export type CreateMembershipInput = z.infer<typeof createMembershipSchema>;
export type CreatePriceConfigInput = z.infer<typeof createPriceConfigSchema>;
export type StartParkingSessionInput = z.infer<
  typeof startParkingSessionSchema
>;
export type EndParkingSessionInput = z.infer<typeof endParkingSessionSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
