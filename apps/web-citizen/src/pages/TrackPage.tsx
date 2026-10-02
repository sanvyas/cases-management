import { Link } from '@tanstack/react-router';
import { useLang } from '../lang';
import { mockComplaints, categories, locations, STATUS_STYLES, STEPS } from '../data/mockData';

function speak(text: string) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'hi-IN';
    u.rate = 0.92;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch (_) { /* noop */ }
}

export function TrackPage() {
  const { t } = useLang();
  const complaints = mockComplaints;
  const latest = complaints[0];
  const earlier = complaints.slice(1);

  if (!latest) {
    return (
      <div className="flex min-h-dvh flex-col bg-cream items-center justify-center">
        <p className="text-dark-muted">No complaints yet</p>
      </div>
    );
  }

  const latestCat = categories[latest.catIndex];
  const latestSub = latestCat?.subs[latest.subIndex];
  const latestLoc = locations[latest.locIndex];

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      {/* Header */}
      <div className="px-5 pt-2 pb-3">
        <div className="text-3xl font-extrabold leading-tight">{t('track.title')}</div>
        <div className="text-sm text-dark-muted">{t('track.titleSub')}</div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-4 flex flex-col gap-3">
        {/* Latest complaint - detailed card with journey */}
        {latestCat && latestSub && latestLoc && (
          <div className="rounded-3xl bg-white p-5 flex flex-col gap-4" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
            <div className="flex items-center gap-3">
              <span
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-none"
                style={{ background: latestCat.bg }}
              >
                <span className="material-symbols-rounded text-3xl" style={{ color: latestCat.fg }}>
                  {latestSub.icon}
                </span>
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-xl font-extrabold leading-tight">{latestSub.hi}</div>
                <div className="text-xs text-dark-muted">{latest.caseNumber} · {latestLoc.hi}</div>
              </div>
            </div>

            {/* Progress steps */}
            <div className="flex flex-col">
              {STEPS.map((step, k) => {
                const isDone = k < latest.step;
                const isCurrent = k === latest.step;
                const isFuture = k > latest.step;
                return (
                  <div key={k} className="flex gap-4">
                    <div className="flex flex-col items-center w-10 flex-none">
                      <span
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{
                          background: isDone ? '#2F7D4F' : isCurrent ? '#C24E33' : '#fff',
                          color: isDone || isCurrent ? '#fff' : '#B5A593',
                          border: isFuture ? '2px solid #DCCFBF' : 'none',
                        }}
                      >
                        <span className="material-symbols-rounded text-xl">
                          {isDone ? 'check' : isCurrent ? STATUS_STYLES[k]?.icon : 'radio_button_unchecked'}
                        </span>
                      </span>
                      {k < 3 && (
                        <span
                          className="w-1 h-6 rounded"
                          style={{ background: isDone ? '#2F7D4F' : '#E3D6C6' }}
                        />
                      )}
                    </div>
                    <div className="pt-1.5 leading-tight" style={{ color: isFuture ? '#8A7766' : '#2A1F17' }}>
                      <span className="text-lg font-bold">{step.hi}</span>
                      <span className="text-sm ml-1">· {step.en}</span>
                      {latest.times[k] && (
                        <div className="text-xs text-dark-muted">{latest.times[k]}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Worker info */}
            <div className="rounded-2xl bg-cream p-3 text-sm leading-relaxed">
              <b>{latest.workerName}</b> · {latest.workerRole}
              <br />{latest.dueText}
            </div>

            {/* Listen button */}
            <button
              onClick={() => speak(`${latestSub.hi}। स्थिति: ${STATUS_STYLES[latest.step]?.hi}। ${latest.workerName}।`)}
              className="h-14 rounded-2xl bg-primary text-white flex items-center justify-center gap-3 font-bold text-lg"
            >
              <span className="material-symbols-rounded text-3xl">volume_up</span>
              {t('track.status')}
            </button>
          </div>
        )}

        {/* Earlier complaints */}
        {earlier.length > 0 && (
          <>
            <div className="text-base font-bold mt-2">
              {t('track.earlier')} <span className="text-sm font-normal text-dark-muted">· {t('track.earlierSub')}</span>
            </div>
            {earlier.map((m) => {
              const mCat = categories[m.catIndex];
              const mSub = mCat?.subs[m.subIndex];
              const mSt = STATUS_STYLES[m.step];
              if (!mCat || !mSub || !mSt) return null;
              return (
                <Link
                  key={m.id}
                  to="/complaint/$id"
                  params={{ id: m.id }}
                  className="flex items-center gap-3 rounded-2xl bg-white p-3 text-left"
                  style={{ boxShadow: '0 1px 0 #EADFD2' }}
                >
                  <span
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-none"
                    style={{ background: mCat.bg }}
                  >
                    <span className="material-symbols-rounded text-2xl" style={{ color: mCat.fg }}>{mSub.icon}</span>
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-bold leading-tight">{mSub.hi}</div>
                    <div className="text-xs text-dark-muted">{m.caseNumber}</div>
                  </div>
                  <span
                    className="flex items-center gap-1 h-8 px-3 rounded-2xl text-sm font-bold flex-none"
                    style={{ background: mSt.bg, color: mSt.fg }}
                  >
                    <span className="material-symbols-rounded text-lg">{mSt.icon}</span>
                    {mSt.hi}
                  </span>
                </Link>
              );
            })}
          </>
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="flex-none h-20 bg-white flex gap-1.5 px-2.5 pt-1.5 pb-3" style={{ borderTop: '1px solid #EADFD2' }}>
        <NavBtn icon="home" hi="होम" en="Home" to="/home" />
        <NavBtn icon="mic" hi="बोलें" en="Speak" to="/register" search={{ category: '__voice__' }} />
        <NavBtn icon="list_alt" hi="मेरी शिकायतें" en="My complaints" to="/track" active />
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
