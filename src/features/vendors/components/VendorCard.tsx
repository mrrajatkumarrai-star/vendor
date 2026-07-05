import React, { memo } from 'react';
import {
  Phone, MessageCircle, Mail, Globe, Edit, Trash2, Star,
  MapPin, Building2, User
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useVendorStore } from '@/features/vendors/store/vendorStore';
import { useToggleFavorite, useDeleteVendor } from '@/features/vendors/hooks/useVendorMutation';
import { getVendorInitials, getVendorTypeColor } from '@/features/vendors/utils/vendorHelpers';
import type { Vendor } from '@/types/vendor';
import { cn } from '@/utils/cn';

interface VendorCardProps {
  vendor: Vendor;
  compact?: boolean;
}

export const VendorCard = memo(function VendorCard({ vendor, compact }: VendorCardProps) {
  const canEdit = useAuthStore((s) => s.canEdit());
  const canDelete = useAuthStore((s) => s.canDelete());
  const openDrawer = useVendorStore((s) => s.openDrawer);
  const toggleFav = useToggleFavorite();
  const deleteVendor = useDeleteVendor();

  const handleDelete = () => {
    if (window.confirm(`Delete vendor "${vendor.name}"? This action cannot be undone.`)) {
      deleteVendor.mutate(vendor.id);
    }
  };

  return (
    <div className={cn(
      'card p-2.5 hover:shadow-elevated transition-shadow duration-150 group',
      compact ? 'max-w-[260px]' : 'max-w-[300px]'
    )}>
      {/* Header */}
      <div className="flex items-start gap-2 mb-1.5">
        <div className="w-7 h-7 rounded-full bg-accent-light text-accent flex items-center justify-center text-2xs font-bold flex-shrink-0">
          {getVendorInitials(vendor)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-foreground truncate">{vendor.name}</span>
            <button
              onClick={() => toggleFav.mutate({ id: vendor.id, isFavorite: !vendor.isFavorite })}
              className={cn(
                'flex-shrink-0 transition-colors',
                vendor.isFavorite ? 'text-amber-500' : 'text-gray-300 hover:text-amber-400'
              )}
              aria-label={vendor.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={cn('w-3 h-3', vendor.isFavorite && 'fill-current')} />
            </button>
          </div>
          {vendor.designation && (
            <p className="text-2xs text-muted truncate">{vendor.designation}</p>
          )}
        </div>
      </div>

      {/* Company & Location */}
      {vendor.company && (
        <div className="flex items-center gap-1 text-2xs text-muted mb-0.5">
          <Building2 className="w-2.5 h-2.5 flex-shrink-0" />
          <span className="truncate">{vendor.company}</span>
        </div>
      )}
      {(vendor.location || vendor.city) && (
        <div className="flex items-center gap-1 text-2xs text-muted mb-1">
          <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
          <span className="truncate">
            {[vendor.location, vendor.city, vendor.country].filter(Boolean).join(', ')}
          </span>
        </div>
      )}

      {/* Vendor Types */}
      <div className="flex flex-wrap gap-0.5 mb-1.5">
        {vendor.vendorType.map((type) => (
          <Badge key={type} className={cn('text-2xs', getVendorTypeColor(type))}>
            {type}
          </Badge>
        ))}
      </div>

      {vendor.areaPerforming && (
        <p className="text-2xs text-muted mb-1.5 truncate">
          Area: {vendor.areaPerforming}
        </p>
      )}

      {/* Contact actions */}
      <div className="flex items-center gap-1 pt-1.5 border-t border-border">
        {vendor.mobile && (
          <Tooltip content={vendor.mobile}>
            <a href={`tel:${vendor.mobile}`} className="p-1 rounded hover:bg-hover-bg text-muted hover:text-foreground">
              <Phone className="w-3 h-3" />
            </a>
          </Tooltip>
        )}
        {vendor.whatsappUrl && (
          <Tooltip content="WhatsApp">
            <a href={vendor.whatsappUrl} target="_blank" rel="noopener noreferrer" className="p-1 rounded hover:bg-hover-bg text-green-600 hover:text-green-700">
              <MessageCircle className="w-3 h-3" />
            </a>
          </Tooltip>
        )}
        {vendor.email && (
          <Tooltip content={vendor.email}>
            <a href={`mailto:${vendor.email}`} className="p-1 rounded hover:bg-hover-bg text-muted hover:text-foreground">
              <Mail className="w-3 h-3" />
            </a>
          </Tooltip>
        )}
        {vendor.website && (
          <Tooltip content={vendor.website}>
            <a href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`} target="_blank" rel="noopener noreferrer" className="p-1 rounded hover:bg-hover-bg text-muted hover:text-foreground">
              <Globe className="w-3 h-3" />
            </a>
          </Tooltip>
        )}

        <div className="flex-1" />

        {canEdit && (
          <Tooltip content="Edit">
            <button onClick={() => openDrawer(vendor.id)} className="p-1 rounded hover:bg-hover-bg text-muted hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity">
              <Edit className="w-3 h-3" />
            </button>
          </Tooltip>
        )}
        {canDelete && (
          <Tooltip content="Delete">
            <button onClick={handleDelete} className="p-1 rounded hover:bg-hover-bg text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 className="w-3 h-3" />
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );
});
