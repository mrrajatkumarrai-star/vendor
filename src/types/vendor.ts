import { Timestamp } from 'firebase/firestore';

export type VendorTypeValue =
  | 'Freight Forwarding'
  | 'MLO'
  | 'NVOCC'
  | 'Transportation'
  | 'CHA'
  | 'Overseas Agent';

export interface VendorAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  nameLower: string;
  designation: string;
  company: string;
  companyLower: string;
  vendorType: VendorTypeValue[];
  country: string;
  state: string;
  city: string;
  location: string;
  areaPerforming: string;
  mobile: string;
  whatsapp: string;
  whatsappUrl: string;
  email: string;
  website: string;
  gst: string;
  iec: string;
  pan: string;
  tags: string[];
  notes: string;
  attachments: VendorAttachment[];
  isFavorite: boolean;
  searchTerms: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  updatedBy: string;
}

export type VendorFormData = Omit<
  Vendor,
  'id' | 'nameLower' | 'companyLower' | 'whatsappUrl' | 'searchTerms' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'
>;

export interface VendorFilters {
  vendorType: VendorTypeValue[];
  country: string;
  state: string;
  city: string;
  location: string;
  areaPerforming: string;
  company: string;
  tags: string[];
  isFavorite: boolean | null;
  searchQuery: string;
}

export const DEFAULT_VENDOR_FILTERS: VendorFilters = {
  vendorType: [],
  country: '',
  state: '',
  city: '',
  location: '',
  areaPerforming: '',
  company: '',
  tags: [],
  isFavorite: null,
  searchQuery: '',
};

export const VENDOR_TYPE_OPTIONS: VendorTypeValue[] = [
  'Freight Forwarding',
  'MLO',
  'NVOCC',
  'Transportation',
  'CHA',
  'Overseas Agent',
];
