import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../auth';
import type { StaffRole } from '../types';

export function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'role'>('phone');
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<StaffRole>('officer');
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
    if (otp !== '1234') {
      setError('Invalid OTP. Use 1234 for demo.');
      return;
    }
    setError('');
    setStep('role');
  }

  function handleRoleSelect() {
    const ok = login(phone, otp, selectedRole);
    if (ok) {
      void navigate({ to: selectedRole === 'officer' ? '/' : '/tasks' });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream" style={{ fontFamily: "'Mukta', sans-serif" }}>
      <div className="w-full max-w-sm rounded-3xl bg-white p-8" style={{ boxShadow: '0 2px 24px rgba(42,31,23,0.08)' }}>
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-dark">समाधान</h1>
          <p className="mt-1 text-sm text-dark-muted">Samadhan · Staff Console</p>
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
              Verify OTP
            </button>
            <button
              onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
              className="mt-2 w-full text-sm text-dark-muted font-bold hover:text-dark"
            >
              Change number
            </button>
          </>
        )}

        {step === 'role' && (
          <>
            <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-success-light text-sm text-success font-bold">
              <span className="material-symbols-rounded text-lg">verified</span>
              Phone verified
            </div>
            <p className="text-sm font-bold text-dark mb-3">Select your role</p>
            <div className="space-y-3 mb-6">
              <button
                onClick={() => setSelectedRole('officer')}
                className="w-full flex items-center gap-4 rounded-2xl border-2 px-4 py-4 text-left transition-all"
                style={{
                  borderColor: selectedRole === 'officer' ? '#C24E33' : '#E3D6C6',
                  background: selectedRole === 'officer' ? '#FBE3D9' : '#fff',
                }}
              >
                <span
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-none"
                  style={{ background: selectedRole === 'officer' ? '#C24E33' : '#E9E3DB' }}
                >
                  <span className="material-symbols-rounded text-3xl" style={{ color: selectedRole === 'officer' ? '#fff' : '#4A3E34' }}>
                    supervisor_account
                  </span>
                </span>
                <div>
                  <div className="text-lg font-extrabold text-dark">Officer / Supervisor</div>
                  <div className="text-xs text-dark-muted">Dashboard, approvals, oversight, reports</div>
                </div>
              </button>
              <button
                onClick={() => setSelectedRole('field_worker')}
                className="w-full flex items-center gap-4 rounded-2xl border-2 px-4 py-4 text-left transition-all"
                style={{
                  borderColor: selectedRole === 'field_worker' ? '#C24E33' : '#E3D6C6',
                  background: selectedRole === 'field_worker' ? '#FBE3D9' : '#fff',
                }}
              >
                <span
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-none"
                  style={{ background: selectedRole === 'field_worker' ? '#C24E33' : '#E9E3DB' }}
                >
                  <span className="material-symbols-rounded text-3xl" style={{ color: selectedRole === 'field_worker' ? '#fff' : '#4A3E34' }}>
                    engineering
                  </span>
                </span>
                <div>
                  <div className="text-lg font-extrabold text-dark">Field Worker</div>
                  <div className="text-xs text-dark-muted">Accept tasks, do field work, submit proofs</div>
                </div>
              </button>
            </div>
            <button
              onClick={handleRoleSelect}
              className="w-full h-14 rounded-xl bg-primary text-white text-lg font-bold flex items-center justify-center gap-2"
            >
              <span className="material-symbols-rounded text-2xl">arrow_forward</span>
              Continue
            </button>
          </>
        )}
      </div>
    </div>
  );
}
