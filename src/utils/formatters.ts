import { Timestamp } from 'firebase/firestore';
import { format, formatDistanceToNow } from 'date-fns';

export function formatDate(timestamp: Timestamp | null | undefined): string {
  if (!timestamp) return '—';
  const date = timestamp.toDate();
  return format(date, 'dd MMM yyyy');
}

export function formatDateTime(timestamp: Timestamp | null | undefined): string {
  if (!timestamp) return '—';
  const date = timestamp.toDate();
  return format(date, 'dd MMM yyyy, HH:mm');
}

export function formatRelativeTime(timestamp: Timestamp | null | undefined): string {
  if (!timestamp) return '—';
  const date = timestamp.toDate();
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatPhone(phone: string): string {
  if (!phone) return '—';
  return phone.replace(/(\d{2})(\d{5})(\d{5})/, '+$1 $2 $3');
}

export function generateWhatsAppUrl(number: string): string {
  if (!number) return '';
  const cleaned = number.replace(/\D/g, '');
  return `https://wa.me/${cleaned}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text || '';
  return text.slice(0, maxLength) + '…';
}

export function capitalizeFirst(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}
