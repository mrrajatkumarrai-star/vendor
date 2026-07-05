import * as XLSX from 'xlsx';
import type { VendorFormData, VendorTypeValue } from '@/types/vendor';
import { VENDOR_TYPE_OPTIONS, VENDOR_IMPORT_COLUMNS } from '@/config/constants';
import type { ImportRow } from '@/types/common';

export function parseExcelFile(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(firstSheet, {
          defval: '',
          raw: false,
        });
        resolve(jsonData);
      } catch (error) {
        reject(new Error('Failed to parse file. Ensure it is a valid Excel or CSV file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsArrayBuffer(file);
  });
}

export function validateImportRow(row: Record<string, string>, rowIndex: number): ImportRow {
  const errors: string[] = [];

  // Map common header variations
  const mapped = normalizeHeaders(row);

  // Required fields
  if (!mapped.name?.trim()) {
    errors.push('Name is required');
  }

  if (!mapped.vendorType?.trim()) {
    errors.push('Vendor Type is required');
  } else {
    // Validate vendor types
    const types = mapped.vendorType.split(',').map((t) => t.trim());
    const invalidTypes = types.filter((t) => !VENDOR_TYPE_OPTIONS.includes(t));
    if (invalidTypes.length > 0) {
      errors.push(`Invalid vendor type(s): ${invalidTypes.join(', ')}`);
    }
  }

  // Email validation
  if (mapped.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mapped.email)) {
    errors.push('Invalid email format');
  }

  // Phone validation
  if (mapped.mobile && !/^\+?[\d\s-]{7,15}$/.test(mapped.mobile)) {
    errors.push('Invalid mobile number format');
  }

  // GST validation
  if (mapped.gst && !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(mapped.gst.toUpperCase())) {
    errors.push('Invalid GST format');
  }

  // PAN validation
  if (mapped.pan && !/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(mapped.pan.toUpperCase())) {
    errors.push('Invalid PAN format');
  }

  return {
    rowIndex,
    data: mapped,
    errors,
    isDuplicate: false,
    isValid: errors.length === 0,
  };
}

function normalizeHeaders(row: Record<string, string>): Record<string, string> {
  const normalized: Record<string, string> = {};
  const headerMap: Record<string, string> = {
    'vendor name': 'name',
    'vendor_name': 'name',
    'name': 'name',
    'designation': 'designation',
    'company': 'company',
    'company name': 'company',
    'vendor type': 'vendorType',
    'vendor_type': 'vendorType',
    'vendortype': 'vendorType',
    'type': 'vendorType',
    'country': 'country',
    'state': 'state',
    'city': 'city',
    'location': 'location',
    'area performing': 'areaPerforming',
    'area_performing': 'areaPerforming',
    'areaperforming': 'areaPerforming',
    'area': 'areaPerforming',
    'mobile': 'mobile',
    'mobile number': 'mobile',
    'phone': 'mobile',
    'whatsapp': 'whatsapp',
    'whatsapp number': 'whatsapp',
    'email': 'email',
    'email address': 'email',
    'website': 'website',
    'gst': 'gst',
    'gst number': 'gst',
    'gstin': 'gst',
    'iec': 'iec',
    'iec number': 'iec',
    'pan': 'pan',
    'pan number': 'pan',
    'tags': 'tags',
    'notes': 'notes',
    'remarks': 'notes',
  };

  Object.entries(row).forEach(([key, value]) => {
    const normalizedKey = headerMap[key.toLowerCase().trim()] || key.toLowerCase().trim();
    normalized[normalizedKey] = String(value || '').trim();
  });

  return normalized;
}

export function importRowToVendorData(row: Record<string, string>): VendorFormData {
  const vendorTypes = (row.vendorType || '')
    .split(',')
    .map((t) => t.trim())
    .filter((t) => VENDOR_TYPE_OPTIONS.includes(t)) as VendorTypeValue[];

  const tags = (row.tags || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  return {
    name: row.name || '',
    designation: row.designation || '',
    company: row.company || '',
    vendorType: vendorTypes,
    country: row.country || '',
    state: row.state || '',
    city: row.city || '',
    location: row.location || '',
    areaPerforming: row.areaPerforming || '',
    mobile: row.mobile || '',
    whatsapp: row.whatsapp || '',
    email: row.email || '',
    website: row.website || '',
    gst: row.gst || '',
    iec: row.iec || '',
    pan: row.pan || '',
    tags,
    notes: row.notes || '',
    attachments: [],
    isFavorite: false,
  };
}

export function generateSampleTemplate(): Uint8Array {
  const headers = VENDOR_IMPORT_COLUMNS.map((col) => {
    const labelMap: Record<string, string> = {
      name: 'Vendor Name',
      designation: 'Designation',
      company: 'Company',
      vendorType: 'Vendor Type',
      country: 'Country',
      state: 'State',
      city: 'City',
      location: 'Location',
      areaPerforming: 'Area Performing',
      mobile: 'Mobile',
      whatsapp: 'WhatsApp',
      email: 'Email',
      website: 'Website',
      gst: 'GST',
      iec: 'IEC',
      pan: 'PAN',
      tags: 'Tags',
      notes: 'Notes',
    };
    return labelMap[col] || col;
  });

  const sampleRow = [
    'John Smith',
    'Manager',
    'ABC Logistics',
    'Freight Forwarding, CHA',
    'India',
    'Maharashtra',
    'Mumbai',
    'Andheri East',
    'Western India',
    '+91 98765 43210',
    '+91 98765 43210',
    'john@abclogistics.com',
    'https://abclogistics.com',
    '27AAAAA0000A1Z5',
    '0123456789',
    'ABCDE1234F',
    'freight, import',
    'Key contact for Mumbai operations',
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Vendors');

  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as Uint8Array;
}
