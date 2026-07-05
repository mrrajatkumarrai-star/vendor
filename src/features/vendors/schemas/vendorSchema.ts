import { z } from 'zod';
import type { VendorTypeValue } from '@/types/vendor';
import { VENDOR_TYPE_OPTIONS } from '@/types/vendor';

const phoneRegex = /^\+?[\d\s-]{7,15}$/;
const gstRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;
const panRegex = /^[A-Z]{5}\d{4}[A-Z]{1}$/;
const iecRegex = /^\d{10}$/;

export const vendorFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Vendor name is required')
    .max(200, 'Name must be 200 characters or fewer'),

  designation: z.string().max(100, 'Designation must be 100 characters or fewer').default(''),

  company: z.string().max(200, 'Company must be 200 characters or fewer').default(''),

  vendorType: z
    .array(z.enum(VENDOR_TYPE_OPTIONS as unknown as [VendorTypeValue, ...VendorTypeValue[]]))
    .min(1, 'At least one vendor type is required'),

  country: z.string().max(100).default(''),

  state: z.string().max(100).default(''),

  city: z.string().max(100).default(''),

  location: z.string().max(200).default(''),

  areaPerforming: z.string().max(200).default(''),

  mobile: z
    .string()
    .refine((val) => !val || phoneRegex.test(val), {
      message: 'Invalid phone number format',
    })
    .default(''),

  whatsapp: z
    .string()
    .refine((val) => !val || phoneRegex.test(val), {
      message: 'Invalid WhatsApp number format',
    })
    .default(''),

  email: z
    .string()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: 'Invalid email address',
    })
    .default(''),

  website: z
    .string()
    .refine(
      (val) => {
        if (!val) return true;
        try {
          new URL(val.startsWith('http') ? val : `https://${val}`);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'Invalid website URL' }
    )
    .default(''),

  gst: z
    .string()
    .refine((val) => !val || gstRegex.test(val.toUpperCase()), {
      message: 'Invalid GST number (e.g., 22AAAAA0000A1Z5)',
    })
    .default(''),

  iec: z
    .string()
    .refine((val) => !val || iecRegex.test(val), {
      message: 'IEC must be a 10-digit number',
    })
    .default(''),

  pan: z
    .string()
    .refine((val) => !val || panRegex.test(val.toUpperCase()), {
      message: 'Invalid PAN (e.g., ABCDE1234F)',
    })
    .default(''),

  tags: z.array(z.string()).default([]),

  notes: z.string().max(2000, 'Notes must be 2000 characters or fewer').default(''),

  attachments: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
        type: z.string(),
        size: z.number(),
        uploadedAt: z.string(),
      })
    )
    .default([]),

  isFavorite: z.boolean().default(false),
});

export type VendorFormSchema = z.infer<typeof vendorFormSchema>;

export const loginFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormSchema = z.infer<typeof loginFormSchema>;
