# شركة مشعل الجهني للمحاماة والاستشارات — منصة LegalTech

منصة قانونية رقمية متكاملة (Multi-Tenant Ready) لمكتب محاماة رفيع المستوى: بوابة عملاء،
غرفة عمليات قضايا (Case War Room)، ذكاء اصطناعي مساعد للمحامي، سوق خدمات قانونية،
فوترة ومدفوعات، وبنية جاهزة للتكامل مع منصة **ناجز**.

> **حالة المشروع**: أساس معماري (Foundation) + المرحلة الثانية (نماذج الإنشاء الفعلية)
> كاملان وقابلان للتشغيل — Design System، قاعدة بيانات، RBAC، Auth، Dashboards لكل
> الأدوار، Case War Room، AI Adapter، Payment Adapter، Najiz Adapter، Marketplace،
> Billing، Audit Log، Seed Data واقعية، **ونماذج إنشاء حقيقية** (قضية، عميل، مهمة،
> جلسة، فاتورة، طلب خدمة سوق) مع Server Actions مُتحقَّق منها بـ Zod ومربوطة بـ RBAC
> وAudit Log والإشعارات. ما تبقّى (تعديل/حذف الكيانات، الربط الفعلي بمزوّدات خارجية
> حقيقية) مؤشَّر بوضوح بـ `TODO` في الكود بدل محاكاته وهميًا.

---

## ⚠️ ملاحظة تنفيذية مهمة

تم بناء هذا المشروع بالكامل كملفات مصدر حقيقية داخل بيئة عمل سحابية **لا تملك وصولًا
لسجلّات الحزم (npm/pypi)** بسبب سياسة شبكة معزولة. نتيجة لذلك:

- **لم يتم تشغيل `npm install` أو `npm run build` أو `npm run dev` فعليًا** في بيئة البناء.
- تم التحقق من **صحة بنية الكود (Syntax)** لكل ملفات TypeScript/TSX الـ 95 عبر
  parser فعلي من حزمة `typescript` (صفر أخطاء)، وتم فحص تطابق كل الـ imports الداخلية
  (`@/...`) مع الملفات الفعلية عبر الـ 107 ملف، وتم مراجعة يدوية دقيقة لعلاقات Prisma
  Schema (30 نموذجًا) وتطابق كل قيم الـ enums المستخدمة في النماذج الجديدة.
- **الخطوة التالية المطلوبة منك**: نفّذ `npm install` ثم `npm run dev` على جهازك أو
  بيئة CI تملك اتصالًا طبيعيًا بالإنترنت (راجع قسم "التثبيت" أدناه). إن ظهرت أي أخطاء
  Type-checking بسبب فروقات نسخ الحزم، أرسلها لي وسأصلحها فورًا.

---

## 1) البنية المعمارية (Architecture)

```
Frontend (Next.js App Router, RSC + Client Components)
        │
        ├── Server Actions / Route Handlers (طبقة API)
        │        │
        │        ├── RBAC Layer  (src/lib/rbac)      ← تحقق صلاحيات ملزِم قبل أي عملية
        │        ├── Audit Layer (src/lib/audit)      ← تسجيل كل إجراء حسّاس
        │        └── Prisma ORM  (src/lib/db)         ← PostgreSQL (Multi-Tenant)
        │
        ├── Adapters (src/lib/adapters) — قابلة للاستبدال بالكامل:
        │        ├── payment/   (Moyasar | HyperPay | Tap | Stripe)
        │        ├── najiz/     (Najiz Developers API — Sandbox أولاً)
        │        ├── ai/        (Anthropic | OpenAI | Mock)
        │        ├── storage/   (S3-compatible: AWS S3 | Spaces | R2)
        │        └── notifications/ (In-App | Email | SMS | WhatsApp)
        │
        └── Auth (Auth.js v5) — JWT Sessions + RBAC Claims
```

**لماذا Next.js + TypeScript + PostgreSQL + Prisma؟**
مكدّس ناضج وواسع الانتشار في السعودية والخليج، يدعم Server Components لتقليل حمل
JavaScript على المتصفح (مهم لتجربة "فاخرة وسريعة")، ويسمح بفصل حقيقي بين طبقات
Frontend/Backend عبر Server Actions مع بقاء المشروع Monorepo واحد سهل النشر. Prisma
يمنح Type Safety كاملة من قاعدة البيانات حتى الواجهة، وهو ما يقلل أخطاء الإنتاج في نظام
يحتوي بيانات قانونية حساسة.

