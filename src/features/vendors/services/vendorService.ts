import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  writeBatch,
  type QueryConstraint,
  type DocumentSnapshot,
  getCountFromServer,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Vendor, VendorFilters, VendorFormData } from '@/types/vendor';
import { FIRESTORE_COLLECTIONS, PAGE_SIZE, BATCH_SIZE } from '@/config/constants';
import { generateSearchTerms } from '@/features/vendors/utils/searchUtils';
import { generateWhatsAppUrl } from '@/utils/formatters';

const vendorsRef = collection(db, FIRESTORE_COLLECTIONS.VENDORS);

// ─── Query Builders ─────────────────────────────────────────────────────────

function buildFilterConstraints(filters: VendorFilters): QueryConstraint[] {
  const constraints: QueryConstraint[] = [];

  // Vendor type filter (array-contains — Firestore allows only one per query)
  if (filters.vendorType.length === 1) {
    constraints.push(where('vendorType', 'array-contains', filters.vendorType[0]));
  }

  if (filters.country) {
    constraints.push(where('country', '==', filters.country));
  }

  if (filters.state) {
    constraints.push(where('state', '==', filters.state));
  }

  if (filters.city) {
    constraints.push(where('city', '==', filters.city));
  }

  if (filters.company) {
    constraints.push(where('companyLower', '==', filters.company.toLowerCase()));
  }

  if (filters.isFavorite !== null) {
    constraints.push(where('isFavorite', '==', filters.isFavorite));
  }

  // For text search, use searchTerms array-contains (only if no vendorType filter already uses array-contains)
  if (filters.searchQuery && filters.vendorType.length <= 0) {
    const searchTerm = filters.searchQuery.toLowerCase().trim();
    if (searchTerm.length >= 2) {
      constraints.push(where('searchTerms', 'array-contains', searchTerm));
    }
  }

  return constraints;
}

// ─── Read Operations ────────────────────────────────────────────────────────

