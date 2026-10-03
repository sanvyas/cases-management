import { useState } from 'react';
import { useAuth } from '../auth';

export function LoginPage({ onSuccess }: { onSuccess: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter email and password.');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      const result = login(email, password);
      setLoading(false);
      if (!result.ok) {
        setError(result.error || 'Invalid credentials');
      } else {
        onSuccess();
      }
    }, 300);
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2A1F17 100%)', fontFamily: "'Mukta', sans-serif" }}
    >
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="material-symbols-rounded text-4xl text-primary">shield</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Samadhan</h1>
          <p className="mt-1 text-sm text-white/50">Platform Owner Console</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-8 space-y-5" style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
          <div>
            <label className="block text-xs font-bold text-dark-muted mb-1.5">Email</label>
            <div className="relative">
              <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-lg text-dark-muted">mail</span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-12 rounded-xl border-2 border-cream-darker bg-cream pl-10 pr-4 text-sm font-bold text-dark outline-none focus:border-primary"
                placeholder="Email address"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-dark-muted mb-1.5">Password</label>
            <div className="relative">
              <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-lg text-dark-muted">lock</span>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full h-12 rounded-xl border-2 border-cream-darker bg-cream pl-10 pr-4 text-sm font-bold text-dark outline-none focus:border-primary"
                placeholder="Password"
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-danger-light px-4 py-3 text-sm font-bold text-danger">
              <span className="material-symbols-rounded text-lg">error</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full h-12 items-center justify-center gap-2 rounded-xl bg-primary text-base font-extrabold text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            {loading ? (
              <span className="material-symbols-rounded text-xl animate-spin">progress_activity</span>
            ) : (
              <>
                <span className="material-symbols-rounded text-xl">login</span>
                Sign In
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
