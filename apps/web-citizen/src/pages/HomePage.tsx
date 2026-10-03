import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useLang } from '../lang';
import { categories, STATUS_STYLES } from '../data/mockData';
import { getMyComplaints, getCitizenUser, clearCitizenUser, refreshCitizenSession, type StoredComplaint } from '../store';
import { getDeployedConfig } from '../platformConfig';

function statusToStep(status: string): number {
  switch (status) {
    case 'REGISTERED': return 0;
    case 'ASSIGNED': return 1;
    case 'IN_PROGRESS': return 1;
    case 'ATR_SUBMITTED': return 2;
    case 'RESOLVED': return 2;
    case 'CLOSED': return 3;
    default: return 0;
  }
}

export function HomePage() {
  const { t, language } = useLang();
  const navigate = useNavigate();
  const [latestComplaint, setLatestComplaint] = useState<StoredComplaint | null>(null);
  const [complaintCount, setComplaintCount] = useState(0);
  const citizen = getCitizenUser();
  const deployed = useMemo(() => getDeployedConfig(), []);
  const orgName = deployed?.tenant.name || '';
  const primaryColor = deployed?.config.branding.primaryColor || '#C24E33';
  const helpline = deployed?.config.branding.helplineNumber || '';
  const voiceEnabled = deployed?.config.features.modules.voice_app ?? true;
  const previewCats = categories.slice(0, 5);

  useEffect(() => {
    refreshCitizenSession();
    const stored = getMyComplaints();
    setComplaintCount(stored.length);
    if (stored.length > 0) {
      setLatestComplaint(stored[0]!);
    }
  }, []);

  function handleLogout() {
    clearCitizenUser();
    void navigate({ to: '/' });
  }

  const latestStatus = latestComplaint ? STATUS_STYLES[statusToStep(latestComplaint.status)] : null;

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2">
        {/* Header with user info */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-extrabold leading-tight text-dark">{t('app.title')}</h1>
            {orgName && (
              <p className="text-sm font-bold mt-0.5" style={{ color: primaryColor }}>{orgName}</p>
            )}
            <p className="text-sm text-dark-muted">{t('app.subtitle')}</p>
            {citizen && (
              <p className="text-sm font-bold mt-1" style={{ color: primaryColor }}>
                <span className="material-symbols-rounded text-sm align-middle mr-1">person</span>
                {citizen.name}
              </p>
            )}
          </div>
          {citizen && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 h-9 px-3 rounded-xl bg-cream-dark text-dark-muted text-sm font-bold"
            >
              <span className="material-symbols-rounded text-lg">logout</span>
            </button>
          )}
        </div>

        {/* Two big choice buttons */}
        <div className={`grid gap-3 mb-5 ${voiceEnabled ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {voiceEnabled && (
            <Link
              to="/register"
              search={{ category: '__voice__' }}
              className="flex flex-col items-center justify-center gap-2 rounded-3xl p-5 text-white text-center"
              style={{ minHeight: 140, background: primaryColor }}
            >
              <span className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <span className="material-symbols-rounded text-4xl">mic</span>
              </span>
              <div>
                <div className="text-lg font-bold leading-tight">{t('home.voice')}</div>
                <div className="text-xs opacity-80">{t('home.voiceSub')}</div>
              </div>
            </Link>
          )}

          <Link
            to="/register"
            search={{ category: undefined }}
            className="flex flex-col items-center justify-center gap-2 rounded-3xl bg-white p-5 text-dark text-center"
            style={{ minHeight: 140, boxShadow: '0 1px 0 #EADFD2' }}
          >
            <span className="w-16 h-16 rounded-full bg-cream-dark flex items-center justify-center">
              <span className="material-symbols-rounded text-4xl" style={{ color: primaryColor }}>grid_view</span>
            </span>
            <div>
              <div className="text-lg font-bold leading-tight">{t('home.pick')}</div>
              <div className="text-xs text-dark-muted">{t('home.pickSub')}</div>
            </div>
          </Link>
        </div>

        {/* Quick categories preview */}
        <div className="mb-5">
          <div className="flex overflow-x-auto gap-3 pb-2" style={{ scrollbarWidth: 'none' }}>
            {previewCats.map((cat, i) => (
              <Link
                key={cat.id}
                to="/register"
                search={{ category: String(i) }}
                className="flex flex-col items-center gap-2 flex-none"
                style={{ width: 80 }}
              >
                <span
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: cat.bg }}
                >
                  <span className="material-symbols-rounded text-3xl" style={{ color: cat.fg }}>
                    {cat.icon}
                  </span>
                </span>
                <span className="text-xs font-bold text-dark text-center leading-tight">{cat.hi}</span>
              </Link>
            ))}
            <Link
              to="/register"
              search={{ category: undefined }}
              className="flex flex-col items-center gap-2 flex-none"
              style={{ width: 80 }}
            >
              <span className="w-16 h-16 rounded-2xl flex items-center justify-center bg-cream-dark">
                <span className="material-symbols-rounded text-3xl text-dark-muted">apps</span>
              </span>
              <span className="text-xs font-bold text-dark text-center leading-tight">{t('home.seeAll')}</span>
            </Link>
          </div>
        </div>

        {/* Latest complaint card from stored data */}
        {latestComplaint && latestStatus && (
          <Link
            to="/complaint/$id"
            params={{ id: latestComplaint.id }}
            className="block rounded-3xl bg-white p-4 mb-3"
            style={{ boxShadow: '0 1px 0 #EADFD2' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-none"
                style={{ background: latestComplaint.categoryBg }}
              >
                <span className="material-symbols-rounded text-2xl" style={{ color: latestComplaint.categoryFg }}>
                  {latestComplaint.subtypeIcon}
                </span>
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-lg font-bold leading-tight text-dark">{latestComplaint.subtypeHi}</div>
                <div className="text-xs text-dark-muted">
                  {latestComplaint.caseNumber} · {new Date(latestComplaint.registeredAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} · {latestComplaint.locationHi}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="flex-1 flex items-center gap-2 h-10 px-3 rounded-xl text-sm font-bold"
                style={{ background: latestStatus.bg, color: latestStatus.fg }}
              >
                <span className="material-symbols-rounded text-xl">{latestStatus.icon}</span>
                {latestStatus.hi}
                <span className="text-xs font-semibold ml-1">· {latestStatus.en}</span>
              </span>
            </div>
          </Link>
        )}

        {complaintCount > 1 && (
          <Link
            to="/track"
            className="block rounded-2xl bg-cream-dark p-3 text-center text-sm font-bold text-dark mb-3"
          >
            {t('home.track')} ({complaintCount}) →
          </Link>
        )}

        {helpline && (
          <div className="rounded-2xl p-3 mb-3 flex items-center gap-3" style={{ background: '#E0F0FF' }}>
            <span className="w-10 h-10 rounded-full flex items-center justify-center flex-none" style={{ background: '#2F6690' }}>
              <span className="material-symbols-rounded text-xl text-white">call</span>
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold text-dark">
                {language === 'hi' ? 'हेल्पलाइन' : 'Helpline'}: {helpline}
              </p>
              <p className="text-xs text-dark-muted">{orgName}</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="flex-none h-20 bg-white flex gap-1.5 px-2.5 pt-1.5 pb-3" style={{ borderTop: '1px solid #EADFD2' }}>
        <NavBtn icon="home" hi="होम" en="Home" to="/home" active />
        {voiceEnabled && (
          <NavBtn icon="mic" hi={t('home.speak')} en={t('home.speakSub')} to="/register" search={{ category: '__voice__' }} />
        )}
        <NavBtn icon="list_alt" hi={t('home.track')} en={t('home.trackSub')} to="/track" />
      </nav>
    </div>
  );
}

function NavBtn({ icon, hi, en, to, search, active }: {
  icon: string; hi: string; en: string; to: string; search?: Record<string, string>; active?: boolean;
}) {
  return (
    <Link
      to={to}
      search={search as never}
      className="flex-1 flex flex-col items-center justify-center gap-0.5 rounded-2xl"
      style={{
        background: active ? '#FBE3D9' : 'transparent',
        color: active ? '#B9472F' : '#6B5A4C',
      }}
    >
      <span className="material-symbols-rounded text-2xl">{icon}</span>
      <span className="text-sm font-bold leading-none">{hi}</span>
      <span className="text-[11px] leading-none">{en}</span>
    </Link>
  );
}
