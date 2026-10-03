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
    <div className="flex min-h-screen items-center justify-center bg-cream" style={{ fontFamily: "'Mukta', sans-serif" }}>
      <div className="w-full max-w-sm rounded-3xl bg-white p-8" style={{ boxShadow: '0 2px 24px rgba(42,31,23,0.08)' }}>
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-dark">समाधान</h1>
          <p className="mt-1 text-sm text-dark-muted">Samadhan · Officer Console</p>
        </div>

        {step === 'phone' && (
          <>
            <label className="block text-sm font-bold text-dark">Phone Number</label>
            <input
              type="tel"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 10-digit number"
              className="mt-2 w-full rounded-xl border-2 border-cream-darker bg-cream px-4 py-3 text-base outline-none focus:border-primary"
            />
            {error && <p className="mt-2 text-xs text-danger">{error}</p>}
            <button
              onClick={handleSendOtp}
              className="mt-4 w-full h-14 rounded-xl bg-primary text-white text-lg font-bold flex items-center justify-center gap-2"
            >
              <span className="material-symbols-rounded text-2xl">send</span>
              Send OTP
            </button>
            <p className="mt-4 text-center text-xs text-dark-muted">
              Demo: any 10-digit number, OTP: 1234
            </p>
          </>
        )}

        {step === 'otp' && (
          <>
            <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-cream text-sm text-dark-secondary">
              <span className="material-symbols-rounded text-lg text-success">check_circle</span>
              OTP sent to <span className="font-bold">{phone}</span>
            </div>
            <label className="block text-sm font-bold text-dark">Enter OTP</label>
            <input
              type="text"
              maxLength={4}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 4-digit OTP"
              className="mt-2 w-full rounded-xl border-2 border-cream-darker bg-cream px-4 py-3 text-base tracking-widest outline-none focus:border-primary"
            />
            {error && <p className="mt-2 text-xs text-danger">{error}</p>}
            <button
              onClick={handleVerify}
              className="mt-4 w-full h-14 rounded-xl bg-primary text-white text-lg font-bold flex items-center justify-center gap-2"
            >
              <span className="material-symbols-rounded text-2xl">verified</span>
              Verify & Login
            </button>
            <button
              onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
              className="mt-2 w-full text-sm text-dark-muted font-bold hover:text-dark"
            >
              Change number
            </button>
          </>
        )}
      </div>
    </div>
  );
}
