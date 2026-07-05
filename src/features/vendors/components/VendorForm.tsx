import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Textarea } from '@/components/ui/Input';
import { Select, MultiSelect } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Spinner } from '@/components/ui/Spinner';
import { vendorFormSchema, type VendorFormSchema } from '@/features/vendors/schemas/vendorSchema';
import { useVendorStore } from '@/features/vendors/store/vendorStore';
import { useVendorById } from '@/features/vendors/hooks/useVendors';
import { useCreateVendor, useUpdateVendor } from '@/features/vendors/hooks/useVendorMutation';
import { VENDOR_TYPE_OPTIONS } from '@/types/vendor';
import { COUNTRIES, INDIAN_STATES } from '@/config/countries';
import { uploadVendorAttachment, uploadVisitingCard } from '@/services/storageService';
import { Upload, FileText, X } from 'lucide-react';

export function VendorForm() {
  const { drawerOpen, closeDrawer, editingVendorId } = useVendorStore();
  const { data: existingVendor, isLoading: isLoadingVendor } = useVendorById(editingVendorId);
  const createMutation = useCreateVendor();
  const updateMutation = useUpdateVendor();
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!editingVendorId;
  const title = isEditing ? 'Edit Vendor' : 'Add Vendor';

  const vendorTypeOptions = VENDOR_TYPE_OPTIONS.map((v) => ({ label: v, value: v }));
  const countryOptions = COUNTRIES;
  const stateOptions = INDIAN_STATES;

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VendorFormSchema>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      name: '',
      designation: '',
      company: '',
      vendorType: [],
      country: '',
      state: '',
      city: '',
      location: '',
      areaPerforming: '',
      mobile: '',
      whatsapp: '',
      email: '',
      website: '',
      gst: '',
      iec: '',
      pan: '',
      tags: [],
      notes: '',
      attachments: [],
      isFavorite: false,
    },
  });

  // Reset form when vendor data loads or drawer opens for new vendor
  useEffect(() => {
    if (isEditing && existingVendor) {
      reset({
        name: existingVendor.name,
        designation: existingVendor.designation,
        company: existingVendor.company,
        vendorType: existingVendor.vendorType,
        country: existingVendor.country,
        state: existingVendor.state,
        city: existingVendor.city,
        location: existingVendor.location,
        areaPerforming: existingVendor.areaPerforming,
        mobile: existingVendor.mobile,
        whatsapp: existingVendor.whatsapp,
        email: existingVendor.email,
        website: existingVendor.website,
        gst: existingVendor.gst,
        iec: existingVendor.iec,
        pan: existingVendor.pan,
        tags: existingVendor.tags,
        notes: existingVendor.notes,
        attachments: existingVendor.attachments,
        isFavorite: existingVendor.isFavorite,
      });
    } else if (!isEditing && drawerOpen) {
      reset();
    }
  }, [isEditing, existingVendor, drawerOpen, reset]);

  const onSubmit = async (data: VendorFormSchema) => {
    try {
      if (isEditing && editingVendorId) {
        await updateMutation.mutateAsync({ id: editingVendorId, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      closeDrawer();
    } catch (error) {
      console.error('Failed to save vendor:', error);
    }
  };

  const handleFileUpload = async (files: FileList | null, type: 'attachment' | 'card') => {
    if (!files || files.length === 0) return;
    setUploadingFiles(true);
    try {
      const currentAttachments = watch('attachments') || [];
      const vendorId = editingVendorId || 'new';

      for (const file of Array.from(files)) {
        const result =
          type === 'card'
            ? await uploadVisitingCard(vendorId, file)
            : await uploadVendorAttachment(vendorId, file);

        currentAttachments.push(result);
      }

      reset({ ...watch(), attachments: [...currentAttachments] });
    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      setUploadingFiles(false);
    }
  };

  const removeAttachment = (index: number) => {
    const current = watch('attachments') || [];
    const updated = current.filter((_, i) => i !== index);
    reset({ ...watch(), attachments: updated });
  };

  const whatsappNumber = watch('whatsapp');
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`
    : '';

  return (
    <Drawer isOpen={drawerOpen} onClose={closeDrawer} title={title} width="w-[480px]">
      {isEditing && isLoadingVendor ? (
        <div className="flex items-center justify-center py-8">
          <Spinner label="Loading vendor..." />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {/* Basic Info */}
          <SectionLabel>Basic Information</SectionLabel>
          <Input
            label="Vendor Name *"
            placeholder="Full name"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Designation"
            placeholder="e.g., Manager, Director"
            error={errors.designation?.message}
            {...register('designation')}
          />
          <Input
            label="Company"
            placeholder="Company name"
            error={errors.company?.message}
            {...register('company')}
          />

          <Controller
            name="vendorType"
            control={control}
            render={({ field }) => (
              <MultiSelect
                label="Vendor Type *"
                options={vendorTypeOptions}
                value={field.value}
                onChange={field.onChange}
                placeholder="Select vendor types"
                error={errors.vendorType?.message}
              />
            )}
          />

          {/* Location */}
          <SectionLabel>Location</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <Select
                  label="Country"
                  options={countryOptions}
                  placeholder="Select country"
                  {...field}
                />
              )}
            />
            <Controller
              name="state"
              control={control}
              render={({ field }) => (
                <Select
                  label="State"
                  options={stateOptions}
                  placeholder="Select state"
                  {...field}
                />
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="City"
              placeholder="City name"
              {...register('city')}
            />
            <Input
              label="Location"
              placeholder="Specific location"
              {...register('location')}
            />
          </div>
          <Input
            label="Area Performing"
            placeholder="Area of operation"
            {...register('areaPerforming')}
          />

          {/* Contact */}
          <SectionLabel>Contact Information</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Mobile Number"
              placeholder="+91 XXXXX XXXXX"
              error={errors.mobile?.message}
              {...register('mobile')}
            />
            <Input
              label="WhatsApp Number"
              placeholder="+91 XXXXX XXXXX"
              error={errors.whatsapp?.message}
              {...register('whatsapp')}
            />
          </div>
          {whatsappUrl && (
            <div className="text-2xs text-muted">
              WhatsApp URL:{' '}
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                {whatsappUrl}
              </a>
            </div>
          )}
          <Input
            label="Email"
            type="email"
            placeholder="vendor@company.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Website"
            placeholder="https://example.com"
            error={errors.website?.message}
            {...register('website')}
          />

          {/* Compliance */}
          <SectionLabel>Compliance</SectionLabel>
          <div className="grid grid-cols-3 gap-2">
            <Input
              label="GST"
              placeholder="22AAAAA0000A1Z5"
              error={errors.gst?.message}
              {...register('gst')}
            />
            <Input
              label="IEC"
              placeholder="0000000000"
              error={errors.iec?.message}
              {...register('iec')}
            />
            <Input
              label="PAN"
              placeholder="ABCDE1234F"
              error={errors.pan?.message}
              {...register('pan')}
            />
          </div>

          {/* Notes & Tags */}
          <SectionLabel>Additional</SectionLabel>
          <Textarea
            label="Notes"
            placeholder="Any additional notes..."
            error={errors.notes?.message}
            {...register('notes')}
          />

          {/* File uploads */}
          <SectionLabel>Attachments</SectionLabel>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={<Upload className="w-3 h-3" />}
              onClick={() => cardInputRef.current?.click()}
              loading={uploadingFiles}
            >
              Visiting Card
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={<FileText className="w-3 h-3" />}
              onClick={() => fileInputRef.current?.click()}
              loading={uploadingFiles}
            >
              Documents
            </Button>
          </div>

          <input
            ref={cardInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files, 'card')}
          />
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,image/*"
            multiple
            onChange={(e) => handleFileUpload(e.target.files, 'attachment')}
          />

          {/* Attachment list */}
          {(watch('attachments') || []).length > 0 && (
            <div className="space-y-1">
              {watch('attachments').map((att, idx) => (
                <div key={idx} className="flex items-center gap-2 px-2 py-1 bg-gray-50 rounded text-2xs">
                  <FileText className="w-3 h-3 text-muted" />
                  <span className="flex-1 truncate">{att.name}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(idx)}
                    className="text-muted hover:text-danger"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="secondary" onClick={closeDrawer}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting || createMutation.isPending || updateMutation.isPending}
            >
              {isEditing ? 'Update Vendor' : 'Save Vendor'}
            </Button>
          </div>
        </form>
      )}
    </Drawer>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-2xs font-semibold text-muted uppercase tracking-wider pt-2 pb-0.5 border-b border-border">
      {children}
    </div>
  );
}