### مبدأ الـ Adapters
كل تكامل خارجي (دفع، ناجز، AI، تخزين، إشعارات) مبني خلف **Interface** موحّد
(`src/lib/adapters/*/types.ts`). لإضافة مزود جديد: أنشئ ملفًا يطبّق نفس الـ Interface،
وسجّله في الـ Factory (`index.ts`) — بقية النظام لا يتغيّر إطلاقًا. هذا ما يجعل المنصة
قابلة للتحول إلى SaaS متعدد المستأجرين لاحقًا دون إعادة هيكلة.

---

## 2) التثبيت (Installation)

### المتطلبات
- Node.js 20+
- Docker (لتشغيل PostgreSQL و Redis محليًا بسرعة) — أو استخدم قواعد بيانات سحابية جاهزة.

### الخطوات

```bash
# 1) تثبيت الحزم
npm install

# 2) تشغيل قاعدة البيانات و Redis محليًا (اختياري إن كان لديك DB جاهزة)
docker compose up -d

# 3) نسخ متغيرات البيئة
cp .env.example .env.local
# ثم عدّل DATABASE_URL وباقي القيم حسب بيئتك

# 4) توليد Prisma Client وتطبيق المخطط على القاعدة
npm run db:generate
npm run db:migrate

# 5) تعبئة بيانات تجريبية واقعية (5 محامين، 20 عميل، 30 قضية...)
npm run db:seed

# 6) تشغيل بيئة التطوير
npm run dev
```

افتح `http://localhost:3000`. للدخول إلى البوابة استخدم بيانات الدخول التجريبية
الظاهرة أسفل نموذج تسجيل الدخول (بعد تشغيل `db:seed`)، مثل:
`lawyer@mishal-legal.sa` / `Password123!`.

### أوامر مفيدة أخرى
| الأمر | الوصف |
|---|---|
| `npm run typecheck` | فحص TypeScript الكامل |
| `npm run lint` | فحص ESLint |
| `npm run db:studio` | واجهة Prisma Studio لاستعراض البيانات |
| `npm run build` | بناء نسخة الإنتاج |

---

## 3) متغيرات البيئة (Environment Variables)

راجع `.env.example` للقائمة الكاملة الموثّقة بالعربية. الفئات الرئيسية:

- **App**: رابط التطبيق، الاسم.
- **Database**: `DATABASE_URL` (PostgreSQL).
- **Auth**: `AUTH_SECRET` (ولّده عبر `openssl rand -base64 32`)، إعدادات MFA.
- **Redis**: للجلسات المؤقتة، Rate Limiting، ولاحقًا Background Jobs.
- **Storage**: بيانات اعتماد S3-compatible + مدة صلاحية الروابط الموقّعة.
- **Payments**: `PAYMENT_PROVIDER` + مفاتيح المزود المختار فقط (Server-Side حصرًا).
- **Najiz**: بيانات اعتماد Sandbox — **لا تُفعَّل production إلا بعد اعتماد رسمي**.
- **AI**: `AI_PROVIDER=mock` افتراضيًا (يعمل بدون أي مفتاح)، بدّلها إلى `anthropic` عند توفر `ANTHROPIC_API_KEY`.
- **Notifications**: مزودات البريد/الرسائل/واتساب.

**لا تضع أي Secret داخل الكود مطلقًا** — كل القيم الحساسة تُقرأ من `process.env` فقط،
و`.env*` مستثناة من Git عبر `.gitignore`.

---

## 4) قاعدة البيانات (Database)

`prisma/schema.prisma` يحتوي 30 نموذجًا تغطي: المؤسسات (Multi-Tenant)، RBAC
(Role/Permission/RolePermission منفصلة عن enum جامد)، المستخدمين والمحامين والعملاء،
القضايا وأطرافها ومهامها وخطها الزمني، المستندات وإصداراتها، الجلسات، المحادثات،
الفواتير والمدفوعات، السوق القانوني (مزوّدون/خدمات/طلبات/تقييمات)، تحليلات AI،
التكاملات، وسجل التدقيق.

