import { useState } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { useLang } from '../lang';
import { mockComplaints, categories, locations, STEPS, STATUS_STYLES } from '../data/mockData';

function speak(text: string) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'hi-IN';
    u.rate = 0.92;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch { /* noop */ }
}

export function DetailPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const { t } = useLang();
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const complaint = mockComplaints.find((c) => c.id === id);
  if (!complaint) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-cream">
        <p className="text-dark-muted">Not found</p>
      </div>
    );
  }

  const cat = categories[complaint.catIndex];
  const sub = cat?.subs[complaint.subIndex];
  const loc = locations[complaint.locIndex];
  const status = STATUS_STYLES[complaint.step];

  if (!cat || !sub || !loc || !status) return null;

  const isWorkDone = complaint.step === 2;
  const isClosed = complaint.step === 3;
  const showFeedback = isWorkDone && !feedback;

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-2 pb-3">
        <Link
          to="/track"
          className="w-12 h-12 rounded-full bg-cream-dark text-dark flex items-center justify-center flex-none"
          aria-label="Back"
        >
          <span className="material-symbols-rounded text-3xl">arrow_back</span>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="text-lg font-extrabold leading-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {complaint.caseNumber}
          </div>
          <div className="text-sm text-dark-muted">{complaint.date} · {loc.hi}</div>
        </div>
        <button
          onClick={() => speak(`${sub.hi}। स्थिति: ${status.hi}। ${complaint.workerName}।`)}
          className="w-12 h-12 rounded-full bg-primary-light text-primary flex items-center justify-center flex-none"
          aria-label="Listen"
        >
          <span className="material-symbols-rounded text-3xl">volume_up</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-6 flex flex-col gap-4">
        {/* Main info card */}
        <div className="rounded-3xl bg-white p-5 flex flex-col gap-5" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
          {/* Category + subcategory */}
          <div className="flex items-center gap-3">
            <span
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-none"
              style={{ background: cat.bg }}
            >
              <span className="material-symbols-rounded text-3xl" style={{ color: cat.fg }}>{sub.icon}</span>
            </span>
            <div>
              <div className="text-xl font-extrabold leading-tight">{sub.hi}</div>
              <div className="text-sm text-dark-muted">{sub.en}</div>
            </div>
          </div>

          {/* Horizontal progress stepper */}
          <div className="grid grid-cols-4">
            {STEPS.map((step, k) => {
              const isDone = k < complaint.step;
              const isCurrent = k === complaint.step;
              const isFuture = k > complaint.step;
              return (
                <div key={k} className="flex flex-col items-center gap-1.5 relative">
                  {k < 3 && (
                    <span
                      className="absolute h-1 rounded"
                      style={{
                        top: 19,
                        left: '50%',
                        width: '100%',
                        background: isDone ? '#2F7D4F' : '#E3D6C6',
                      }}
                    />
                  )}
                  <span
                    className="relative w-10 h-10 rounded-full flex items-center justify-center"
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
                  <span className="text-sm font-bold text-center leading-tight" style={{ color: isFuture ? '#8A7766' : '#2A1F17' }}>
                    {step.hi}
                  </span>
                  <span className="text-[11px] text-dark-muted leading-none">{step.en}</span>
                </div>
              );
            })}
          </div>

          {/* Worker info */}
          <div className="flex gap-3 items-start rounded-2xl bg-cream p-3">
            <span className="material-symbols-rounded text-2xl text-primary">engineering</span>
            <div className="leading-relaxed">
              <div className="text-base font-bold">{complaint.workerName}</div>
              <div className="text-sm text-dark-secondary">{complaint.dueText}</div>
            </div>
          </div>
        </div>

        {/* ATR photo (after work done) */}
        {isWorkDone && (
          <div className="rounded-3xl bg-white p-4 flex flex-col gap-3" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
            <div className="text-sm font-bold text-dark-muted">{t('detail.atrPhoto')}</div>
            <div
              className="h-36 rounded-2xl relative"
              style={{ background: 'repeating-linear-gradient(135deg, #E9DFD2 0 10px, #F1E8DD 10px 20px)' }}
            >
              <span className="absolute left-3 bottom-2 text-xs text-dark-muted" style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}>
                ATR photo · 2 Oct 11:20 · GPS ✓
              </span>
            </div>
          </div>
        )}

        {/* Feedback section */}
        {showFeedback && (
          <div className="rounded-3xl bg-white p-5 flex flex-col gap-4" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="text-2xl font-extrabold leading-tight">{t('feedback.title')}</div>
                <div className="text-sm text-dark-muted">{t('feedback.titleSub')}</div>
              </div>
              <button
                onClick={() => speak('क्या काम ठीक हुआ? हाँ के लिए हरा बटन, नहीं के लिए लाल बटन दबाइए।')}
                className="w-12 h-12 rounded-full bg-primary-light text-primary flex items-center justify-center flex-none"
              >
                <span className="material-symbols-rounded text-3xl">volume_up</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFeedback('up')}
                className="h-28 rounded-3xl bg-success text-white flex flex-col items-center justify-center gap-1"
              >
                <span className="material-symbols-rounded text-5xl">thumb_up</span>
                <span className="text-xl font-bold">{t('feedback.yes')}</span>
              </button>
              <button
                onClick={() => setFeedback('down')}
                className="h-28 rounded-3xl bg-danger text-white flex flex-col items-center justify-center gap-1"
              >
                <span className="material-symbols-rounded text-5xl">thumb_down</span>
                <span className="text-xl font-bold">{t('feedback.no')}</span>
              </button>
            </div>
            <button className="h-12 border-2 border-cream-darker rounded-2xl bg-white text-dark flex items-center justify-center gap-2 font-bold text-base">
              <span className="material-symbols-rounded text-2xl text-primary">mic</span>
              {t('feedback.voice')}
            </button>
          </div>
        )}

        {/* Feedback result: thumbs up */}
        {feedback === 'up' && (
          <div className="rounded-3xl bg-success-light p-4 flex gap-3 items-center">
            <span className="material-symbols-rounded text-4xl text-success">sentiment_satisfied</span>
            <div className="leading-relaxed">
              <div className="text-lg font-extrabold" style={{ color: '#1F5536' }}>{t('feedback.thanks')}</div>
              <div className="text-sm" style={{ color: '#2F6A47' }}>{t('feedback.thanksSub')}</div>
            </div>
          </div>
        )}

        {/* Feedback result: thumbs down */}
        {feedback === 'down' && (
          <div className="rounded-3xl p-4 flex gap-3 items-center" style={{ background: '#FBEBC8' }}>
            <span className="material-symbols-rounded text-4xl" style={{ color: '#8A5A00' }}>restart_alt</span>
            <div className="leading-relaxed">
              <div className="text-lg font-extrabold" style={{ color: '#4A3300' }}>{t('feedback.reopened')}</div>
              <div className="text-sm" style={{ color: '#6B4A0A' }}>{t('feedback.reopenedSub')}</div>
            </div>
          </div>
        )}

        {/* Closed state */}
        {isClosed && (
          <div className="rounded-3xl p-4 flex gap-3 items-center" style={{ background: '#E9E3DB' }}>
            <span className="material-symbols-rounded text-4xl" style={{ color: '#4A3E34' }}>verified</span>
            <div className="leading-relaxed">
              <div className="text-lg font-extrabold">आपने "हाँ" कहा · You marked it fixed</div>
              <div className="text-sm" style={{ color: '#4A3E34' }}>Closed on 14 Sep</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
