import type { VendorFormData } from '@/types/vendor';

/**
 * Generates lowercased search tokens from vendor data for Firestore array-contains queries.
 * Each meaningful word from searchable fields is stored as a separate token.
 * This enables prefix-like matching via array-contains.
 */
export function generateSearchTerms(data: Partial<VendorFormData>): string[] {
  const fields = [
    data.name,
    data.company,
    data.email,
    data.mobile,
    data.country,
    data.state,
    data.city,
    data.location,
    data.areaPerforming,
    ...(data.vendorType || []),
    ...(data.tags || []),
  ];

  const terms = new Set<string>();

  fields.forEach((field) => {
    if (!field) return;
    const lower = field.toLowerCase().trim();

    // Add the full field value
    if (lower.length >= 2) {
      terms.add(lower);
    }

    // Add individual words
    lower.split(/[\s,.-]+/).forEach((word) => {
      if (word.length >= 2) {
        terms.add(word);
      }
    });

    // Add progressive prefixes for the primary field (name) — enables prefix search
    if (field === data.name && lower.length >= 2) {
      for (let i = 2; i <= Math.min(lower.length, 12); i++) {
        terms.add(lower.slice(0, i));
      }
    }
  });

  return Array.from(terms).slice(0, 50); // Firestore limit: reasonable array size
}

/**
 * Client-side text search scoring for ranking results.
 */
export function scoreVendorMatch(vendor: { name: string; company: string; email: string; mobile: string }, query: string): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;

  let score = 0;

  // Exact matches score highest
  if (vendor.name.toLowerCase() === q) score += 100;
  if (vendor.company.toLowerCase() === q) score += 80;

  // Starts with
  if (vendor.name.toLowerCase().startsWith(q)) score += 50;
  if (vendor.company.toLowerCase().startsWith(q)) score += 40;

  // Contains
  if (vendor.name.toLowerCase().includes(q)) score += 20;
  if (vendor.company.toLowerCase().includes(q)) score += 15;
  if (vendor.email.toLowerCase().includes(q)) score += 10;
  if (vendor.mobile.includes(q)) score += 10;

  return score;
}
