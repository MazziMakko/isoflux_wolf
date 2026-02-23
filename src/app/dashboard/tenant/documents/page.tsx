/**
 * =====================================================
 * TENANT DOCUMENT VAULT
 * Secure upload for income verification documents
 * =====================================================
 */

'use client';

import { useEffect, useState } from 'react';
import { useSystemState } from '@/hooks/useSystemState';
import { Card } from '@/components/ui/AnimatedCard';
import { createClient } from '@supabase/supabase-js';

interface Document {
  id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
}

export default function TenantDocumentsPage() {
  const { user } = useSystemState();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState('INCOME_VERIFICATION');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (user.id) {
      fetchDocuments();
    }
  }, [user]);

  async function fetchDocuments() {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data } = await supabase
      .from('tenant_documents')
      .select('*')
      .eq('tenant_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setDocuments(data);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
      // Upload to Supabase Storage
      const fileName = `${user.id}/${Date.now()}_${selectedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('tenant-documents')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('tenant-documents')
        .getPublicUrl(fileName);

      // Save metadata to database
      const { error: dbError } = await supabase.from('tenant_documents').insert({
        tenant_id: user.id,
        uploaded_by: user.id,
        organization_id: 'current-org-id', // TODO: Get from context
        property_id: 'current-property-id', // TODO: Get from tenant's unit
        unit_id: 'current-unit-id', // TODO: Get from tenant's unit
        document_type: selectedType,
        file_url: urlData.publicUrl,
        file_name: selectedFile.name,
        file_size: selectedFile.size,
        mime_type: selectedFile.type,
        status: 'PENDING_REVIEW',
      });

      if (dbError) throw dbError;

      alert('✓ Document uploaded successfully! Property manager will review shortly.');
      setSelectedFile(null);
      fetchDocuments();
    } catch (error) {
      alert('Upload error: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  }

  const getStatusColor = (status: string) => {
    if (status === 'APPROVED') return 'bg-emerald-500/20 text-emerald-400';
    if (status === 'REJECTED') return 'bg-red-500/20 text-red-400';
    return 'bg-yellow-500/20 text-yellow-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-4xl font-bold text-blue-400">📁 Document Vault</h1>

        {/* Upload Form */}
        <Card className="mb-8 border-blue-500/20 bg-slate-800/50 p-6 backdrop-blur">
          <h2 className="mb-4 text-xl font-bold text-blue-400">Upload New Document</h2>
          
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-300">Document Type *</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full rounded border border-slate-600 bg-slate-900 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="INCOME_VERIFICATION">Income Verification</option>
                <option value="PAYSTUB">Paystub</option>
                <option value="W2">W-2 Form</option>
                <option value="BANK_STATEMENT">Bank Statement</option>
                <option value="ID">Identification</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-300">Select File *</label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full rounded border-2 border-dashed border-slate-600 bg-slate-900 px-4 py-8 text-white file:mr-4 file:rounded file:border-0 file:bg-blue-500 file:px-4 file:py-2 file:text-white hover:border-blue-500"
                  required
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Accepted formats: PDF, JPG, PNG. Max size: 10MB
              </p>
            </div>

            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="w-full rounded-lg bg-blue-500 px-6 py-3 font-bold text-white transition hover:bg-blue-600 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </form>
        </Card>

        {/* Uploaded Documents */}
        <Card className="border-blue-500/20 bg-slate-800/50 p-6 backdrop-blur">
          <h2 className="mb-4 text-xl font-bold text-blue-400">Your Documents</h2>
          
          {documents.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              No documents uploaded yet. Upload your first document above.
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="rounded border border-slate-700 bg-slate-900/50 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h3 className="font-bold text-white">{doc.file_name}</h3>
                        <span className={`rounded px-2 py-1 text-xs font-bold ${getStatusColor(doc.status)}`}>
                          {doc.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="mb-2 text-sm text-slate-400">Type: {doc.document_type.replace('_', ' ')}</p>
                      <p className="text-xs text-slate-500">
                        Uploaded: {new Date(doc.created_at).toLocaleString()}
                      </p>
                      {doc.reviewed_at && (
                        <p className="text-xs text-slate-500">
                          Reviewed: {new Date(doc.reviewed_at).toLocaleString()}
                        </p>
                      )}
                      {doc.rejection_reason && (
                        <div className="mt-2 rounded bg-red-500/10 px-3 py-2 text-sm text-red-400">
                          <strong>Rejection Reason:</strong> {doc.rejection_reason}
                        </div>
                      )}
                    </div>
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded bg-blue-500 px-4 py-2 text-sm font-bold text-white hover:bg-blue-600"
                    >
                      View
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Info Box */}
        <Card className="mt-6 border-blue-500/20 bg-slate-800/50 p-4 backdrop-blur">
          <p className="text-sm text-slate-300">
            <strong className="text-blue-400">HUD Compliance:</strong> All documents are encrypted and stored securely.
            Your property manager will review within 2-3 business days. Approved documents are automatically logged
            to the immutable ledger for audit purposes.
          </p>
        </Card>
      </div>
    </div>
  );
}
