'use client';

// =====================================================
// WOLF SHIELD: FRICTIONLESS INGESTION ENGINE
// Drag-and-drop CSV/Excel importer for rent rolls
// =====================================================

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download, Undo } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
type ImportStep = 'upload' | 'mapping' | 'processing' | 'complete';

interface ParsedColumn {
  csvHeader: string;
  dbField: string | null;
  sampleData: string[];
  isRequired: boolean;
  validationStatus: 'valid' | 'warning' | 'error' | null;
}

interface ValidationError {
  row: number;
  field: string;
  value: string;
  error: string;
  severity: 'error' | 'warning';
}

interface ImportSummary {
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  warningRows: number;
  errors: ValidationError[];
  importJobId: string;
}

export default function ImportRentRollPage() {
  const router = useRouter();
  
  // State
  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [parsedColumns, setParsedColumns] = useState<ParsedColumn[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // =====================================================
  // STEP 1: FILE UPLOAD
  // =====================================================
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setIsProcessing(true);

    try {
      // Parse file client-side for preview
      const response = await fetch('/api/import/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: uploadedFile.name,
          fileSize: uploadedFile.size,
        }),
      });

      if (!response.ok) throw new Error('Failed to parse file');

      const { signedUrl, columns } = await response.json();

      // Upload file to S3
      const formData = new FormData();
      formData.append('file', uploadedFile);
      
      await fetch(signedUrl, {
        method: 'PUT',
        body: uploadedFile,
      });

      setParsedColumns(columns);
      setStep('mapping');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxSize: 10 * 1024 * 1024, // 10 MB
    multiple: false,
  });

  // =====================================================
  // STEP 2: COLUMN MAPPING
  // =====================================================
  const handleColumnMapping = (csvHeader: string, dbField: string | null) => {
    setParsedColumns(prev =>
      prev.map(col =>
        col.csvHeader === csvHeader ? { ...col, dbField } : col
      )
    );
  };

  const startImport = async () => {
    if (!selectedProperty) {
      alert('Please select a property');
      return;
    }

    setStep('processing');
    setIsProcessing(true);
    setProgress(0);

    try {
      const response = await fetch('/api/import/rent-roll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file!.name,
          propertyId: selectedProperty,
          columnMapping: parsedColumns.reduce((acc, col) => {
            if (col.dbField) acc[col.csvHeader] = col.dbField;
            return acc;
          }, {} as Record<string, string>),
        }),
      });

      if (!response.ok) throw new Error('Import failed');

      const summary: ImportSummary = await response.json();
      setImportSummary(summary);
      setStep('complete');
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import failed. Please check the error log and try again.');
      setStep('mapping');
    } finally {
      setIsProcessing(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            📊 Import Rent Roll
          </h1>
          <p className="text-slate-300">
            Upload your CSV or Excel file to import tenants in under 3 minutes
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {['Upload', 'Map Columns', 'Import', 'Complete'].map((label, idx) => {
              const stepIndex = ['upload', 'mapping', 'processing', 'complete'].indexOf(step);
              const isActive = idx === stepIndex;
              const isComplete = idx < stepIndex;

              return (
                <div key={label} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                        isComplete
                          ? 'bg-emerald-500 text-white'
                          : isActive
                          ? 'bg-white text-slate-900'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {isComplete ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`mt-2 text-sm font-medium ${
                        isActive ? 'text-white' : 'text-slate-400'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {idx < 3 && (
                    <div
                      className={`w-24 h-1 mx-4 rounded transition-all ${
                        idx < stepIndex ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <UploadStep
                getRootProps={getRootProps}
                getInputProps={getInputProps}
                isDragActive={isDragActive}
                isProcessing={isProcessing}
              />
            </motion.div>
          )}

          {step === 'mapping' && (
            <motion.div
              key="mapping"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <MappingStep
                file={file}
                parsedColumns={parsedColumns}
                selectedProperty={selectedProperty}
                onPropertySelect={setSelectedProperty}
                onColumnMapping={handleColumnMapping}
                onStartImport={startImport}
              />
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ProcessingStep progress={progress} />
            </motion.div>
          )}

          {step === 'complete' && importSummary && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CompleteStep summary={importSummary} router={router} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// =====================================================
// SUB-COMPONENTS
// =====================================================

function UploadStep({ getRootProps, getInputProps, isDragActive, isProcessing }: any) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl p-12">
      <div
        {...getRootProps()}
        className={`border-4 border-dashed rounded-xl p-16 text-center transition-all cursor-pointer ${
          isDragActive
            ? 'border-emerald-400 bg-emerald-500/10'
            : 'border-slate-600 hover:border-emerald-500 hover:bg-slate-700/30'
        }`}
      >
        <input {...getInputProps()} />
        <motion.div
          animate={{
            scale: isDragActive ? 1.1 : 1,
            rotate: isDragActive ? 5 : 0,
          }}
          className="inline-block mb-6"
        >
          {isProcessing ? (
            <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <FileSpreadsheet className="w-20 h-20 text-emerald-400" />
          )}
        </motion.div>

        <h3 className="text-2xl font-bold text-white mb-2">
          {isDragActive ? 'Drop it like it\'s hot 🔥' : 'Drag & drop your rent roll'}
        </h3>
        <p className="text-slate-400 mb-6">
          or click to browse • CSV, XLS, XLSX • Max 10 MB
        </p>

        <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors">
          <Upload className="w-5 h-5" />
          Choose File
        </div>
      </div>

      {/* Example Format */}
      <div className="mt-8 p-6 bg-slate-700/30 rounded-xl">
        <h4 className="text-sm font-semibold text-slate-300 mb-3">
          📋 Expected Columns (we'll auto-detect these)
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {['Tenant Name', 'Unit Number', 'Move-In Date', 'Monthly Rent', 'Annual Income', 'Recert Date', 'Email', 'Phone'].map(
            col => (
              <div key={col} className="px-3 py-2 bg-slate-800 rounded text-slate-300 text-center">
                {col}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function MappingStep({
  file,
  parsedColumns,
  selectedProperty,
  onPropertySelect,
  onColumnMapping,
  onStartImport,
}: any) {
  const dbFields = [
    { value: 'tenant_name', label: 'Tenant Name', required: true },
    { value: 'unit_number', label: 'Unit Number', required: true },
    { value: 'move_in_date', label: 'Move-In Date', required: false },
    { value: 'monthly_rent', label: 'Monthly Rent', required: false },
    { value: 'annual_income', label: 'Annual Income', required: false },
    { value: 'recertification_date', label: 'Recertification Date', required: false },
    { value: 'subsidy_amount', label: 'Subsidy Amount', required: false },
    { value: 'email', label: 'Email', required: false },
    { value: 'phone', label: 'Phone', required: false },
    { value: null, label: '-- Skip this column --', required: false },
  ];

  const requiredFieldsMapped = parsedColumns
    .filter(col => col.isRequired)
    .every(col => col.dbField !== null);

  return (
    <div className="space-y-6">
      {/* File Info */}
      <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <FileSpreadsheet className="w-12 h-12 text-emerald-400" />
          <div>
            <h3 className="text-xl font-bold text-white">{file?.name}</h3>
            <p className="text-slate-400">
              {(file?.size / 1024).toFixed(1)} KB • {parsedColumns.length} columns detected
            </p>
          </div>
        </div>
      </div>

      {/* Property Selection */}
      <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-6">
        <label className="block text-sm font-semibold text-slate-300 mb-3">
          Import to Property *
        </label>
        <select
          value={selectedProperty}
          onChange={e => onPropertySelect(e.target.value)}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          <option value="">Select a property...</option>
          <option value="new">+ Create New Property</option>
          {/* TODO: Fetch properties from API */}
          <option value="prop-1">Example Property #1</option>
          <option value="prop-2">Example Property #2</option>
        </select>
      </div>

      {/* Column Mapping */}
      <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-6">Map Your Columns</h3>

        <div className="space-y-4">
          {parsedColumns.map(col => (
            <div
              key={col.csvHeader}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-slate-300">
                    {col.csvHeader}
                  </span>
                  {col.isRequired && (
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">
                      Required
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <p>Sample: {col.sampleData.slice(0, 3).join(', ')}</p>
                </div>
              </div>

              <div>
                <select
                  value={col.dbField || ''}
                  onChange={e => onColumnMapping(col.csvHeader, e.target.value || null)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-500"
                >
                  {dbFields.map(field => (
                    <option key={field.value || 'skip'} value={field.value || ''}>
                      {field.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
        >
          ← Start Over
        </button>

        <button
          onClick={onStartImport}
          disabled={!requiredFieldsMapped || !selectedProperty}
          className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
        >
          Import {parsedColumns.length} Tenants →
        </button>
      </div>
    </div>
  );
}

function ProcessingStep({ progress }: { progress: number }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl p-12 text-center">
      <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
      
      <h3 className="text-2xl font-bold text-white mb-2">
        Processing your rent roll...
      </h3>
      <p className="text-slate-400 mb-8">
        Creating units, importing tenants, and initializing ledger entries
      </p>

      <div className="max-w-md mx-auto">
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-sm text-slate-400 mt-2">{progress}% complete</p>
      </div>
    </div>
  );
}

function CompleteStep({ summary, router }: { summary: ImportSummary; router: any }) {
  const downloadErrorReport = () => {
    const csv = [
      ['Row', 'Field', 'Value', 'Error'],
      ...summary.errors.map(err => [err.row, err.field, err.value, err.error]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'import-errors.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Success Card */}
      <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl p-8 text-center">
        <CheckCircle className="w-16 h-16 text-white mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-white mb-2">
          Import Complete! 🎉
        </h2>
        <p className="text-white/80">
          Your rent roll has been successfully imported
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-6 text-center">
          <div className="text-4xl font-bold text-emerald-400 mb-2">
            {summary.successfulRows}
          </div>
          <div className="text-slate-300">Tenants Imported</div>
        </div>

        {summary.warningRows > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-yellow-400 mb-2">
              {summary.warningRows}
            </div>
            <div className="text-slate-300">Warnings</div>
          </div>
        )}

        {summary.failedRows > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-red-400 mb-2">
              {summary.failedRows}
            </div>
            <div className="text-slate-300">Rows Skipped</div>
          </div>
        )}
      </div>

      {/* Error Report */}
      {summary.errors.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              Issues Detected
            </h3>
            <button
              onClick={downloadErrorReport}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Report
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {summary.errors.slice(0, 10).map((err, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-900/50 rounded-lg border border-slate-700"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      err.severity === 'error'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    Row {err.row}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-slate-300">
                      <span className="font-semibold">{err.field}:</span> {err.error}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Value: {err.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
        >
          View Dashboard →
        </button>

        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
        >
          Import Another File
        </button>
      </div>
    </div>
  );
}
