import { z } from 'zod';

export const createBookingSchema = z.object({
  parkingLotId: z.string().cuid(),
  parkingSpotId: z.string().cuid().optional(),
  vehicleId: z.string().cuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  notes: z.string().optional(),
});

export const updateBookingSchema = z.object({
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'ACTIVE',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW',
  ]),
  actualStartTime: z.string().datetime().optional(),
  actualEndTime: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
