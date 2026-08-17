'use client';

import { useState } from 'react';
import { inputClass } from '@/components/ui/form-field';
import { DocumentUploadButton } from './document-upload-button';

/** رفع مستند جديد غير مرتبط بمستند "مطلوب" سابقًا — يُستخدم داخل تبويب المستندات بغرفة عمليات القضية */
export function NewDocumentUploader({ caseId }: { caseId: string }) {
  const [title, setTitle] = useState('');

  return (
    <div className="flex flex-col gap-3 rounded-md border border-dashed border-neutral-300 bg-neutral-50/50 p-4 sm:flex-row sm:items-center">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="عنوان المستند (مثال: مذكرة الرد)"
        className={inputClass + ' sm:flex-1'}
      />
      <DocumentUploadButton
        title={title || 'مستند بدون عنوان'}
        caseId={caseId}
        onUploaded={() => setTitle('')}
        label="رفع مستند جديد"
      />
    </div>
  );
}
