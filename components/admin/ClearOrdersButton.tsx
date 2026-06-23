'use client';

import { useState } from 'react';
import { clearAllOrders } from '@/app/actions/admin';
import { Trash2 } from 'lucide-react';

export function ClearOrdersButton() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleClear = async () => {
    if (!confirm('⚠️  This will delete ALL orders. Are you sure?')) return;
    if (!confirm('This action cannot be undone. Delete all orders?')) return;

    setLoading(true);
    const res = await clearAllOrders();
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        window.location.reload();
      }, 1500);
    } else {
      alert(`Error: ${res.error}`);
    }
  };

  return (
    <button
      onClick={handleClear}
      disabled={loading || success}
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition ${
        success
          ? 'bg-green-100 text-green-700'
          : loading
          ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
          : 'bg-red-100 text-red-700 hover:bg-red-200'
      }`}
    >
      <Trash2 className="h-4 w-4" />
      {success ? 'Cleared!' : loading ? 'Clearing...' : 'Clear Test Orders'}
    </button>
  );
}
