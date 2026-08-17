import {
  Briefcase,
  Building2,
  Gavel,
  Users,
  Home as HomeIcon,
  Landmark,
  Heart,
  Shield,
  FileStack,
  Lightbulb,
  FileSignature,
  Scale,
  ShieldCheck,
  BrainCircuit,
  LineChart,
  ArrowLeft,
} from 'lucide-react';
import { PRACTICE_AREAS } from '@/lib/constants/practice-areas';

const ICONS: Record<string, any> = {
  Briefcase, Building2, Gavel, Users, Home: HomeIcon, Landmark, Heart, Shield, FileStack, Lightbulb, FileSignature, Scale,
};

const PROFESSIONALS = [
  { name: 'مشعل الجهني', title: 'الشريك المؤسس والمدير العام', area: 'التجارية والتحكيم' },
  { name: 'نورة العتيبي', title: 'شريكة، رئيسة قسم التقاضي', area: 'التقاضي التجاري' },
  { name: 'فيصل الدوسري', title: 'محامٍ أول', area: 'الشركات والاستحواذ' },
  { name: 'سارة القحطاني', title: 'محامية أولى', area: 'العمالية والأحوال الشخصية' },
];

const INSIGHTS = [
  { title: 'تعديلات نظام الشركات وأثرها على الحوكمة', category: 'الشركات' },
  { title: 'التحكيم التجاري في المملكة: مسارات أسرع للتقاضي', category: 'التحكيم' },
  { title: 'الالتزامات التعاقدية في العقود العقارية الكبرى', category: 'العقارية' },
];

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'LegalService',
  name: 'شركة مشعل الجهني للمحاماة والاستشارات',
  alternateName: 'Mishal Al-Juhani Law Firm',
  description: 'مكتب محاماة واستشارات قانونية سعودي متخصص في التجارية والشركات والتقاضي والتحكيم.',
  areaServed: 'SA',
  address: { '@type': 'PostalAddress', addressCountry: 'SA', addressLocality: 'الرياض' },
};

