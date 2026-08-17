/**
 * Seed Data — بيانات وهمية بالكامل لأغراض التطوير والعرض التقديمي فقط.
 * لا تحتوي على أي بيانات حقيقية لأي شخص أو شركة أو قضية.
 *
 * التشغيل: npm run db:seed
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { PERMISSIONS, ROLE_LABELS, ROLE_PERMISSIONS, type RoleName } from '../src/lib/rbac/permissions';
import { PRACTICE_AREAS } from '../src/lib/constants/practice-areas';

const prisma = new PrismaClient();
const DEFAULT_PASSWORD = 'Password123!';

async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 10);
}

const LAWYER_NAMES = [
  'مشعل الجهني',
  'نورة العتيبي',
  'فيصل الدوسري',
  'سارة القحطاني',
  'عبدالله الشهري',
];

const CLIENT_INDIVIDUAL_NAMES = [
  'أحمد الغامدي', 'خالد المطيري', 'محمد الحربي', 'عبدالعزيز الزهراني', 'سلطان العنزي',
  'ريم الشمري', 'هند البقمي', 'منى السبيعي', 'لمى الرشيدي', 'جواهر العمري',
];

const CLIENT_COMPANY_NAMES = [
  'شركة النخبة للتجارة', 'مؤسسة الريادة العقارية', 'مجموعة الأفق للاستثمار',
  'شركة الواحة للمقاولات', 'مؤسسة البيان للخدمات اللوجستية', 'شركة درة الخليج التجارية',
  'مجموعة سنابل القابضة', 'شركة المسار الصناعية', 'مؤسسة الفارس للتطوير العقاري',
  'شركة رواد الأعمال التقنية',
];

const SERVICE_PROVIDER_NAMES = [
  { name: 'مكتب الدقة للترجمة القانونية', category: 'LEGAL_TRANSLATION' as const },
  { name: 'مكتب الثقة للمحاسبة والمراجعة', category: 'ACCOUNTING' as const },
  { name: 'عبدالرحمن السالم — خبير مالي', category: 'FINANCIAL_EXPERT' as const },
  { name: 'مكتب الأصالة للتقييم العقاري', category: 'REAL_ESTATE_VALUATION' as const },
  { name: 'م. سعود القرني — خبير هندسي', category: 'ENGINEERING_EXPERT' as const },
  { name: 'مؤسسة التقنية الرقمية للخبرة الفنية', category: 'TECHNICAL_EXPERT' as const },
  { name: 'مختبر الأدلة الرقمية المعتمد', category: 'DIGITAL_FORENSICS' as const },
  { name: 'مركز الباحث للدراسات القانونية', category: 'RESEARCH' as const },
  { name: 'مكتب المساح الوطني', category: 'SURVEYING' as const },
  { name: 'استشارات متعددة التخصصات', category: 'OTHER' as const },
];

const CASE_TITLE_TEMPLATES = [
  'نزاع عقد توريد', 'مطالبة مالية بتأخر تسليم', 'دعوى فسخ عقد إيجار', 'نزاع شراكة تجارية',
  'مطالبة تعويض أضرار عقدية', 'دعوى عمالية — إنهاء خدمات', 'نزاع ملكية فكرية', 'تحكيم تجاري دولي',
  'دعوى إخلاء عقاري', 'مطالبة بفسخ اتفاقية استثمار',
];

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length]!;
}

async function main() {
  console.log('🌱 بدء تعبئة البيانات التجريبية...');

  // ------------------------------------------------------------ RBAC setup
  const permissionRecords = new Map<string, string>();
  const allPermissionKeys = Array.from(new Set(Object.values(PERMISSIONS)));
  for (const key of allPermissionKeys) {
    if (key === '*') continue;
    const [resource, action] = key.split('.');
    const perm = await prisma.permission.upsert({
      where: { resource_action: { resource: resource ?? key, action: action ?? 'manage' } },
      update: {},
      create: { resource: resource ?? key, action: action ?? 'manage', label: key },
    });
    permissionRecords.set(key, perm.id);
  }

  const roleRecords = new Map<RoleName, string>();
  for (const roleName of Object.keys(ROLE_LABELS) as RoleName[]) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
        label: ROLE_LABELS[roleName].en,
        labelAr: ROLE_LABELS[roleName].ar,
        isSystem: true,
      },
    });
    roleRecords.set(roleName, role.id);

    const perms = ROLE_PERMISSIONS[roleName];
    if (!perms.includes('*')) {
      for (const p of perms) {
        const permId = permissionRecords.get(p);
        if (!permId) continue;
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: permId } },
          update: {},
          create: { roleId: role.id, permissionId: permId },
        });
      }
    }
  }

  // -------------------------------------------------------------- Org
  const org = await prisma.organization.upsert({
    where: { slug: 'mishal-al-juhani' },
    update: {},
    create: {
      name: 'Mishal Al-Juhani Law Firm',
      nameAr: 'شركة مشعل الجهني للمحاماة والاستشارات',
      slug: 'mishal-al-juhani',
      plan: 'FIRM',
    },
  });

  // ------------------------------------------------------- Practice Areas
  const practiceAreaRecords = [];
  for (let i = 0; i < PRACTICE_AREAS.length; i++) {
    const pa = PRACTICE_AREAS[i]!;
    const rec = await prisma.practiceArea.upsert({
      where: { organizationId_key: { organizationId: org.id, key: pa.key } },
      update: {},
      create: {
        organizationId: org.id,
        key: pa.key,
        name: pa.name,
        nameAr: pa.nameAr,
        icon: pa.icon,
        sortOrder: i,
      },
    });
    practiceAreaRecords.push(rec);
  }

  const passwordHash = await hashPassword(DEFAULT_PASSWORD);

  // -------------------------------------------------------------- Users
  async function createUser(opts: {
    email: string;
    fullName: string;
    fullNameAr: string;
    role: RoleName;
  }) {
    return prisma.user.upsert({
      where: { email: opts.email },
      update: {},
      create: {
        organizationId: org.id,
        roleId: roleRecords.get(opts.role)!,
        email: opts.email,
        fullName: opts.fullName,
        fullNameAr: opts.fullNameAr,
        passwordHash,
        status: 'ACTIVE',
      },
    });
  }

  const superAdmin = await createUser({
    email: 'admin@mishal-legal.sa', fullName: 'System Admin', fullNameAr: 'مدير النظام', role: 'SUPER_ADMIN',
  });
  const firmAdmin = await createUser({
    email: 'firm-admin@mishal-legal.sa', fullName: 'Mishal Al-Juhani', fullNameAr: 'مشعل الجهني', role: 'FIRM_ADMIN',
  });
  const managingPartner = await createUser({
    email: 'partner@mishal-legal.sa', fullName: 'Noura Al-Otaibi', fullNameAr: 'نورة العتيبي', role: 'MANAGING_PARTNER',
  });

  const lawyers = [];
  for (let i = 0; i < LAWYER_NAMES.length; i++) {
    const name = LAWYER_NAMES[i]!;
    const user = await createUser({
      email: i === 0 ? 'lawyer@mishal-legal.sa' : `lawyer${i + 1}@mishal-legal.sa`,
      fullName: name,
      fullNameAr: name,
      role: 'LAWYER',
    });
    const lawyer = await prisma.lawyer.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        title: i === 0 ? 'الشريك المؤسس' : 'محامٍ أول',
        specializations: [pick(PRACTICE_AREAS, i).key],
        yearsOfExperience: 5 + i * 3,
        hourlyRate: 400 + i * 50,
      },
    });
    lawyers.push({ user, lawyer });
  }

  const researcher = await createUser({
    email: 'researcher@mishal-legal.sa', fullName: 'Legal Researcher', fullNameAr: 'باحث قانوني', role: 'LEGAL_RESEARCHER',
  });
  const coordinator = await createUser({
    email: 'coordinator@mishal-legal.sa', fullName: 'Case Coordinator', fullNameAr: 'منسّق القضايا', role: 'CASE_COORDINATOR',
  });
  const accountant = await createUser({
    email: 'accountant@mishal-legal.sa', fullName: 'Accountant', fullNameAr: 'المحاسب', role: 'ACCOUNTANT',
  });
  const externalExpert = await createUser({
    email: 'expert@mishal-legal.sa', fullName: 'External Expert', fullNameAr: 'خبير خارجي', role: 'EXTERNAL_EXPERT',
  });
  const readOnly = await createUser({
    email: 'readonly@mishal-legal.sa', fullName: 'Read Only User', fullNameAr: 'مستخدم اطّلاع', role: 'READ_ONLY',
  });

  // ------------------------------------------------------------ Clients
  const clients = [];
  for (let i = 0; i < 20; i++) {
    const isCorporate = i % 2 === 0;
    const name = isCorporate ? pick(CLIENT_COMPANY_NAMES, i) : pick(CLIENT_INDIVIDUAL_NAMES, i);
    const email = `client${i + 1}@example-clients.sa`;

    // أول عميل فقط يحصل على حساب دخول للبوابة (لتجربة تسجيل الدخول التجريبي)
    const linkedUser =
      i === 0
        ? await createUser({ email: 'client@mishal-legal.sa', fullName: name, fullNameAr: name, role: 'CLIENT' })
        : null;

    const client = await prisma.client.create({
      data: {
        organizationId: org.id,
        userId: linkedUser?.id,
        type: isCorporate ? 'CORPORATE' : 'INDIVIDUAL',
        fullName: isCorporate ? `ممثل ${name}` : name,
        companyName: isCorporate ? name : null,
        email,
        phone: `05${String(10000000 + i * 137).slice(0, 8)}`,
      },
    });
    clients.push(client);
  }

  // ------------------------------------------------------ Marketplace
  const providers = [];
  for (let i = 0; i < SERVICE_PROVIDER_NAMES.length; i++) {
    const p = SERVICE_PROVIDER_NAMES[i]!;
    const user = await createUser({
      email: `provider${i + 1}@marketplace-partners.sa`,
      fullName: p.name,
      fullNameAr: p.name,
      role: 'SERVICE_PROVIDER',
    });
    const provider = await prisma.marketplaceProvider.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        displayName: p.name,
        category: p.category,
        specialization: p.name,
        bio: `مقدّم خدمة معتمد في مجال ${p.category} — بيانات تجريبية.`,
        yearsExperience: 4 + i,
        verification: 'VERIFIED',
        ratingAvg: (3.8 + (i % 5) * 0.25).toFixed(2),
        ratingCount: 8 + i * 3,
      },
    });
    const service = await prisma.marketplaceService.create({
      data: {
        providerId: provider.id,
        title: `خدمة ${p.category} الأساسية`,
        description: 'وصف تجريبي للخدمة المقدَّمة عبر السوق القانوني.',
        priceFrom: 500 + i * 100,
      },
    });
    providers.push({ provider, service });
  }

  // ----------------------------------------------------------- Cases
  const statuses = ['ACTIVE', 'ACTIVE', 'IN_COURT', 'ON_HOLD', 'SETTLEMENT', 'CLOSED_WON', 'CLOSED_LOST', 'CLOSED_SETTLED', 'INTAKE', 'ACTIVE'] as const;
  const riskLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

  let docCounter = 0;
  let hearingCounter = 0;
  let invoiceCounter = 0;

  for (let i = 0; i < 30; i++) {
    const lawyerAssignment = pick(lawyers, i);
    const client = pick(clients, i);
    const practiceArea = pick(practiceAreaRecords, i);
    const status = pick(statuses, i);
    const isClosed = status.startsWith('CLOSED');

    const openedAt = new Date(2025, i % 12, 1 + (i % 20));
    const closedAt = isClosed ? new Date(openedAt.getTime() + (30 + i) * 86400000) : null;

    const caseRecord = await prisma.case.create({
      data: {
        organizationId: org.id,
        caseNumber: `2026-${String(100 + i)}`,
        title: `${pick(CASE_TITLE_TEMPLATES, i)} — ${client.companyName ?? client.fullName}`,
        practiceAreaId: practiceArea.id,
        status,
        riskLevel: pick(riskLevels, i),
        strengthScore: 40 + ((i * 7) % 55),
        courtName: 'المحكمة التجارية بالرياض',
        claimAmount: 50000 + i * 15000,
        openedAt,
        closedAt,
      },
    });

    await prisma.caseParty.create({
      data: { caseId: caseRecord.id, clientId: client.id, role: 'CLIENT', name: client.companyName ?? client.fullName },
    });
    await prisma.caseParty.create({
      data: { caseId: caseRecord.id, role: 'OPPOSING_PARTY', name: pick(CLIENT_COMPANY_NAMES, i + 3) },
    });

    await prisma.caseAssignment.create({
      data: {
        caseId: caseRecord.id,
        userId: lawyerAssignment.user.id,
        lawyerId: lawyerAssignment.lawyer.id,
        role: 'Lead Lawyer',
      },
    });
    // منسّق القضايا مُخوَّل أيضًا على نصف القضايا
    if (i % 2 === 0) {
      await prisma.caseAssignment.create({
        data: { caseId: caseRecord.id, userId: coordinator.id, role: 'Coordinator' },
      });
    }

    // Tasks (1-2 لكل قضية)
    await prisma.caseTask.create({
      data: {
        caseId: caseRecord.id,
        title: 'مراجعة المستندات المرفوعة وتحديث الحالة',
        assigneeId: lawyerAssignment.user.id,
        createdById: firmAdmin.id,
        priority: i % 4 === 0 ? 'URGENT' : i % 3 === 0 ? 'HIGH' : 'NORMAL',
        status: isClosed ? 'DONE' : i % 5 === 0 ? 'IN_PROGRESS' : 'TODO',
        dueAt: new Date(Date.now() + (i % 10 - 3) * 86400000),
      },
    });

    // Timeline events
    await prisma.caseTimelineEvent.createMany({
      data: [
        { caseId: caseRecord.id, type: 'contract', title: 'توقيع العقد الأساسي', occurredAt: openedAt },
        {
          caseId: caseRecord.id,
          type: 'claim',
          title: 'تقديم المطالبة الرسمية',
          occurredAt: new Date(openedAt.getTime() + 10 * 86400000),
        },
      ],
    });

    // Documents (نوزّع 50 مستندًا على القضايا الثلاثين)
    const docsForThisCase = i < 20 ? 2 : 1; // 20*2 + 10*1 = 50
    for (let d = 0; d < docsForThisCase; d++) {
      docCounter++;
      const doc = await prisma.document.create({
        data: {
          organizationId: org.id,
          caseId: caseRecord.id,
          title: d === 0 ? 'العقد الموقّع' : 'كشف حساب بنكي',
          status: d === 0 ? 'APPROVED' : i % 4 === 0 ? 'REQUIRED' : 'SUBMITTED',
          isRequired: d !== 0 && i % 4 === 0,
          uploadedById: lawyerAssignment.user.id,
        },
      });
      await prisma.documentVersion.create({
        data: {
          documentId: doc.id,
          versionNumber: 1,
          storageKey: `orgs/${org.id}/cases/${caseRecord.id}/seed-doc-${docCounter}.pdf`,
          fileName: `مستند-${docCounter}.pdf`,
          mimeType: 'application/pdf',
          sizeBytes: 200_000 + docCounter * 1000,
          uploadedById: lawyerAssignment.user.id,
        },
      });
    }

    // Hearings (نوزّع 10 جلسات على أول 10 قضايا نشطة)
    if (hearingCounter < 10 && !isClosed) {
      hearingCounter++;
      const hearing = await prisma.hearing.create({
        data: {
          caseId: caseRecord.id,
          courtName: 'المحكمة التجارية بالرياض',
          location: 'قاعة رقم 3',
          scheduledAt: new Date(Date.now() + hearingCounter * 3 * 86400000),
          status: 'SCHEDULED',
        },
      });
      await prisma.hearingAttendee.create({ data: { hearingId: hearing.id, userId: lawyerAssignment.user.id } });
    }

    // Invoices (نوزّع 20 فاتورة على أول 20 قضية)
    if (invoiceCounter < 20) {
      invoiceCounter++;
      const subtotal = 8000 + invoiceCounter * 750;
      const vat = Math.round(subtotal * 0.15);
      await prisma.invoice.create({
        data: {
          organizationId: org.id,
          caseId: caseRecord.id,
          clientId: client.id,
          invoiceNumber: `INV-2026-${String(1000 + invoiceCounter)}`,
          status: invoiceCounter % 5 === 0 ? 'OVERDUE' : invoiceCounter % 3 === 0 ? 'PAID' : 'SENT',
          lineItems: [{ description: 'أتعاب قانونية', quantity: 1, unitPrice: subtotal }],
          subtotal,
          vatAmount: vat,
          totalAmount: subtotal + vat,
          dueDate: new Date(Date.now() + 14 * 86400000),
          issuedAt: new Date(),
        },
      });
    }
  }

  // ------------------------------------------------------- Integrations
  const integrationKinds = [
    'NAJIZ', 'PAYMENT_MOYASAR', 'PAYMENT_HYPERPAY', 'PAYMENT_TAP', 'PAYMENT_STRIPE',
    'AI_ANTHROPIC', 'AI_OPENAI', 'EMAIL_RESEND', 'SMS', 'WHATSAPP',
  ] as const;
  for (const kind of integrationKinds) {
    await prisma.integration.upsert({
      where: { organizationId_kind: { organizationId: org.id, kind } },
      update: {},
      create: {
        organizationId: org.id,
        kind,
        status: kind === 'NAJIZ' ? 'NOT_CONFIGURED' : kind.startsWith('PAYMENT') ? 'SANDBOX' : 'NOT_CONFIGURED',
      },
    });
  }

  // ------------------------------------------------------------ Audit
  await prisma.auditLog.create({
    data: {
      organizationId: org.id,
      actorId: firmAdmin.id,
      action: 'system.seed_completed',
      entityType: 'Organization',
      entityId: org.id,
      description: 'تمت تعبئة البيانات التجريبية للمنصة بنجاح',
    },
  });

  console.log('✅ اكتملت تعبئة البيانات التجريبية بنجاح.');
  console.log(`   - ${lawyers.length} محامين، 20 عميل، 30 قضية، ${docCounter} مستند، ${hearingCounter} جلسة، ${invoiceCounter} فاتورة، ${providers.length} مقدّم خدمة.`);
}

main()
  .catch((e) => {
    console.error('❌ فشلت تعبئة البيانات:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
