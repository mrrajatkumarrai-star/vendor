import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { MAX_FILE_SIZE } from '@/config/constants';

export interface UploadResult {
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export async function uploadFile(
  file: File,
  path: string
): Promise<UploadResult> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
  }

  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fullPath = `${path}/${timestamp}_${sanitizedName}`;
  const storageRef = ref(storage, fullPath);

  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type,
  });

  const url = await getDownloadURL(snapshot.ref);

  return {
    name: file.name,
    url,
    type: file.type,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  };
}

export async function uploadVendorAttachment(
  vendorId: string,
  file: File
): Promise<UploadResult> {
  return uploadFile(file, `vendors/${vendorId}/attachments`);
}

export async function uploadVisitingCard(
  vendorId: string,
  file: File
): Promise<UploadResult> {
  return uploadFile(file, `vendors/${vendorId}/visiting-cards`);
}

export async function deleteFile(fileUrl: string): Promise<void> {
  try {
    const storageRef = ref(storage, fileUrl);
    await deleteObject(storageRef);
  } catch (error) {
    // File may already be deleted or URL format may not match storage ref
    console.warn('Failed to delete file from storage:', error);
  }
}
