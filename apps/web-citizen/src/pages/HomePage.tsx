import { Link } from '@tanstack/react-router';
import { useLang } from '../lang';
import { categories, mockComplaints, locations, STATUS_STYLES } from '../data/mockData';

export function HomePage() {
  const { t } = useLang();
  const latest = mockComplaints[0];
  const latestCat = latest ? categories[latest.catIndex] : null;
  const latestSub = latestCat && latest ? latestCat.subs[latest.subIndex] : null;
  const latestLoc = latest ? locations[latest.locIndex] : null;
  const latestStatus = latest ? STATUS_STYLES[latest.step] : null;
  const previewCats = categories.slice(0, 5);

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-3xl font-extrabold leading-tight text-dark">{t('app.title')}</h1>
          <p className="text-sm text-dark-muted">{t('app.subtitle')}</p>
        </div>

        {/* Two big choice buttons */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <Link
            to="/register"
            search={{ category: '__voice__' }}
            className="flex flex-col items-center justify-center gap-2 rounded-3xl bg-primary p-5 text-white text-center"
            style={{ minHeight: 140 }}
          >
            <span className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <span className="material-symbols-rounded text-4xl">mic</span>
            </span>
            <div>
              <div className="text-lg font-bold leading-tight">{t('home.voice')}</div>
              <div className="text-xs opacity-80">{t('home.voiceSub')}</div>
            </div>
          </Link>

          <Link
            to="/register"
            search={{ category: undefined }}
            className="flex flex-col items-center justify-center gap-2 rounded-3xl bg-white p-5 text-dark text-center"
            style={{ minHeight: 140, boxShadow: '0 1px 0 #EADFD2' }}
          >
            <span className="w-16 h-16 rounded-full bg-cream-dark flex items-center justify-center">
              <span className="material-symbols-rounded text-4xl text-primary">grid_view</span>
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

        {/* Latest complaint card */}
        {latest && latestCat && latestSub && latestLoc && latestStatus && (
          <Link
            to="/complaint/$id"
            params={{ id: latest.id }}
            className="block rounded-3xl bg-white p-4 mb-3"
            style={{ boxShadow: '0 1px 0 #EADFD2' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-none"
                style={{ background: latestCat.bg }}
              >
                <span className="material-symbols-rounded text-2xl" style={{ color: latestCat.fg }}>
                  {latestSub.icon}
                </span>
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-lg font-bold leading-tight text-dark">{latestSub.hi}</div>
                <div className="text-xs text-dark-muted">{latest.caseNumber} · {latest.date} · {latestLoc.hi}</div>
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
      </div>

      {/* Bottom Nav */}
      <nav className="flex-none h-20 bg-white flex gap-1.5 px-2.5 pt-1.5 pb-3" style={{ borderTop: '1px solid #EADFD2' }}>
        <NavBtn icon="home" hi="होम" en="Home" to="/home" active />
        <NavBtn icon="mic" hi={t('home.speak')} en={t('home.speakSub')} to="/register" search={{ category: '__voice__' }} />
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
