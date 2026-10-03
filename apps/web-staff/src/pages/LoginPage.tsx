import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../auth';

const ROLES = [
  { key: 'officer', label: 'Supervising Officer', icon: 'admin_panel_settings', desc: 'Full access: assign, approve, manage settings' },
  { key: 'field_worker', label: 'Junior Engineer (Field)', icon: 'engineering', desc: 'Field work: update status, upload photos, submit ATR' },
  { key: 'inspector', label: 'Sanitary Inspector', icon: 'search', desc: 'Inspect & report: update status, upload evidence' },
  { key: 'data_entry', label: 'Data Entry Operator', icon: 'edit_note', desc: 'Register complaints, add comments' },
];

export function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState('officer');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
    if (otp.length < 4) {
      setError('Enter 4-digit OTP');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = login(phone, otp, role);
      setLoading(false);
      if (result.ok) {
        void navigate({ to: '/' });
      } else {
        setError(result.error || 'Invalid OTP');
      }
    }, 300);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream" style={{ fontFamily: "'Mukta', sans-serif" }}>
      <div className="w-full max-w-md rounded-3xl bg-white p-8" style={{ boxShadow: '0 2px 24px rgba(42,31,23,0.08)' }}>
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-extrabold text-dark">Samadhan</h1>
          <p className="mt-1 text-sm text-dark-muted">Staff Console</p>
        </div>

        {step === 'phone' && (
          <>
            <label className="block text-sm font-bold text-dark mb-2">Select Role</label>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {ROLES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setRole(r.key)}
                  className="flex flex-col items-center gap-1 rounded-xl p-3 text-center transition-all"
                  style={{
                    background: role === r.key ? '#FDF0EA' : '#FAF5EE',
                    border: `2px solid ${role === r.key ? '#C24E33' : 'transparent'}`,
                  }}
                >
                  <span
                    className="material-symbols-rounded text-2xl"
                    style={{ color: role === r.key ? '#C24E33' : '#6B5A4C' }}
                  >
                    {r.icon}
                  </span>
                  <span className="text-xs font-bold text-dark leading-tight">{r.label}</span>
                </button>
              ))}
            </div>
            <div className="rounded-xl bg-cream p-2.5 mb-4">
              <p className="text-xs text-dark-muted text-center">
                {ROLES.find(r => r.key === role)?.desc}
              </p>
            </div>

            <label className="block text-sm font-bold text-dark">Phone Number</label>
            <input
              type="tel"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 10-digit number"
              autoComplete="tel"
              className="mt-2 w-full rounded-xl border-2 border-cream-darker bg-cream px-4 py-3 text-base outline-none focus:border-primary"
            />
            {error && <p className="mt-2 text-xs text-danger font-bold">{error}</p>}
            <button
              onClick={handleSendOtp}
              className="mt-4 w-full h-14 rounded-xl bg-primary text-white text-lg font-bold flex items-center justify-center gap-2"
            >
              <span className="material-symbols-rounded text-2xl">send</span>
              Send OTP
            </button>
          </>
        )}

        {step === 'otp' && (
          <>
            <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-cream text-sm text-dark-secondary">
              <span className="material-symbols-rounded text-lg text-success">check_circle</span>
              OTP sent to <span className="font-bold">+91 {phone}</span>
            </div>
            <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl text-sm font-bold" style={{ background: '#FDF0EA', color: '#C24E33' }}>
              <span className="material-symbols-rounded text-lg">badge</span>
              {ROLES.find(r => r.key === role)?.label}
            </div>
            <label className="block text-sm font-bold text-dark">Enter OTP</label>
            <input
              type="text"
              maxLength={4}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="4-digit OTP"
              autoComplete="one-time-code"
              className="mt-2 w-full rounded-xl border-2 border-cream-darker bg-cream px-4 py-3 text-base tracking-widest outline-none focus:border-primary"
            />
            {error && <p className="mt-2 text-xs text-danger font-bold">{error}</p>}
            <button
              onClick={handleVerify}
              disabled={loading}
              className="mt-4 w-full h-14 rounded-xl bg-primary text-white text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <span className="material-symbols-rounded text-2xl animate-spin">progress_activity</span>
              ) : (
                <>
                  <span className="material-symbols-rounded text-2xl">verified</span>
                  Verify & Login
                </>
              )}
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
