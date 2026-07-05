import { useState, useCallback } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { useVendorStore } from '@/features/vendors/store/vendorStore';
import { useAuthStore } from '@/features/auth/store/authStore';
import {
  parseExcelFile,
  validateImportRow,
  importRowToVendorData,
  generateSampleTemplate,
} from '@/features/import/utils/excelParser';
import { batchCreateVendors } from '@/features/vendors/services/vendorService';
import { useQueryClient } from '@tanstack/react-query';
import type { ImportRow } from '@/types/common';
import {
  Upload, Download, FileSpreadsheet, AlertTriangle, CheckCircle, XCircle
} from 'lucide-react';
import { cn } from '@/utils/cn';

type ImportStep = 'upload' | 'preview' | 'importing' | 'complete';

export function ImportModal() {
  const { importModalOpen, setImportModalOpen } = useVendorStore();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const [step, setStep] = useState<ImportStep>('upload');
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [result, setResult] = useState({ success: 0, errors: 0 });
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStep('upload');
    setRows([]);
    setProgress({ current: 0, total: 0 });
    setResult({ success: 0, errors: 0 });
    setError(null);
  }, []);

  const handleClose = () => {
    setImportModalOpen(false);
    setTimeout(reset, 200);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    try {
      const rawRows = await parseExcelFile(file);
      if (rawRows.length === 0) {
        setError('File is empty or has no data rows.');
        return;
      }

      const validated = rawRows.map((row, index) => validateImportRow(row, index));

      // Simple duplicate detection within the file (same name + company + mobile)
      const seen = new Map<string, number>();
      validated.forEach((row) => {
        const key = `${row.data.name?.toLowerCase()}-${row.data.company?.toLowerCase()}-${row.data.mobile}`;
        if (seen.has(key)) {
          row.isDuplicate = true;
          const originalIdx = seen.get(key)!;
          if (!validated[originalIdx].isDuplicate) {
            validated[originalIdx].isDuplicate = true;
          }
        } else {
          seen.set(key, row.rowIndex);
        }
      });

      setRows(validated);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    }
  };

  const handleImport = async () => {
    if (!user) return;

    const validRows = rows.filter((r) => r.isValid && !r.isDuplicate);
    if (validRows.length === 0) return;

    setStep('importing');
    setProgress({ current: 0, total: validRows.length });

    try {
      const vendorDataList = validRows.map((r) => importRowToVendorData(r.data));
      const importResult = await batchCreateVendors(
        vendorDataList,
        user.uid,
        (current, total) => setProgress({ current, total })
      );

      setResult({ success: importResult.successCount, errors: importResult.errorCount });
      setStep('complete');
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['vendorCount'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
      setStep('preview');
    }
  };

  const handleDownloadTemplate = () => {
    const data = generateSampleTemplate();
    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vendor_import_template.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  const validCount = rows.filter((r) => r.isValid && !r.isDuplicate).length;
  const errorCount = rows.filter((r) => !r.isValid).length;
  const duplicateCount = rows.filter((r) => r.isDuplicate).length;

  return (
    <Modal
      isOpen={importModalOpen}
      onClose={handleClose}
      title="Import Vendors"
      size="xl"
    >
      {step === 'upload' && (
        <div className="space-y-4 py-4">
          <div className="text-center">
            <FileSpreadsheet className="w-10 h-10 text-muted mx-auto mb-2" />
            <h3 className="text-sm font-medium text-foreground mb-0.5">
              Upload Excel or CSV File
            </h3>
            <p className="text-2xs text-muted mb-3">
              Supported formats: .csv, .xls, .xlsx
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-1.5 px-2.5 py-2 bg-red-50 border border-red-200 rounded text-2xs text-danger">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex justify-center gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".csv,.xls,.xlsx"
                className="hidden"
                onChange={handleFileSelect}
              />
              <span className="btn-primary inline-flex items-center gap-1 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                Choose File
              </span>
            </label>

            <Button
              variant="secondary"
              size="md"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={handleDownloadTemplate}
            >
              Download Template
            </Button>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <div className="space-y-3">
          {/* Summary */}
          <div className="flex items-center gap-3">
            <Badge variant="default">{rows.length} rows</Badge>
            <Badge variant="success">{validCount} valid</Badge>
            {errorCount > 0 && <Badge variant="danger">{errorCount} errors</Badge>}
            {duplicateCount > 0 && <Badge variant="warning">{duplicateCount} duplicates</Badge>}
          </div>

          {error && (
            <div className="flex items-center gap-1.5 px-2.5 py-2 bg-red-50 border border-red-200 rounded text-2xs text-danger">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Preview table */}
          <div className="border border-border rounded overflow-auto max-h-[400px] scrollbar-thin">
            <table className="w-full border-collapse text-2xs">
              <thead className="sticky top-0">
                <tr>
                  <th className="table-header-cell w-8">#</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Name</th>
                  <th className="table-header-cell">Company</th>
                  <th className="table-header-cell">Type</th>
                  <th className="table-header-cell">Country</th>
                  <th className="table-header-cell">City</th>
                  <th className="table-header-cell">Errors</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.rowIndex}
                    className={cn(
                      !row.isValid && 'bg-red-50',
                      row.isDuplicate && 'bg-amber-50'
                    )}
                  >
                    <td className="table-cell">{row.rowIndex + 1}</td>
                    <td className="table-cell">
                      {!row.isValid ? (
                        <XCircle className="w-3 h-3 text-danger" />
                      ) : row.isDuplicate ? (
                        <AlertTriangle className="w-3 h-3 text-warning" />
                      ) : (
                        <CheckCircle className="w-3 h-3 text-success" />
                      )}
                    </td>
                    <td className="table-cell">{row.data.name}</td>
                    <td className="table-cell">{row.data.company}</td>
                    <td className="table-cell">{row.data.vendorType}</td>
                    <td className="table-cell">{row.data.country}</td>
                    <td className="table-cell">{row.data.city}</td>
                    <td className="table-cell text-danger">
                      {row.errors.join('; ')}
                      {row.isDuplicate && ' Duplicate'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button variant="secondary" onClick={reset}>
              Choose Different File
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleImport}
                disabled={validCount === 0}
              >
                Import {validCount} Vendor{validCount !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 'importing' && (
        <div className="py-8 text-center space-y-4">
          <Spinner size="lg" />
          <div>
            <h3 className="text-sm font-medium text-foreground">Importing Vendors...</h3>
            <p className="text-2xs text-muted mt-0.5">
              {progress.current} of {progress.total} processed
            </p>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mx-auto max-w-xs">
            <div
              className="bg-accent h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {step === 'complete' && (
        <div className="py-8 text-center space-y-4">
          <CheckCircle className="w-10 h-10 text-success mx-auto" />
          <div>
            <h3 className="text-sm font-medium text-foreground">Import Complete</h3>
            <p className="text-2xs text-muted mt-0.5">
              {result.success} vendor{result.success !== 1 ? 's' : ''} imported successfully
              {result.errors > 0 && `, ${result.errors} failed`}
            </p>
          </div>
          <Button variant="primary" onClick={handleClose}>
            Done
          </Button>
        </div>
      )}
    </Modal>
  );
}
