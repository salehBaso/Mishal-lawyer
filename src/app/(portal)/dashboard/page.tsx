import { redirect } from 'next/navigation';
import { getActor } from '@/lib/auth';

/** موجّه تلقائي — كل دور له لوحة تحكم مصمّمة خصيصًا له */
export default async function DashboardRouter() {
  const actor = await getActor();
  if (!actor) redirect('/login');

  switch (actor.role) {
    case 'CLIENT':
      redirect('/dashboard/client');
    case 'SUPER_ADMIN':
    case 'FIRM_ADMIN':
    case 'MANAGING_PARTNER':
      redirect('/dashboard/admin');
    case 'SERVICE_PROVIDER':
      redirect('/marketplace/my-orders');
    default:
      redirect('/dashboard/lawyer');
  }
}
