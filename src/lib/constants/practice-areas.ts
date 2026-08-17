/**
 * مجالات الممارسة الافتراضية — تُستخدم في seed.ts وفي الصفحة التسويقية.
 * قابلة للإدارة الكاملة من لوحة Admin عبر جدول PracticeArea في قاعدة البيانات؛
 * هذه القائمة هي فقط القيم الابتدائية (Seed) وليست مصدرًا جامدًا في الكود.
 */
export const PRACTICE_AREAS = [
  { key: 'commercial', name: 'Commercial', nameAr: 'التجارية', icon: 'Briefcase' },
  { key: 'corporate', name: 'Corporate', nameAr: 'الشركات', icon: 'Building2' },
  { key: 'litigation', name: 'Litigation', nameAr: 'التقاضي', icon: 'Gavel' },
  { key: 'labor', name: 'Labor', nameAr: 'العمالية', icon: 'Users' },
  { key: 'real_estate', name: 'Real Estate', nameAr: 'العقارية', icon: 'Home' },
  { key: 'financial', name: 'Financial', nameAr: 'المالية', icon: 'Landmark' },
  { key: 'family', name: 'Family', nameAr: 'الأحوال الشخصية', icon: 'Heart' },
  { key: 'criminal', name: 'Criminal', nameAr: 'الجزائية', icon: 'Shield' },
  { key: 'administrative', name: 'Administrative', nameAr: 'الإدارية', icon: 'FileStack' },
  { key: 'intellectual_property', name: 'Intellectual Property', nameAr: 'الملكية الفكرية', icon: 'Lightbulb' },
  { key: 'contracts', name: 'Contracts', nameAr: 'العقود', icon: 'FileSignature' },
  { key: 'arbitration', name: 'Arbitration', nameAr: 'التحكيم', icon: 'Scale' },
] as const;
