import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { useLang } from '../lang';
import { categories, locations, STATUS_STYLES, STEPS, mockComplaints } from '../data/mockData';
import { getComplaints, type StoredComplaint } from '../store';
import { speak } from '../media';

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

interface DisplayComplaint {
  id: string;
  caseNumber: string;
  catIndex: number;
  subIndex: number;
  locIndex: number;
  date: string;
  step: number;
  times: string[];
  workerName: string;
  workerRole: string;
  dueText: string;
  isStored: boolean;
  storedData?: StoredComplaint;
}

function storedToDisplay(c: StoredComplaint): DisplayComplaint {
  const catIdx = categories.findIndex(cat => cat.id === c.categoryId);
  const subIdx = catIdx >= 0 ? categories[catIdx]!.subs.findIndex(s => s.id === c.subtypeId) : -1;
  const locIdx = locations.findIndex(l => l.hi === c.locationHi);
  const step = statusToStep(c.status);
  const regDate = new Date(c.registeredAt);
  const dateStr = regDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

  return {
    id: c.id,
    caseNumber: c.caseNumber,
    catIndex: catIdx >= 0 ? catIdx : 0,
    subIndex: subIdx >= 0 ? subIdx : 0,
    locIndex: locIdx >= 0 ? locIdx : 0,
    date: dateStr,
    step,
    times: [
      dateStr,
      c.assignee ? dateStr : '',
      c.status === 'RESOLVED' || c.status === 'CLOSED' || c.status === 'ATR_SUBMITTED' ? dateStr : '',
      c.status === 'CLOSED' ? dateStr : '',
    ],
    workerName: c.assignee || 'Pending',
    workerRole: c.assigneeDesignation || c.department,
    dueText: new Date(c.slaDueAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
    isStored: true,
    storedData: c,
  };
}

export function TrackPage() {
  const { t } = useLang();
  const [complaints, setComplaints] = useState<DisplayComplaint[]>([]);

  useEffect(() => {
    const stored = getComplaints().map(storedToDisplay);
    const mocks = mockComplaints.map(m => ({ ...m, isStored: false, step: m.step as number }));
    setComplaints([...stored, ...mocks]);
  }, []);

  const latest = complaints[0];
  const earlier = complaints.slice(1);

  if (!latest) {
    return (
      <div className="flex min-h-dvh flex-col bg-cream">
        <div className="px-5 pt-2 pb-3">
          <div className="text-3xl font-extrabold leading-tight">{t('track.title')}</div>
          <div className="text-sm text-dark-muted">{t('track.titleSub')}</div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
          <span className="material-symbols-rounded text-7xl text-dark-faint">inbox</span>
          <div>
            <p className="text-xl font-bold text-dark">{t('track.noComplaints')}</p>
            <p className="text-sm text-dark-muted mt-1">{t('track.noComplaintsSub')}</p>
          </div>
          <Link
            to="/home"
            className="h-14 px-6 rounded-2xl bg-primary text-white font-bold text-lg flex items-center gap-2"
          >
            <span className="material-symbols-rounded text-2xl">add</span>
            {t('track.fileNew')}
          </Link>
        </div>
        <nav className="flex-none h-20 bg-white flex gap-1.5 px-2.5 pt-1.5 pb-3" style={{ borderTop: '1px solid #EADFD2' }}>
          <NavBtn icon="home" hi="होम" en="Home" to="/home" />
          <NavBtn icon="mic" hi="बोलें" en="Speak" to="/register" search={{ category: '__voice__' }} />
          <NavBtn icon="list_alt" hi="मेरी शिकायतें" en="My complaints" to="/track" active />
        </nav>
      </div>
    );
  }

  const latestCat = latest.storedData
    ? { hi: latest.storedData.categoryHi, bg: latest.storedData.categoryBg, fg: latest.storedData.categoryFg, subs: [] as never[] }
    : categories[latest.catIndex];
  const latestSub = latest.storedData
    ? { hi: latest.storedData.subtypeHi, en: latest.storedData.subtypeEn, icon: latest.storedData.subtypeIcon }
    : latestCat && 'subs' in latestCat ? (latestCat as typeof categories[number]).subs[latest.subIndex] : null;
  const latestLoc = latest.storedData
    ? { hi: latest.storedData.locationHi }
    : locations[latest.locIndex];

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
              onClick={() => speak(`${latestSub.hi}। स्थिति: ${STATUS_STYLES[latest.step]?.hi ?? 'प्रक्रिया में'}। ${latest.workerName}।`)}
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
              const mCat = m.storedData
                ? { hi: m.storedData.categoryHi, bg: m.storedData.categoryBg, fg: m.storedData.categoryFg }
                : categories[m.catIndex];
              const mSub = m.storedData
                ? { hi: m.storedData.subtypeHi, icon: m.storedData.subtypeIcon }
                : mCat && 'subs' in mCat ? (mCat as typeof categories[number]).subs[m.subIndex] : null;
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
