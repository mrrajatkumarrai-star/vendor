export const APP_NAME = 'Vendor Management System';
export const APP_DESCRIPTION = 'Enterprise vendor management for freight forwarding operations';

export const FIRESTORE_COLLECTIONS = {
  VENDORS: 'vendors',
  USERS: 'users',
} as const;

export const PAGE_SIZE = 50;
export const SEARCH_DEBOUNCE_MS = 300;
export const BATCH_SIZE = 500; // Firestore batch write limit

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_IMPORT_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const VENDOR_IMPORT_COLUMNS = [
  'name',
  'designation',
  'company',
  'vendorType',
  'country',
  'state',
  'city',
  'location',
  'areaPerforming',
  'mobile',
  'whatsapp',
  'email',
  'website',
  'gst',
  'iec',
  'pan',
  'tags',
  'notes',
] as const;

export const EXPORT_COLUMNS = [
  { key: 'name', label: 'Vendor Name' },
  { key: 'designation', label: 'Designation' },
  { key: 'company', label: 'Company' },
  { key: 'vendorType', label: 'Vendor Type' },
  { key: 'country', label: 'Country' },
  { key: 'state', label: 'State' },
  { key: 'city', label: 'City' },
  { key: 'location', label: 'Location' },
  { key: 'areaPerforming', label: 'Area Performing' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'email', label: 'Email' },
  { key: 'website', label: 'Website' },
  { key: 'gst', label: 'GST' },
  { key: 'iec', label: 'IEC' },
  { key: 'pan', label: 'PAN' },
  { key: 'tags', label: 'Tags' },
  { key: 'notes', label: 'Notes' },
] as const;