**مبدأ عزل بيانات العميل**: لا يوجد وصول ضمني لأي قضية. الوصول يُمنح صراحة عبر
`CaseAssignment` (للمحامين/المنسّقين) أو `CaseParty` (للعملاء)، ويُفرض عزل المؤسسة
(Multi-Tenant) في كل استعلام عبر `organizationId`.

لتعديل المخطط: عدّل `schema.prisma` ثم `npm run db:migrate` لإنشاء migration جديدة.

---

## 5) الأدوار والصلاحيات (Roles & RBAC)

مصدر الحقيقة: `src/lib/rbac/permissions.ts`. 11 دورًا:

| الدور | نطاق الرؤية الأساسي |
|---|---|
| Super Admin | كل شيء (`*`) |
| Firm Admin | كل بيانات المؤسسة + الإدارة والتكاملات |
| Managing Partner | رؤية شاملة للقضايا والمالية، بدون إدارة مستخدمين |
| Lawyer | القضايا المُسندة إليه فقط |
| Legal Researcher | القضايا المُسندة + بحث قانوني |
| Case Coordinator | القضايا المُسندة + تنسيق مستندات/سوق |
| Accountant | المالية فقط — بدون مستندات قانونية إلا بتخويل صريح |
| Client | قضاياه فقط (عزل كامل عن عملاء آخرين) |
| Service Provider | طلباته الخاصة في السوق فقط |
| External Expert | القضايا المُسندة إليه فقط (اطّلاع بالأساس) |
| Read Only | اطّلاع فقط على ما لديه صلاحية له |

**قاعدة أمنية أساسية**: إخفاء عنصر واجهة **ليس** إجراءً أمنيًا كافيًا. كل Server Action
يستدعي `assertPermission()` و`assertSameOrganization()` من `src/lib/rbac/can.ts` بشكل
صريح قبل أي عملية على البيانات.

---

## 6) التكاملات (Integrations)

| التكامل | الحالة | ملاحظات |
|---|---|---|
| **Najiz** | بنية جاهزة (`src/lib/adapters/najiz`) | يتطلب اعتمادًا رسميًا وتوثيق API من ناجز — كل دالة `TODO` صريح حتى توفره. **لا Scraping ولا Automation إطلاقًا.** |
| **Moyasar** (دفع) | Adapter جاهز، يتطلب Merchant Account | Sandbox أولاً |
| **HyperPay / Tap / Stripe** | عقد Interface جاهز، التنفيذ TODO | أضف ملفًا في `src/lib/adapters/payment/` |
| **AI (Anthropic/OpenAI)** | `mock` يعمل فورًا بدون مفاتيح | فعّل `AI_PROVIDER=anthropic` + `ANTHROPIC_API_KEY` للاتصال الحقيقي |
| **Resend (بريد)** | جاهز للربط | يتطلب `RESEND_API_KEY` |
| **SMS / WhatsApp** | TODO | يتطلب مزودًا سعوديًا معتمدًا / WhatsApp Business API |

---

## 7) الذكاء الاصطناعي — مبدأ غير قابل للتفاوض

AI في هذه المنصة **مساعد للمحامي فقط، وليس بديلاً عنه**:

- كل تحليل يُخزَّن كسجل `AIAnalysis` بحالة `requiresHumanReview = true`.
- كل ناتج AI في الواجهة مصحوب بتنويه صريح (`AI_DISCLAIMER_AR`).
- في البحث القانوني: **لا اختراع نصوص أو أحكام** — أي نتيجة بلا مصدر موثوق تُعاد كـ
  "لم يتم العثور على مصدر موثوق كافٍ" بدل تخمين محتوى (راجع `LegalResearchResult.hasSufficientSources`).

---

## 8) الأمان (Security)

- **RBAC** حقيقي على مستوى Server Action (وليس واجهة فقط).
- **Auth.js v5** بجلسات JWT + جدول `UserSession` لإدارة الأجهزة، وبنية MFA جاهزة
  (`mfaEnabled`/`mfaSecret`) للتفعيل عبر TOTP.
