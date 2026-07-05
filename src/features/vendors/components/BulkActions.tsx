import { Copy, Download, Trash2, Mail, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useDeleteVendorsBatch } from '@/features/vendors/hooks/useVendorMutation';
import {
  copyToClipboard,
  copyVendorEmails,
  copyVendorPhones,
  copyVendorWhatsApps,
  copyVendorCompanies,
} from '@/features/vendors/utils/vendorHelpers';
import type { Vendor } from '@/types/vendor';

interface BulkActionsProps {
  selectedVendors: Vendor[];
  onClearSelection: () => void;
}

export function BulkActions({ selectedVendors, onClearSelection }: BulkActionsProps) {
  const canDelete = useAuthStore((s) => s.canDelete());
  const deleteBatch = useDeleteVendorsBatch();

  const handleCopyEmails = () => {
    const emails = copyVendorEmails(selectedVendors);
    copyToClipboard(emails);
  };

  const handleCopyPhones = () => {
    const phones = copyVendorPhones(selectedVendors);
    copyToClipboard(phones);
  };

  const handleCopyWhatsApps = () => {
    const whatsapps = copyVendorWhatsApps(selectedVendors);
    copyToClipboard(whatsapps);
  };

  const handleCopyCompanies = () => {
    const companies = copyVendorCompanies(selectedVendors);
    copyToClipboard(companies);
  };

  const handleDeleteSelected = () => {
    if (
      window.confirm(
        `Delete ${selectedVendors.length} selected vendor(s)? This action cannot be undone.`
      )
    ) {
      const ids = selectedVendors.map((v) => v.id);
      deleteBatch.mutate(ids, {
        onSuccess: () => onClearSelection(),
      });
    }
  };

  const handleEmailSelected = () => {
    const emails = copyVendorEmails(selectedVendors);
    if (emails) {
      window.location.href = `mailto:${emails}`;
    }
  };

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-light border-b border-blue-200 flex-shrink-0">
      <span className="text-2xs font-medium text-accent mr-1">
        {selectedVendors.length} selected
      </span>

      <Tooltip content="Copy Emails">
        <Button variant="ghost" size="sm" icon={<Copy className="w-3 h-3" />} onClick={handleCopyEmails}>
          Emails
        </Button>
      </Tooltip>

      <Tooltip content="Copy Phone Numbers">
        <Button variant="ghost" size="sm" icon={<Copy className="w-3 h-3" />} onClick={handleCopyPhones}>
          Phones
        </Button>
      </Tooltip>

      <Tooltip content="Copy WhatsApp Numbers">
        <Button variant="ghost" size="sm" icon={<Copy className="w-3 h-3" />} onClick={handleCopyWhatsApps}>
          WhatsApp
        </Button>
      </Tooltip>

      <Tooltip content="Copy Company Names">
        <Button variant="ghost" size="sm" icon={<Copy className="w-3 h-3" />} onClick={handleCopyCompanies}>
          Companies
        </Button>
      </Tooltip>

      <Tooltip content="Email Selected Vendors">
        <Button variant="ghost" size="sm" icon={<Mail className="w-3 h-3" />} onClick={handleEmailSelected}>
          Email
        </Button>
      </Tooltip>

      <div className="w-px h-4 bg-blue-200" />

      {canDelete && (
        <Tooltip content="Delete Selected">
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 className="w-3 h-3" />}
            onClick={handleDeleteSelected}
            loading={deleteBatch.isPending}
            className="text-danger hover:text-danger"
          >
            Delete
          </Button>
        </Tooltip>
      )}

      <div className="flex-1" />

      <Button variant="ghost" size="sm" icon={<X className="w-3 h-3" />} onClick={onClearSelection}>
        Clear
      </Button>
    </div>
  );
}
