import { z } from 'zod';

export const createParkingLotSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().min(2, 'Country is required'),
  zipCode: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  opensAt: z.string().optional(),
  closesAt: z.string().optional(),
  is24Hours: z.boolean().default(false),
  totalSpots: z.number().int().min(1),
  basePrice: z.number().int().min(0),
  hasSecurity: z.boolean().default(false),
  hasCCTV: z.boolean().default(false),
  hasCoveredParking: z.boolean().default(false),
  hasEvCharging: z.boolean().default(false),
  hasWifi: z.boolean().default(false),
});

export const updateParkingLotSchema = createParkingLotSchema.partial();

export const createParkingSpotSchema = z.object({
  parkingLotId: z.string().cuid(),
  spotNumber: z.string().min(1, 'Spot number is required'),
  floor: z.string().optional(),
  section: z.string().optional(),
  type: z.enum([
    'STANDARD',
    'COMPACT',
    'ELECTRIC',
    'HANDICAPPED',
    'MOTORCYCLE',
    'OVERSIZED',
  ]),
  pricePerHour: z.number().int().min(0).optional(),
  width: z.number().optional(),
  length: z.number().optional(),
  hasEvCharger: z.boolean().default(false),
  isCovered: z.boolean().default(false),
});

export type CreateParkingLotInput = z.infer<typeof createParkingLotSchema>;
export type UpdateParkingLotInput = z.infer<typeof updateParkingLotSchema>;
export type CreateParkingSpotInput = z.infer<typeof createParkingSpotSchema>;
