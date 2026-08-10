'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { createClient } from '@/utils/supabase/client';

export default function BillingAuditMfaGate({ mode }: { mode: 'enroll' | 'challenge' }) {
  const router = useRouter();
  const supabase = createClient();
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const beginEnrollment = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: existingFactors, error: listError } = await supabase.auth.mfa.listFactors();
      if (listError) throw listError;

      const verifiedTotp = existingFactors.totp.find((factor) => factor.status === 'verified');
      if (verifiedTotp) {
        setError('An authenticator is already enrolled. Refresh this page and enter its code.');
        return;
      }

      for (const factor of existingFactors.totp.filter((item) => item.status === 'unverified')) {
        const { error: cleanupError } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
        if (cleanupError) throw cleanupError;
      }

      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Embers Billing Audit',
      });
      if (enrollError) throw enrollError;

      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to start authenticator enrollment.');
    } finally {
      setLoading(false);
    }
  };

  const verifyEnrollment = async () => {
    if (!factorId || code.trim().length < 6) return;

    setLoading(true);
    setError(null);
    try {
      const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: code.trim(),
      });
      if (verifyError) throw verifyError;
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Authenticator verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const verifyExistingFactor = async () => {
    if (code.trim().length < 6) return;

    setLoading(true);
    setError(null);
    try {
      const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
      if (listError) throw listError;

      const factor = factors.totp.find((item) => item.status === 'verified');
      if (!factor) {
        throw new Error('No verified authenticator factor was found. Refresh to set one up.');
      }

      const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
        factorId: factor.id,
        code: code.trim(),
      });
      if (verifyError) throw verifyError;
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Authenticator verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <Header />
      <main className="mx-auto max-w-2xl px-4 pb-20 pt-32">
        <section className="rounded-2xl border border-orange-900/60 bg-zinc-950 p-6 md:p-8">
          <p className="font-cinzel text-sm uppercase tracking-[0.25em] text-orange-400">Protected Billing Audit</p>
          <h1 className="mt-2 font-cinzel text-3xl text-white">Second-factor verification required</h1>
          <p className="mt-4 leading-relaxed text-gray-300">
            This area is restricted to the dedicated billing-audit account and requires an authenticator code before Stripe or membership audit data can be read.
          </p>

          {error && (
            <div className="mt-5 rounded-xl border border-red-800 bg-red-950/30 p-4 text-sm text-red-100">
              {error}
            </div>
          )}

          {mode === 'enroll' && !factorId ? (
            <div className="mt-6">
              <p className="text-sm text-gray-400">
                Set up a TOTP authenticator such as Google Authenticator, Authy, 1Password, or another compatible app.
              </p>
              <button
                type="button"
                disabled={loading}
                onClick={() => void beginEnrollment()}
                className="mt-5 rounded-xl bg-orange-700 px-5 py-3 font-cinzel text-sm uppercase tracking-wider text-white disabled:opacity-50"
              >
                {loading ? 'Preparing…' : 'Set up authenticator'}
              </button>
            </div>
          ) : null}

          {mode === 'enroll' && factorId && qrCode ? (
            <div className="mt-6 space-y-5">
              <div className="rounded-xl bg-white p-4 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCode} alt="Authenticator enrollment QR code" className="mx-auto h-56 w-56" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Scan the QR code. If scanning fails, enter this setup key manually:</p>
                <div className="mt-2 break-all rounded-lg border border-white/10 bg-black p-3 font-mono text-sm text-orange-200">
                  {secret}
                </div>
              </div>
              <CodeInput code={code} setCode={setCode} disabled={loading} />
              <button
                type="button"
                disabled={loading || code.trim().length < 6}
                onClick={() => void verifyEnrollment()}
                className="rounded-xl bg-orange-700 px-5 py-3 font-cinzel text-sm uppercase tracking-wider text-white disabled:opacity-50"
              >
                {loading ? 'Verifying…' : 'Verify and protect audit'}
              </button>
            </div>
          ) : null}

          {mode === 'challenge' ? (
            <div className="mt-6 space-y-5">
              <p className="text-sm text-gray-400">Enter the current six-digit code from your authenticator app.</p>
              <CodeInput code={code} setCode={setCode} disabled={loading} />
              <button
                type="button"
                disabled={loading || code.trim().length < 6}
                onClick={() => void verifyExistingFactor()}
                className="rounded-xl bg-orange-700 px-5 py-3 font-cinzel text-sm uppercase tracking-wider text-white disabled:opacity-50"
              >
                {loading ? 'Verifying…' : 'Unlock billing audit'}
              </button>
            </div>
          ) : null}
        </section>
      </main>
      <Footer />
    </div>
  );
}

function CodeInput({
  code,
  setCode,
  disabled,
}: {
  code: string;
  setCode: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-cinzel text-xs uppercase tracking-wider text-orange-300">Authenticator code</span>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={8}
        value={code}
        disabled={disabled}
        onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
        className="w-full rounded-xl border border-orange-900/60 bg-black px-4 py-3 text-xl tracking-[0.35em] text-white outline-none focus:border-orange-500 disabled:opacity-50"
      />
    </label>
  );
}
