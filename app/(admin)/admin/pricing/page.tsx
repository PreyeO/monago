import { AdminLayout } from '@/components/layout/AdminLayout';
import { PricingControl } from '@/components/admin/PricingControl';

export const metadata = { title: 'Pricing — Admin' };

export default function AdminPricingPage() {
  return (
    <AdminLayout>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Pricing</h1>
      <p className="mb-8 text-sm text-slate-500">
        Set a global markup percentage applied to all products that don&apos;t have an individual override.
        Preview the effect before applying.
      </p>
      <PricingControl />
    </AdminLayout>
  );
}
