import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useLang } from '../lang';
import { saveCitizenUser } from '../store';

const ATTEMPTS_KEY = 'samadhan_citizen_login_attempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000;

interface LoginAttempts { count: number; lockedUntil: number | null }

function getAttempts(): LoginAttempts {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    if (raw) return JSON.parse(raw) as LoginAttempts;
  } catch { /* noop */ }
  return { count: 0, lockedUntil: null };
}

function setAttempts(a: LoginAttempts): void {
  try { localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(a)); } catch { /* noop */ }
}

export function LoginPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSendOtp() {
    if (phone.length < 10) {
      setError(t('login.phoneError'));
      return;
    }
    if (!name.trim()) {
      setError(t('login.nameError'));
      return;
    }
    setError('');
    setStep('otp');
  }

  function handleVerifyOtp() {
    const attempts = getAttempts();
    if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
      const sec = Math.ceil((attempts.lockedUntil - Date.now()) / 1000);
      setError(`Too many attempts. Try again in ${sec}s.`);
      return;
    }

    if (otp.length < 4) {
      setError(t('login.otpError'));
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (otp === '1234') {
        setAttempts({ count: 0, lockedUntil: null });
        saveCitizenUser({ name: name.trim(), phone });
        void navigate({ to: '/home' });
      } else {
        const newCount = (attempts.lockedUntil && Date.now() >= attempts.lockedUntil ? 0 : attempts.count) + 1;
        const locked = newCount >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : null;
        setAttempts({ count: newCount, lockedUntil: locked });
        if (locked) {
          setError('Too many failed attempts. Try again in 5 minutes.');
        } else {
          setError(`${t('login.otpError')} ${MAX_ATTEMPTS - newCount} attempts remaining.`);
        }
      }
    }, 300);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-cream px-5">
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className="text-center mb-2">
          <div className="w-24 h-24 rounded-3xl bg-primary mx-auto flex items-center justify-center mb-4" style={{ boxShadow: '0 4px 24px rgba(194,78,51,0.25)' }}>
            <span className="material-symbols-rounded text-6xl text-white">record_voice_over</span>
          </div>
          <h1 className="text-4xl font-extrabold text-dark">{t('app.title')}</h1>
          <p className="text-base text-dark-muted">{t('app.subtitle')}</p>
        </div>

        <div className="w-full rounded-3xl bg-white p-6 flex flex-col gap-4" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
          <div className="text-center">
            <div className="text-xl font-extrabold">{t('login.title')}</div>
            <div className="text-sm text-dark-muted">{t('login.titleSub')}</div>
          </div>

          {step === 'phone' ? (
            <>
              <div>
                <label className="text-sm font-bold text-dark-muted mb-1 block">{t('login.name')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('login.namePlaceholder')}
                  autoComplete="name"
                  className="w-full h-14 rounded-2xl border-2 border-cream-darker bg-cream px-4 text-lg outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-dark-muted mb-1 block">{t('login.phone')}</label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-dark-muted">+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    autoComplete="tel"
                    className="flex-1 h-14 rounded-2xl border-2 border-cream-darker bg-cream px-4 text-lg outline-none focus:border-primary"
                    style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '0.1em' }}
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-danger font-bold text-center">{error}</div>
              )}

              <button
                onClick={handleSendOtp}
                className="w-full h-16 rounded-2xl bg-primary text-white font-bold text-xl flex items-center justify-center gap-2"
              >
                <span className="material-symbols-rounded text-2xl">send</span>
                {t('login.sendOtp')}
              </button>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="text-sm text-dark-muted">
                  {t('login.otpSent')} <span className="font-bold text-dark">+91 {phone}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-dark-muted mb-1 block">{t('login.otp')}</label>
                <input
                  type="tel"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="----"
                  maxLength={4}
                  autoComplete="one-time-code"
                  className="w-full h-16 rounded-2xl border-2 border-cream-darker bg-cream px-4 text-center text-3xl font-bold outline-none focus:border-primary"
                  style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '0.5em' }}
                />
              </div>

              {error && (
                <div className="text-sm text-danger font-bold text-center">{error}</div>
              )}

              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full h-16 rounded-2xl bg-primary text-white font-bold text-xl flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <span className="material-symbols-rounded text-2xl animate-spin">progress_activity</span>
                ) : (
                  <>
                    <span className="material-symbols-rounded text-2xl">verified</span>
                    {t('login.verify')}
                  </>
                )}
              </button>

              <button
                onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
                className="text-sm font-bold text-primary text-center"
              >
                {t('login.changePhone')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
