export function isValidEmail(email: string): boolean {
  if (!email) return true; // optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  if (!phone) return true;
  const phoneRegex = /^\+?[\d\s-]{7,15}$/;
  return phoneRegex.test(phone);
}

export function isValidUrl(url: string): boolean {
  if (!url) return true;
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return true;
  } catch {
    return false;
  }
}

export function isValidGST(gst: string): boolean {
  if (!gst) return true;
  const gstRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;
  return gstRegex.test(gst.toUpperCase());
}

export function isValidPAN(pan: string): boolean {
  if (!pan) return true;
  const panRegex = /^[A-Z]{5}\d{4}[A-Z]{1}$/;
  return panRegex.test(pan.toUpperCase());
}

export function isValidIEC(iec: string): boolean {
  if (!iec) return true;
  const iecRegex = /^\d{10}$/;
  return iecRegex.test(iec);
}

export function sanitizeSearchTerm(term: string): string {
  return term.toLowerCase().trim().replace(/[^\w\s@.]/g, '');
}