- **CSRF**: محمي افتراضيًا عبر آلية Same-Origin في Server Actions الخاصة بـ Next.js.
- **Rate Limiting**: متغيرات بيئة جاهزة (`RATE_LIMIT_*`) — التطبيق الفعلي عبر Redis
  في `middleware.ts` (TODO عند التوسّع للإنتاج).
- **Signed URLs** لكل رفع/تنزيل مستند (لا روابط عامة دائمة) — `src/lib/adapters/storage`.
- **Encryption at Rest**: `ServerSideEncryption: AES256` عند الرفع لـ S3-compatible storage.
- **Encryption in Transit**: HTTPS إلزامي في الإنتاج (يُفرض عبر منصة الاستضافة).
- **Audit Log غير قابل للتعديل**: لا يوجد `update()`/`delete()` مكشوف على `AuditLog` —
  فقط `writeAuditLog()` للإنشاء.
- **Least Privilege**: كل دور يملك أضيق مجموعة صلاحيات كافية لعمله (راجع القسم 5).
- **Headers أمنية**: `X-Frame-Options`, `X-Content-Type-Options`, `Permissions-Policy`
  مضبوطة في `next.config.mjs` و`middleware.ts`.

---

## 9) النشر (Deployment)

المشروع Next.js قياسي، يمكن نشره على أي منصة تدعم Node.js (Vercel، AWS، أو خادم
مخصص). نقاط مهمة:

1. اضبط كل متغيرات البيئة في منصة الاستضافة (لا تنسخ `.env` إلى الكود).
2. شغّل `npm run db:deploy` (وليس `db:migrate`) في خط أنابيب النشر للإنتاج.
3. فعّل نسخًا احتياطية دورية لقاعدة PostgreSQL (Point-in-Time Recovery إن أمكن).
4. اضبط سياسة الاحتفاظ بالبيانات (Data Retention) حسب متطلبات النظام القانوني السعودي.
5. راجع أن `NAJIZ_ENV` و`PAYMENT_PROVIDER` مضبوطة على القيم الصحيحة قبل الانتقال
   إلى الإنتاج (Sandbox → Production فقط بعد اختبار كامل).

---

## 10) ما تمت إضافته في المرحلة الثانية (نماذج الإنشاء)

| النموذج | المسار | الصلاحية المطلوبة |
|---|---|---|
| قضية جديدة | `/cases/new` | `CASE_CREATE` |
| عميل جديد | `/clients/new` | `CLIENT_MANAGE` |
| رفع مستند (Signed URL حقيقي) | زر داخل بوابة العميل / تبويب المستندات | `DOCUMENT_UPLOAD` |
| مهمة جديدة | داخل تبويب "المهام" بغرفة عمليات القضية | `CASE_EDIT` |
| جلسة جديدة | داخل تبويب "الجلسات" بغرفة عمليات القضية | `CASE_EDIT` |
| فاتورة جديدة (ببنود متعددة) | `/billing/new` | `INVOICE_CREATE` |
| طلب خدمة من السوق | زر "طلب خدمة" بصفحة مقدّم الخدمة | `MARKETPLACE_REQUEST_SERVICE` |

كل نموذج: يتحقق بـ Zod، محمي بـ RBAC صريح Server-Side، يسجّل Audit Log، ويرسل إشعارًا
داخليًا للطرف المعني عند الحاجة (نمط `useFormState`/`useFormStatus` من React لتجربة
Progressive Enhancement مع رسائل خطأ لكل حقل).

## 11) خارطة الطريق (لما بعده)

- ربط فعلي لـ Najiz API عند توفر الاعتماد الرسمي.
- استكمال Background Jobs (تذكيرات الجلسات، تصعيد الإشعارات) عبر طابور مهام (BullMQ + Redis).
- تفعيل MFA (TOTP) فعليًا في تدفق تسجيل الدخول.
- شاشات تعديل/حذف للكيانات الموجودة (الإنشاء أصبح مكتملًا للكيانات الأساسية).
- اختبارات آلية (Unit + E2E) — الأساس التقني (TypeScript الصارم + RBAC معزول) مُعد لها.

---

**© شركة مشعل الجهني للمحاماة والاستشارات — منصة داخلية، جميع البيانات في Seed وهمية بالكامل.**
