import { notFound, redirect } from 'next/navigation';
import BillingAuditClient from './BillingAuditClient';
import BillingAuditMfaGate from './BillingAuditMfaGate';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getBillingAuditAccessState } from '@/utils/billingAuditAuth';

export const dynamic = 'force-dynamic';

export default async function ReconcileBillingPage() {
  const access = await getBillingAuditAccessState();

  if (access.status === 'unauthenticated') {
    redirect('/login?returnTo=%2Fdashboard%2Fadmin%2Freconcile-billing');
  }

  if (access.status === 'forbidden') {
    notFound();
  }

  if (access.status === 'error') {
    return (
      <div className="min-h-screen bg-black text-gray-100">
        <Header />
        <main className="mx-auto max-w-2xl px-4 pb-20 pt-32">
          <div className="rounded-2xl border border-red-800 bg-red-950/30 p-6 text-red-100">
            {access.message}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (access.currentLevel === 'aal2') {
    return <BillingAuditClient />;
  }

  return <BillingAuditMfaGate mode={access.hasVerifiedTotp ? 'challenge' : 'enroll'} />;
}
