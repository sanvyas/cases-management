import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../auth';

export function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleSendOtp() {
    if (phone.length < 10) {
      setError('Enter a valid 10-digit phone number');
      return;
    }
    setError('');
    setStep('otp');
  }

  function handleVerify() {
    const ok = login(phone, otp);
    if (ok) {
      void navigate({ to: '/' });
    } else {
      setError('Invalid OTP. Use 1234 for demo.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-800">Samadhan</h1>
          <p className="mt-1 text-sm text-slate-500">Staff Console</p>
        </div>

        {step === 'phone' ? (
          <>
            <label className="block text-sm font-medium text-slate-700">Phone Number</label>
            <input
              type="tel"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 10-digit number"
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
            />
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
            <button
              onClick={handleSendOtp}
              className="mt-4 w-full rounded-lg bg-slate-800 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
            >
              Send OTP
            </button>
            <p className="mt-4 text-center text-xs text-slate-400">
              Demo: any 10-digit number, OTP: 1234
            </p>
          </>
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-600">
              OTP sent to <span className="font-medium">{phone}</span>
            </p>
            <label className="block text-sm font-medium text-slate-700">Enter OTP</label>
            <input
              type="text"
              maxLength={4}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 4-digit OTP"
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm tracking-widest outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
            />
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
            <button
              onClick={handleVerify}
              className="mt-4 w-full rounded-lg bg-slate-800 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
            >
              Verify & Login
            </button>
            <button
              onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
              className="mt-2 w-full text-sm text-slate-500 hover:text-slate-700"
            >
              Change number
            </button>
          </>
        )}
      </div>
    </div>
  );
}