export interface VendorQueryResult {
  vendors: Vendor[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}

export async function fetchVendors(
  filters: VendorFilters,
  pageSize: number = PAGE_SIZE,
  lastDocument?: DocumentSnapshot | null
): Promise<VendorQueryResult> {
  const constraints = buildFilterConstraints(filters);
  constraints.push(orderBy('updatedAt', 'desc'));
  constraints.push(limit(pageSize + 1)); // Fetch one extra to determine hasMore

  if (lastDocument) {
    constraints.push(startAfter(lastDocument));
  }

  const q = query(vendorsRef, ...constraints);
  const snapshot = await getDocs(q);

  const docs = snapshot.docs;
  const hasMore = docs.length > pageSize;
  const vendorDocs = hasMore ? docs.slice(0, pageSize) : docs;

  let vendors = vendorDocs.map((d) => ({ id: d.id, ...d.data() } as Vendor));

  // Client-side filtering for multi-select vendorType (when >1 selected)
  if (filters.vendorType.length > 1) {
    vendors = vendors.filter((v) =>
      filters.vendorType.some((type) => v.vendorType.includes(type))
    );
  }

  // Client-side text search when array-contains is already used by vendorType
  if (filters.searchQuery && filters.vendorType.length > 0) {
    const searchLower = filters.searchQuery.toLowerCase().trim();
    vendors = vendors.filter(
      (v) =>
        v.name.toLowerCase().includes(searchLower) ||
        v.company.toLowerCase().includes(searchLower) ||
        v.email.toLowerCase().includes(searchLower) ||
        v.mobile.includes(searchLower) ||
        v.country.toLowerCase().includes(searchLower) ||
        v.city.toLowerCase().includes(searchLower) ||
        v.location.toLowerCase().includes(searchLower)
    );
  }

  // Client-side filtering for location and areaPerforming (string contains)
  if (filters.location) {
    const locLower = filters.location.toLowerCase();
    vendors = vendors.filter((v) => v.location.toLowerCase().includes(locLower));
  }

  if (filters.areaPerforming) {
    const areaLower = filters.areaPerforming.toLowerCase();
    vendors = vendors.filter((v) => v.areaPerforming.toLowerCase().includes(areaLower));
  }

  // Client-side tag filtering
  if (filters.tags.length > 0) {
    vendors = vendors.filter((v) =>
      filters.tags.every((tag) => v.tags.includes(tag))
    );
  }

  return {
    vendors,
    lastDoc: vendorDocs.length > 0 ? vendorDocs[vendorDocs.length - 1] : null,
    hasMore,
  };
}

export async function fetchVendorById(id: string): Promise<Vendor | null> {
  const docRef = doc(db, FIRESTORE_COLLECTIONS.VENDORS, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Vendor;
}

export async function fetchVendorCount(filters?: VendorFilters): Promise<number> {
  if (!filters) {
    const snapshot = await getCountFromServer(vendorsRef);
    return snapshot.data().count;
  }
  const constraints = buildFilterConstraints(filters);
  const q = query(vendorsRef, ...constraints);
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
}

export async function fetchAllVendorsForExport(filters: VendorFilters): Promise<Vendor[]> {
  const allVendors: Vendor[] = [];
  let lastDoc: DocumentSnapshot | null = null;
  let hasMore = true;

  while (hasMore) {
    const result = await fetchVendors(filters, 500, lastDoc);
    allVendors.push(...result.vendors);
    lastDoc = result.lastDoc;
    hasMore = result.hasMore;
  }

  return allVendors;
}

// ─── Write Operations ───────────────────────────────────────────────────────

export async function createVendor(data: VendorFormData, userId: string): Promise<string> {
  const searchTerms = generateSearchTerms(data);
  const whatsappUrl = generateWhatsAppUrl(data.whatsapp);

  const vendorData = {
    ...data,
    nameLower: data.name.toLowerCase(),
    companyLower: data.company.toLowerCase(),
    whatsappUrl,
    searchTerms,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: userId,
    updatedBy: userId,
  };

  const docRef = await addDoc(vendorsRef, vendorData);
  return docRef.id;
}

export async function updateVendor(
  id: string,
  data: Partial<VendorFormData>,
  userId: string
): Promise<void> {
  const docRef = doc(db, FIRESTORE_COLLECTIONS.VENDORS, id);

  const updateData: Record<string, unknown> = {
    ...data,
    updatedAt: serverTimestamp(),
    updatedBy: userId,
  };

  // Regenerate derived fields if relevant data changed
  if (data.name !== undefined) {
    updateData.nameLower = data.name.toLowerCase();
  }
  if (data.company !== undefined) {
    updateData.companyLower = data.company.toLowerCase();
  }
  if (data.whatsapp !== undefined) {
    updateData.whatsappUrl = generateWhatsAppUrl(data.whatsapp);
  }

  // Regenerate search terms if any searchable field changed
  if (data.name || data.company || data.email || data.mobile || data.country || data.city || data.location || data.state) {
    const existingDoc = await getDoc(docRef);
    if (existingDoc.exists()) {
      const merged = { ...existingDoc.data(), ...data } as VendorFormData;
      updateData.searchTerms = generateSearchTerms(merged);
    }
  }

  await updateDoc(docRef, updateData);
}

export async function deleteVendor(id: string): Promise<void> {
  const docRef = doc(db, FIRESTORE_COLLECTIONS.VENDORS, id);
  await deleteDoc(docRef);
}

export async function deleteVendorsBatch(ids: string[]): Promise<void> {
  // Process in batches of BATCH_SIZE (Firestore limit: 500 per batch)
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const chunk = ids.slice(i, i + BATCH_SIZE);
    chunk.forEach((id) => {
      const docRef = doc(db, FIRESTORE_COLLECTIONS.VENDORS, id);
      batch.delete(docRef);
    });
    await batch.commit();
  }
}

export async function toggleFavorite(id: string, isFavorite: boolean, userId: string): Promise<void> {
  const docRef = doc(db, FIRESTORE_COLLECTIONS.VENDORS, id);
  await updateDoc(docRef, {
    isFavorite,
    updatedAt: serverTimestamp(),
    updatedBy: userId,
  });
}

export async function batchCreateVendors(
  vendors: VendorFormData[],
  userId: string,
  onProgress?: (current: number, total: number) => void
): Promise<{ successCount: number; errorCount: number }> {
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < vendors.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const chunk = vendors.slice(i, i + BATCH_SIZE);

    chunk.forEach((data) => {
      const searchTerms = generateSearchTerms(data);
      const whatsappUrl = generateWhatsAppUrl(data.whatsapp);
      const newDocRef = doc(vendorsRef);

      batch.set(newDocRef, {
        ...data,
        nameLower: data.name.toLowerCase(),
        companyLower: data.company.toLowerCase(),
        whatsappUrl,
        searchTerms,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userId,
        updatedBy: userId,
      });
    });

    try {
      await batch.commit();
      successCount += chunk.length;
    } catch {
      errorCount += chunk.length;
    }

    onProgress?.(Math.min(i + BATCH_SIZE, vendors.length), vendors.length);
  }

  return { successCount, errorCount };
}
