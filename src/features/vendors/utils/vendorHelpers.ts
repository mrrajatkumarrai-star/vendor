import type { Vendor } from '@/types/vendor';

export function getVendorDisplayName(vendor: Vendor): string {
  return vendor.name || 'Unnamed Vendor';
}

export function getVendorInitials(vendor: Vendor): string {
  const name = vendor.name || '';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || 'VN';
}

export function getVendorTypeColor(type: string): string {
  const colors: Record<string, string> = {
    'Freight Forwarding': 'bg-blue-50 text-blue-700',
    'MLO': 'bg-purple-50 text-purple-700',
    'NVOCC': 'bg-teal-50 text-teal-700',
    'Transportation': 'bg-amber-50 text-amber-700',
    'CHA': 'bg-green-50 text-green-700',
    'Overseas Agent': 'bg-indigo-50 text-indigo-700',
  };
  return colors[type] || 'bg-gray-50 text-gray-700';
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function copyVendorEmails(vendors: Vendor[]): string {
  return vendors
    .map((v) => v.email)
    .filter(Boolean)
    .join(', ');
}

export function copyVendorPhones(vendors: Vendor[]): string {
  return vendors
    .map((v) => v.mobile)
    .filter(Boolean)
    .join(', ');
}

export function copyVendorWhatsApps(vendors: Vendor[]): string {
  return vendors
    .map((v) => v.whatsapp)
    .filter(Boolean)
    .join(', ');
}

export function copyVendorCompanies(vendors: Vendor[]): string {
  return vendors
    .map((v) => v.company)
    .filter(Boolean)
    .join(', ');
}
