import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useLang } from '../lang';
import { categories, locations, TENANT } from '../data/mockData';

type Step = 'category' | 'subtype' | 'location' | 'media' | 'review' | 'success';

function speak(text: string) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'hi-IN';
    u.rate = 0.92;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch (_) { /* noop */ }
}

export function RegisterPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { category?: string };

  const [step, setStep] = useState<Step>('category');
  const [catIndex, setCatIndex] = useState(-1);
  const [subIndex, setSubIndex] = useState(-1);
  const [locIndex, setLocIndex] = useState(0);
  const [showLocPicker, setShowLocPicker] = useState(false);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const [caseNumber, setCaseNumber] = useState('');
  const [otherText, setOtherText] = useState('');
  const [isOtherSub, setIsOtherSub] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'detecting' | 'done'>('idle');

  useEffect(() => {
    if (search.category === '__voice__') {
      setStep('category');
    } else if (search.category !== undefined) {
      const idx = parseInt(search.category, 10);
      if (!isNaN(idx) && idx >= 0 && idx < categories.length) {
        setCatIndex(idx);
        setStep('subtype');
      }
    }
  }, [search.category]);

  const cat = catIndex >= 0 ? categories[catIndex] : null;
  const sub = cat && subIndex >= 0 ? cat.subs[subIndex] : null;
  const loc = locations[locIndex];

  const flowIdx = { category: 0, subtype: 1, location: 2, media: 3, review: 4, success: 5 }[step] ?? 0;
  const dots = [0, 1, 2, 3, 4].map(i => i <= flowIdx && flowIdx < 5);

  const goBack = useCallback(() => {
    const steps: Step[] = ['category', 'subtype', 'location', 'media', 'review'];
    const idx = steps.indexOf(step);
    if (idx <= 0) void navigate({ to: '/home' });
    else setStep(steps[idx - 1]!);
  }, [step, navigate]);

  function handleSubmit() {
    const num = `${TENANT.prefix}-26-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;
    setCaseNumber(num);
    setStep('success');
  }

  function detectGPS() {
    setGpsStatus('detecting');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setGpsStatus('done'),
        () => setGpsStatus('done'),
        { timeout: 5000 }
      );
    } else {
      setTimeout(() => setGpsStatus('done'), 1500);
    }
  }

  if (step === 'success') {
    return (
      <div className="flex min-h-dvh flex-col bg-cream">
        <div className="flex-1 overflow-y-auto px-5 pt-8 flex flex-col items-center text-center gap-4">
          <span className="w-28 h-28 rounded-full bg-success text-white flex items-center justify-center" style={{ boxShadow: '0 0 0 14px #DCEFE2' }}>
            <span className="material-symbols-rounded text-7xl">check</span>
          </span>
          <div className="mt-4">
            <div className="text-3xl font-extrabold leading-tight">{t('success.title')}</div>
            <div className="text-base text-dark-muted">{t('success.titleSub')}</div>
          </div>
          <div className="w-full rounded-3xl bg-white p-5 flex flex-col items-center gap-3" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
            <div className="text-sm font-bold text-dark-muted tracking-wider">{t('success.number')}</div>
            <div className="text-4xl font-extrabold tracking-wider" style={{ fontVariantNumeric: 'tabular-nums' }}>{caseNumber}</div>
            <button
              onClick={() => speak(`आपका शिकायत नंबर है ${caseNumber}`)}
              className="h-14 px-5 rounded-full bg-primary-light text-primary flex items-center gap-2 font-bold text-lg"
            >
              <span className="material-symbols-rounded text-3xl">volume_up</span>
              {t('success.hear')}
            </button>
          </div>
          <div className="flex flex-col gap-2 w-full text-left">
            <div className="flex gap-3 items-center text-base">
              <span className="material-symbols-rounded text-2xl text-success">chat</span>
              {t('success.whatsapp')}
            </div>
            {cat && sub && (
              <div className="flex gap-3 items-center text-base">
                <span className="material-symbols-rounded text-2xl text-success">schedule</span>
                {sub.sla} में काम होगा · within {sub.slaEn}
              </div>
            )}
          </div>
          {!hasPhoto && !hasVideo && (
            <button
              onClick={() => { setStep('media'); }}
              className="w-full h-14 border-2 border-dashed border-primary rounded-2xl bg-primary-lighter text-primary flex items-center justify-center gap-3 font-bold text-lg"
            >
              <span className="material-symbols-rounded text-3xl">add_a_photo</span>
              {t('success.addPhoto')}
            </button>
          )}
        </div>
        <div className="flex-none px-5 pb-6 pt-2 flex gap-3">
          <button
            onClick={() => void navigate({ to: '/home' })}
            className="flex-1 h-16 border-2 border-cream-darker rounded-2xl bg-white text-dark font-bold text-lg flex items-center justify-center gap-2"
          >
            <span className="material-symbols-rounded text-2xl">home</span>
            {t('success.home')}
          </button>
          <button
            onClick={() => void navigate({ to: '/track' })}
            className="flex-[1.6] h-16 rounded-2xl bg-primary text-white font-bold text-lg flex items-center justify-center gap-2"
          >
            <span className="material-symbols-rounded text-2xl">list_alt</span>
            {t('success.myComplaints')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-2 pb-3">
        <button
          onClick={goBack}
          className="w-12 h-12 rounded-full bg-cream-dark text-dark flex items-center justify-center flex-none"
          aria-label="Back"
        >
          <span className="material-symbols-rounded text-3xl">arrow_back</span>
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-xl font-extrabold leading-tight">
            {step === 'category' ? t('cat.title') : step === 'subtype' ? t('sub.title') : step === 'location' ? t('loc.title') : step === 'media' ? t('media.title') : t('review.title')}
          </div>
          <div className="text-sm text-dark-muted">
            {step === 'category' ? t('cat.titleSub') : step === 'subtype' ? t('sub.titleSub') : step === 'location' ? t('loc.titleSub') : step === 'media' ? t('media.titleSub') : t('review.titleSub')}
          </div>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 px-5 pb-3">
        {dots.map((filled, i) => (
          <div key={i} className="flex-1 h-1.5 rounded-full" style={{ background: filled ? '#C24E33' : '#E7DCCD' }} />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-4">
        {step === 'category' && (
          <div className="grid grid-cols-2 gap-3">
            {categories.map((c, i) => (
              <button
                key={c.id}
                onClick={() => { setCatIndex(i); setSubIndex(-1); setIsOtherSub(false); setOtherText(''); setStep('subtype'); }}
                className="flex items-center gap-3 rounded-2xl bg-white p-4 text-left"
                style={{ boxShadow: '0 1px 0 #EADFD2' }}
              >
                <span
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-none"
                  style={{ background: c.bg }}
                >
                  <span className="material-symbols-rounded text-3xl" style={{ color: c.fg }}>{c.icon}</span>
                </span>
                <div className="min-w-0">
                  <div className="text-base font-bold text-dark leading-tight">{c.hi}</div>
                  <div className="text-xs text-dark-muted">{c.en}</div>
                </div>
              </button>
            ))}
            {/* Other option */}
            <button
              onClick={() => { setCatIndex(-1); setSubIndex(-1); setIsOtherSub(true); setStep('location'); }}
              className="flex items-center gap-3 rounded-2xl bg-white p-4 text-left col-span-2"
              style={{ boxShadow: '0 1px 0 #EADFD2' }}
            >
              <span className="w-14 h-14 rounded-2xl flex items-center justify-center flex-none bg-primary-light">
                <span className="material-symbols-rounded text-3xl text-primary">mic</span>
              </span>
              <div className="min-w-0">
                <div className="text-base font-bold text-dark leading-tight">{t('cat.other')}</div>
                <div className="text-xs text-dark-muted">{t('cat.otherSub')}</div>
              </div>
            </button>
          </div>
        )}

        {step === 'subtype' && cat && (
          <div className="flex flex-col gap-3">
            {cat.subs.map((s, i) => (
              <button
                key={s.id}
                onClick={() => { setSubIndex(i); setIsOtherSub(false); setStep('location'); }}
                className="flex items-center gap-3 rounded-2xl bg-white p-4 text-left"
                style={{ boxShadow: '0 1px 0 #EADFD2' }}
              >
                <span
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-none"
                  style={{ background: cat.bg }}
                >
                  <span className="material-symbols-rounded text-3xl" style={{ color: cat.fg }}>{s.icon}</span>
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-bold text-dark leading-tight">{s.hi}</div>
                  <div className="text-xs text-dark-muted">{s.en}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="material-symbols-rounded text-sm text-dark-faint">schedule</span>
                    <span className="text-xs text-dark-faint">{s.sla} · {s.slaEn}</span>
                  </div>
                </div>
              </button>
            ))}
            {/* Other option */}
            <button
              onClick={() => { setSubIndex(-1); setIsOtherSub(true); setStep('location'); }}
              className="flex items-center gap-3 rounded-2xl bg-white p-4 text-left"
              style={{ boxShadow: '0 1px 0 #EADFD2' }}
            >
              <span
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-none bg-primary-light"
              >
                <span className="material-symbols-rounded text-3xl text-primary">edit_note</span>
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-base font-bold text-dark leading-tight">{t('sub.other')}</div>
                <div className="text-xs text-dark-muted">{t('sub.otherSub')}</div>
              </div>
            </button>
          </div>
        )}

        {step === 'location' && (
          <div className="flex flex-col gap-4">
            {isOtherSub && (
              <div className="rounded-2xl bg-white p-4" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
                <div className="text-sm font-bold text-dark-muted mb-2">{t('sub.other')} · {t('sub.otherSub')}</div>
                <textarea
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  placeholder={t('other.placeholder')}
                  rows={3}
                  className="w-full rounded-xl border-2 border-cream-darker px-4 py-3 text-base outline-none focus:border-primary bg-cream resize-none"
                />
              </div>
            )}

            {/* Map placeholder */}
            <div className="h-40 rounded-3xl overflow-hidden relative" style={{ background: 'repeating-linear-gradient(135deg, #EDE3D6 0 12px, #F4ECE1 12px 24px)' }}>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center">
                <span className="material-symbols-rounded text-3xl">location_on</span>
              </div>
              {gpsStatus === 'detecting' && (
                <div className="absolute inset-0 bg-dark/30 flex items-center justify-center">
                  <div className="bg-white rounded-2xl px-5 py-3 text-center">
                    <span className="material-symbols-rounded text-3xl text-primary animate-spin">sync</span>
                    <div className="text-sm font-bold mt-1">{t('loc.detecting')}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Current location */}
            <div className="rounded-2xl bg-white p-4 flex items-center gap-3" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
              <span className="material-symbols-rounded text-3xl text-primary">location_on</span>
              <div className="flex-1 min-w-0">
                <div className="text-lg font-bold">{loc?.hi}</div>
                <div className="text-sm text-dark-muted">{loc?.landmark}</div>
              </div>
            </div>

            {/* GPS button */}
            {gpsStatus !== 'done' && (
              <button
                onClick={detectGPS}
                className="h-14 rounded-2xl border-2 border-cream-darker bg-white text-dark flex items-center justify-center gap-3 font-bold text-lg"
              >
                <span className="material-symbols-rounded text-2xl text-primary">my_location</span>
                {t('loc.gps')}
              </button>
            )}
            {gpsStatus === 'done' && (
              <div className="flex items-center gap-2 text-sm text-success font-bold px-2">
                <span className="material-symbols-rounded text-xl">check_circle</span>
                GPS location detected
              </div>
            )}

            {/* Location picker */}
            <button
              onClick={() => setShowLocPicker(!showLocPicker)}
              className="text-sm font-bold text-primary flex items-center gap-1 px-2"
            >
              <span className="material-symbols-rounded text-lg">swap_horiz</span>
              {t('loc.change')}
            </button>

            {showLocPicker && (
              <div className="flex flex-col gap-2">
                {locations.map((l, i) => (
                  <button
                    key={l.id}
                    onClick={() => { setLocIndex(i); setShowLocPicker(false); }}
                    className="flex items-center gap-3 rounded-xl p-3 text-left"
                    style={{
                      background: i === locIndex ? '#FDF0EA' : '#fff',
                      border: `2px solid ${i === locIndex ? '#C24E33' : '#EADFD2'}`,
                    }}
                  >
                    <span className="material-symbols-rounded text-2xl text-primary">location_on</span>
                    <div>
                      <div className="text-base font-bold">{l.hi}</div>
                      <div className="text-xs text-dark-muted">{l.landmark}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'media' && (
          <div className="flex flex-col gap-4">
            {/* Photo section */}
            <div className="rounded-2xl bg-white p-4 flex flex-col gap-3" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
              {!hasPhoto ? (
                <button
                  onClick={() => setHasPhoto(true)}
                  className="h-36 rounded-2xl border-2 border-dashed border-cream-darker bg-cream flex flex-col items-center justify-center gap-2"
                >
                  <span className="material-symbols-rounded text-5xl text-dark-faint">add_a_photo</span>
                  <div className="text-base font-bold text-dark">{t('media.photo')}</div>
                  <div className="text-xs text-dark-muted">{t('media.photoSub')}</div>
                </button>
              ) : (
                <div className="relative">
                  <div className="h-36 rounded-2xl" style={{ background: 'repeating-linear-gradient(135deg, #E9DFD2 0 10px, #F1E8DD 10px 20px)' }} />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <span className="bg-success text-white rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1">
                      <span className="material-symbols-rounded text-sm">check</span>
                      {t('media.added')}
                    </span>
                    <button
                      onClick={() => setHasPhoto(false)}
                      className="bg-white rounded-full px-3 py-1 text-xs font-bold text-dark-muted"
                    >
                      {t('media.retake')}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Video section */}
            <div className="rounded-2xl bg-white p-4 flex flex-col gap-3" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
              {!hasVideo ? (
                <button
                  onClick={() => setHasVideo(true)}
                  className="h-36 rounded-2xl border-2 border-dashed border-cream-darker bg-cream flex flex-col items-center justify-center gap-2"
                >
                  <span className="material-symbols-rounded text-5xl text-dark-faint">videocam</span>
                  <div className="text-base font-bold text-dark">{t('media.video')}</div>
                  <div className="text-xs text-dark-muted">{t('media.videoSub')}</div>
                </button>
              ) : (
                <div className="relative">
                  <div className="h-36 rounded-2xl flex items-center justify-center" style={{ background: 'repeating-linear-gradient(135deg, #E9DFD2 0 10px, #F1E8DD 10px 20px)' }}>
                    <span className="material-symbols-rounded text-5xl text-dark-faint">play_circle</span>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-2">
                    <span className="bg-success text-white rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1">
                      <span className="material-symbols-rounded text-sm">check</span>
                      {t('media.added')}
                    </span>
                    <button
                      onClick={() => setHasVideo(false)}
                      className="bg-white rounded-full px-3 py-1 text-xs font-bold text-dark-muted"
                    >
                      {t('media.retake')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="flex flex-col gap-4">
            <div className="rounded-3xl bg-white p-5 flex flex-col gap-4" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
              {/* Category & subcategory */}
              {cat && sub ? (
                <div className="flex items-center gap-4">
                  <span className="w-16 h-16 rounded-2xl flex items-center justify-center flex-none" style={{ background: cat.bg }}>
                    <span className="material-symbols-rounded text-4xl" style={{ color: cat.fg }}>{sub.icon}</span>
                  </span>
                  <div>
                    <div className="text-2xl font-extrabold leading-tight">{sub.hi}</div>
                    <div className="text-sm text-dark-muted">{sub.en}</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <span className="w-16 h-16 rounded-2xl flex items-center justify-center flex-none bg-primary-light">
                    <span className="material-symbols-rounded text-4xl text-primary">edit_note</span>
                  </span>
                  <div>
                    <div className="text-2xl font-extrabold leading-tight">{t('cat.other')}</div>
                    {otherText && <div className="text-sm text-dark-muted mt-1">"{otherText}"</div>}
                  </div>
                </div>
              )}

              <div className="h-px bg-cream-darker" />

              {/* Location */}
              <div className="flex gap-3 items-center">
                <span className="material-symbols-rounded text-2xl text-primary">location_on</span>
                <div className="leading-tight">
                  <div className="text-lg font-bold">{loc?.hi}</div>
                  <div className="text-sm text-dark-muted">{loc?.landmark}</div>
                </div>
              </div>

              {/* Media */}
              <div className="flex gap-3 items-center">
                <span className="material-symbols-rounded text-2xl text-primary">photo_camera</span>
                <div className="text-base">
                  {hasPhoto && hasVideo ? `1 ${t('review.photo')}, 1 ${t('review.video')}`
                    : hasPhoto ? `1 ${t('review.photo')}`
                    : hasVideo ? `1 ${t('review.video')}`
                    : t('review.noMedia')}
                </div>
              </div>

              {/* SLA */}
              {sub && (
                <div className="flex gap-3 items-center">
                  <span className="material-symbols-rounded text-2xl text-primary">schedule</span>
                  <div className="text-base">{sub.sla} {t('sub.slaLabel')} {sub.slaEn}</div>
                </div>
              )}
            </div>

            {/* Listen button */}
            <button
              onClick={() => {
                const text = sub
                  ? `आप दर्ज करा रहे हैं: ${sub.hi}, ${loc?.hi ?? ''}। ${sub.sla} में काम होगा।`
                  : `आप दर्ज करा रहे हैं: ${otherText || 'अन्य समस्या'}, ${loc?.hi ?? ''}।`;
                speak(text);
              }}
              className="h-14 rounded-2xl bg-primary-light text-primary flex items-center justify-center gap-3 font-bold text-lg"
            >
              <span className="material-symbols-rounded text-3xl">volume_up</span>
              {t('review.listen')}
            </button>
          </div>
        )}
      </div>

      {/* Footer action buttons */}
      {step !== 'category' && step !== 'subtype' && (
        <div className="flex-none px-5 pb-6 pt-2">
          {step === 'location' && (
            <button
              onClick={() => { setStep('media'); }}
              className="w-full h-16 rounded-2xl bg-primary text-white font-bold text-xl flex items-center justify-center gap-3"
            >
              <span className="material-symbols-rounded text-3xl">check</span>
              {t('loc.yes')}
            </button>
          )}
          {step === 'media' && (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setStep('review')}
                className="w-full h-16 rounded-2xl bg-primary text-white font-bold text-xl flex items-center justify-center gap-3"
              >
                <span className="material-symbols-rounded text-3xl">arrow_forward</span>
                {hasPhoto || hasVideo ? t('review.title') : t('media.skip')}
              </button>
            </div>
          )}
          {step === 'review' && (
            <button
              onClick={handleSubmit}
              className="w-full h-16 rounded-2xl bg-primary text-white font-bold text-xl flex items-center justify-center gap-3"
            >
              <span className="material-symbols-rounded text-3xl">send</span>
              {t('review.send')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
