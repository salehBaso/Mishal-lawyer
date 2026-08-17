'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { requestDocumentUploadAction, confirmDocumentUploadAction } from '@/lib/actions/documents';
import { ALLOWED_MIME_TYPES, MAX_UPLOAD_SIZE_BYTES } from '@/lib/validation/document';

interface DocumentUploadButtonProps {
  title: string;
  caseId?: string;
  documentId?: string; // مرّرها عند رفع نسخة لمستند "مطلوب" موجود مسبقًا
  onUploaded?: () => void;
  label?: string;
}

export function DocumentUploadButton({ title, caseId, documentId, onUploaded, label }: DocumentUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // يسمح باختيار نفس الملف مرة أخرى لاحقًا
    if (!file) return;

    if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
      toast.error('نوع الملف غير مدعوم. الأنواع المسموح بها: PDF، صور، Word، Excel.');
      return;
    }
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      toast.error(`حجم الملف يتجاوز الحد الأقصى (${MAX_UPLOAD_SIZE_BYTES / (1024 * 1024)}MB).`);
      return;
    }

    setIsUploading(true);
    try {
      const { documentId: docId, uploadUrl } = await requestDocumentUploadAction({
        caseId,
        documentId,
        title,
        fileName: file.name,
        mimeType: file.type as (typeof ALLOWED_MIME_TYPES)[number],
        sizeBytes: file.size,
      });

      const putResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!putResponse.ok) {
        throw new Error('فشل رفع الملف إلى مساحة التخزين');
      }

      await confirmDocumentUploadAction(docId);
      toast.success('تم استلام المستند بنجاح');
      onUploaded?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ أثناء رفع المستند');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept={ALLOWED_MIME_TYPES.join(',')}
      />
      <Button size="sm" variant="gold" disabled={isUploading} onClick={() => inputRef.current?.click()}>
        <UploadCloud className="h-4 w-4" strokeWidth={1.75} />
        {isUploading ? 'جارٍ الرفع…' : (label ?? 'رفع المستند')}
      </Button>
    </>
  );
}
