import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProductForm } from '@/components/admin/ProductForm';

export const metadata = { title: 'Add product — Admin' };

export default function NewProductPage() {
  return (
    <AdminLayout>
      <ProductForm product={null} />
    </AdminLayout>
  );
}