export default function LandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden bg-charcoal-950 text-ivory-100">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, #C9A24B 0, transparent 40%), radial-gradient(circle at 80% 60%, #C9A24B 0, transparent 35%)',
          }}
        />
        <div className="container relative flex min-h-[86vh] flex-col items-start justify-center gap-8 py-24">
          <span className="ds-kicker text-gold-400">شركة مشعل الجهني للمحاماة والاستشارات</span>
          <h1 className="max-w-3xl font-display text-4xl font-bold leading-[1.25] sm:text-5xl md:text-6xl">
            خبرة قانونية.
            <br />
            <span className="text-gold-400">رؤية استراتيجية.</span>
          </h1>
          <p className="max-w-xl text-lg leading-8 text-neutral-300">
            نمثّل الشركات الرائدة وكبار الأفراد في أعقد قضاياهم التجارية والتقاضي والتحكيم،
            بمنهجية دقيقة ومنصة قانونية رقمية تضع الشفافية والسرعة في صميم كل قرار.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-md bg-gold-500 px-7 py-3.5 text-sm font-semibold text-charcoal-950 transition-premium hover:bg-gold-400"
            >
              احجز استشارة
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            </a>
            <a
              href="#practice-areas"
              className="inline-flex items-center gap-2 rounded-md border border-white/15 px-7 py-3.5 text-sm font-medium text-ivory-100 transition-premium hover:bg-white/5"
            >
              مجالات الممارسة
            </a>
          </div>

          <div className="mt-10 grid w-full max-w-2xl grid-cols-3 gap-8 border-t border-white/10 pt-8">
            <div>
              <div className="font-display text-2xl font-bold text-gold-400">+18</div>
              <div className="mt-1 text-xs text-neutral-400">سنة خبرة تراكمية</div>
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-gold-400">+500</div>
              <div className="mt-1 text-xs text-neutral-400">قضية تمت إدارتها</div>
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-gold-400">12</div>
              <div className="mt-1 text-xs text-neutral-400">مجال ممارسة متخصص</div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- About */}
      <section id="about" className="container grid gap-12 py-24 md:grid-cols-2 md:gap-20">
        <div>
          <span className="ds-kicker">عن المكتب</span>
          <h2 className="mt-4 font-display text-3xl font-bold text-charcoal-900">
            حيث تلتقي الدقة القانونية بالتقنية الحديثة
          </h2>
        </div>
        <div className="space-y-5 text-[15px] leading-8 text-neutral-600">
          <p>
            تأسست شركة مشعل الجهني للمحاماة والاستشارات لتقديم خدمات قانونية استشارية وتقاضٍ
            على أعلى مستوى من الاحترافية، بمنهجية تجمع بين العمق القانوني والفهم التجاري
            العميق لاحتياجات العملاء.
          </p>
          <p>
            نؤمن بأن التميّز القانوني اليوم يتطلب أدوات عمل حديثة؛ لذلك بنينا منصة رقمية
            متكاملة تمنح عملاءنا رؤية واضحة ومباشرة لكل مرحلة من مراحل قضيتهم، مع الحفاظ
            الكامل على السرية وأعلى معايير الأمان.
          </p>
        </div>
      </section>

      {/* -------------------------------------------------------- Practice Areas */}
      <section id="practice-areas" className="bg-ivory-200/60 py-24">
        <div className="container">
          <div className="mb-14 max-w-xl">
            <span className="ds-kicker">مجالات الممارسة</span>
            <h2 className="mt-4 font-display text-3xl font-bold text-charcoal-900">
              تغطية قانونية شاملة لكل احتياجاتك
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-neutral-200 bg-neutral-200 sm:grid-cols-3 lg:grid-cols-4">
            {PRACTICE_AREAS.map((area) => {
              const Icon = ICONS[area.icon] ?? Briefcase;
              return (
                <div
                  key={area.key}
                  className="group flex flex-col gap-4 bg-ivory-50 p-7 transition-premium hover:bg-white"
                >
                  <Icon className="h-5 w-5 text-gold-600" strokeWidth={1.5} />
                  <span className="text-sm font-semibold text-charcoal-800">{area.nameAr}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Approach */}
      <section id="approach" className="container py-24">
        <div className="mb-14 max-w-xl">
          <span className="ds-kicker">منهجنا</span>
          <h2 className="mt-4 font-display text-3xl font-bold text-charcoal-900">
            ثلاث ركائز تحكم كل قضية نتولاها
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { title: 'دقة استراتيجية', desc: 'كل قضية تبدأ بتحليل معمّق للمخاطر والفرص قبل اتخاذ أي إجراء.' },
            { title: 'شفافية كاملة', desc: 'رؤية مباشرة ومستمرة لكل مرحلة عبر منصتنا الرقمية، دون انتظار.' },
            { title: 'التزام بالنتائج', desc: 'نقيس نجاحنا بنتائج عملائنا الفعلية، لا بعدد الساعات المفوترة فقط.' },
          ].map((item) => (
            <div key={item.title} className="ds-card p-8">
              <h3 className="font-display text-lg font-bold text-charcoal-900">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-neutral-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- Technology */}
      <section id="technology" className="bg-charcoal-950 py-24 text-ivory-100">
        <div className="container grid items-center gap-16 md:grid-cols-2">
          <div>
            <span className="ds-kicker text-gold-400">التقنية</span>
            <h2 className="mt-4 font-display text-3xl font-bold">
              منصة قانونية رقمية بُنيت لخدمة عملائنا، لا لعرض الميزات
            </h2>
            <p className="mt-5 text-[15px] leading-8 text-neutral-400">
              من غرفة عمليات القضية (Case War Room) إلى الذكاء الاصطناعي المساعد للمحامي،
              صمّمنا كل أداة لتقليل الوقت الضائع وزيادة وضوح القرار — دون أن يحلّ أي نظام
              محل الحكم القانوني البشري.
            </p>
          </div>
          <div className="grid gap-4">
            {[
              { icon: ShieldCheck, title: 'أمان على مستوى مؤسسي', desc: 'تشفير كامل، صلاحيات دقيقة، وسجل تدقيق غير قابل للتعديل.' },
              { icon: BrainCircuit, title: 'ذكاء اصطناعي مساعد', desc: 'يلخّص ويحلل المستندات، ويبقى القرار النهائي دائمًا للمحامي.' },
              { icon: LineChart, title: 'رؤية تحليلية للإدارة', desc: 'مؤشرات أداء حية لكل قضية وكل محامٍ وكل ملف مالي.' },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-4 rounded-lg border border-white/10 bg-white/[0.03] p-5">
                <f.icon className="mt-0.5 h-5 w-5 shrink-0 text-gold-400" strokeWidth={1.5} />
                <div>
                  <h4 className="text-sm font-semibold text-ivory-100">{f.title}</h4>
                  <p className="mt-1 text-xs leading-6 text-neutral-400">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- Professionals */}
      <section id="professionals" className="container py-24">
        <div className="mb-14 max-w-xl">
          <span className="ds-kicker">فريقنا</span>
          <h2 className="mt-4 font-display text-3xl font-bold text-charcoal-900">
            محامون بخبرة عميقة في تخصصاتهم
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PROFESSIONALS.map((p) => (
            <div key={p.name} className="ds-card overflow-hidden">
              <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-charcoal-800 to-charcoal-950">
                <span className="font-display text-2xl font-bold text-gold-400/70">
                  {p.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </span>
              </div>
              <div className="p-5">
                <h4 className="font-display text-sm font-bold text-charcoal-900">{p.name}</h4>
                <p className="mt-1 text-xs text-gold-600">{p.title}</p>
                <p className="mt-2 text-xs text-neutral-500">{p.area}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ Insights */}
      <section id="insights" className="bg-ivory-200/60 py-24">
        <div className="container">
          <div className="mb-14 max-w-xl">
            <span className="ds-kicker">رؤى قانونية</span>
            <h2 className="mt-4 font-display text-3xl font-bold text-charcoal-900">
              تحليلات ومستجدات من فريقنا
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {INSIGHTS.map((i) => (
              <article key={i.title} className="ds-card p-7">
                <span className="ds-kicker">{i.category}</span>
                <h3 className="mt-4 font-display text-base font-bold leading-8 text-charcoal-900">
                  {i.title}
                </h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- Contact */}
      <section id="contact" className="container py-24">
        <div className="ds-card-elevated grid gap-10 p-10 md:grid-cols-2 md:p-14">
          <div>
            <span className="ds-kicker">تواصل معنا</span>
            <h2 className="mt-4 font-display text-3xl font-bold text-charcoal-900">
              احجز استشارتك القانونية
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-7 text-neutral-600">
              فريقنا جاهز لمناقشة قضيتك بسرية تامة. عبّئ النموذج وسنتواصل معك خلال يوم عمل واحد.
            </p>
          </div>
          <form className="grid gap-4">
            <input
              type="text"
              placeholder="الاسم الكامل"
              className="ds-focus-ring rounded-md border border-neutral-300 bg-white px-4 py-3 text-sm placeholder:text-neutral-400"
            />
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              className="ds-focus-ring rounded-md border border-neutral-300 bg-white px-4 py-3 text-sm placeholder:text-neutral-400"
            />
            <textarea
              placeholder="وصف موجز لموضوع الاستشارة"
              rows={4}
              className="ds-focus-ring rounded-md border border-neutral-300 bg-white px-4 py-3 text-sm placeholder:text-neutral-400"
            />
            <button
              type="submit"
              className="rounded-md bg-charcoal-900 px-6 py-3.5 text-sm font-semibold text-ivory-100 transition-premium hover:bg-charcoal-800"
            >
              إرسال الطلب
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
