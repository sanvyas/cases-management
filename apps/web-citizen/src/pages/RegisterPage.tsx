import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useLang } from '../lang';
import { categories, locations } from '../data/mockData';
import { saveComplaint, detectDepartmentFromTranscript, getCitizenUser } from '../store';
import { MapPicker } from '../components/MapPicker';

type Step = 'voice_record' | 'category' | 'subtype' | 'location' | 'media' | 'review' | 'success';

function speak(text: string) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'hi-IN';
    u.rate = 0.92;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch { /* noop */ }
}

export function RegisterPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { category?: string };

  const [step, setStep] = useState<Step>('category');
  const [catIndex, setCatIndex] = useState(-1);
  const [subIndex, setSubIndex] = useState(-1);
  const [locIndex, setLocIndex] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [caseNumber, setCaseNumber] = useState('');
  const [otherText, setOtherText] = useState('');
  const [isOtherSub, setIsOtherSub] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'detecting' | 'done' | 'error'>('idle');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsAddress, setGpsAddress] = useState('');

  const [isRecording, setIsRecording] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [transcript, setTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [detectedDept, setDetectedDept] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (search.category === '__voice__') {
      setStep('voice_record');
    } else if (search.category !== undefined) {
      const idx = parseInt(search.category, 10);
      if (!isNaN(idx) && idx >= 0 && idx < categories.length) {
        setCatIndex(idx);
        setStep('subtype');
      }
    }
  }, [search.category]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* noop */ }
      }
    };
  }, []);

  const cat = catIndex >= 0 ? categories[catIndex] : null;
  const sub = cat && subIndex >= 0 ? cat.subs[subIndex] : null;
  const loc = locations[locIndex];

  const isVoiceFlow = step === 'voice_record' || (voiceBlob && !cat);
  const flowSteps: Step[] = isVoiceFlow
    ? ['voice_record', 'location', 'media', 'review']
    : ['category', 'subtype', 'location', 'media', 'review'];
  const flowIdx = flowSteps.indexOf(step);
  const dots = flowSteps.map((_, i) => i <= flowIdx && step !== 'success');

  const goBack = useCallback(() => {
    const idx = flowSteps.indexOf(step);
    if (idx <= 0) void navigate({ to: '/home' });
    else setStep(flowSteps[idx - 1]!);
  }, [step, navigate, flowSteps]);

  function startTranscription() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let final = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i]!.isFinal) {
          final += event.results[i]![0]!.transcript + ' ';
        }
      }
      if (final.trim()) {
        setTranscript(final.trim());
      }
    };

    recognition.onerror = () => {
      setIsTranscribing(false);
    };

    recognition.onend = () => {
      setIsTranscribing(false);
    };

    setIsTranscribing(true);
    recognition.start();
  }

  function stopTranscription() {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* noop */ }
    }
    setIsTranscribing(false);

    if (transcript) {
      const match = detectDepartmentFromTranscript(transcript);
      if (match && match.categoryIndex >= 0) {
        setCatIndex(match.categoryIndex);
        setDetectedDept(match.department);
      }
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setVoiceBlob(blob);
        setVoiceUrl(URL.createObjectURL(blob));
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        stopTranscription();
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingTime(0);
      setTranscript('');
      setDetectedDept('');
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
      startTranscription();
    } catch {
      speak('माइक नहीं मिला। कृपया अनुमति दें।');
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }

  function handlePhotoCapture() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = () => {
      if (input.files?.[0]) {
        const url = URL.createObjectURL(input.files[0]);
        setPhotos(prev => [...prev, url]);
      }
    };
    input.click();
  }

  function handleVideoCapture() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.capture = 'environment';
    input.onchange = () => {
      if (input.files?.[0]) {
        setVideoUrl(URL.createObjectURL(input.files[0]));
      }
    };
    input.click();
  }

  function handleSubmit() {
    const citizen = getCitizenUser();
    const num = saveComplaint({
      catIndex,
      subIndex,
      locIndex,
      gpsCoords,
      gpsAddress,
      photoCount: photos.length,
      hasVideo: !!videoUrl,
      hasVoice: !!voiceBlob,
      voiceTranscript: transcript,
      description: otherText || transcript || '',
      citizenPhone: citizen?.phone || '',
      citizenName: citizen?.name || '',
    });
    setCaseNumber(num);
    setStep('success');
  }

  function detectGPS() {
    setGpsStatus('detecting');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGpsAddress(`${pos.coords.latitude.toFixed(5)}°N, ${pos.coords.longitude.toFixed(5)}°E`);
          setGpsStatus('done');
        },
        () => {
          setGpsStatus('error');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setGpsStatus('error');
    }
  }

  function handleMapSelect(lat: number, lng: number, address: string) {
    setGpsCoords({ lat, lng });
    setGpsAddress(address || `${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E`);
    setGpsStatus('done');
    setShowMap(false);
  }

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
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
      {showMap && (
        <MapPicker
          initialLat={gpsCoords?.lat}
          initialLng={gpsCoords?.lng}
          onSelect={handleMapSelect}
          onClose={() => setShowMap(false)}
        />
      )}

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
            {step === 'voice_record' ? t('voice.title')
              : step === 'category' ? t('cat.title')
              : step === 'subtype' ? t('sub.title')
              : step === 'location' ? t('loc.title')
              : step === 'media' ? t('media.title')
              : t('review.title')}
          </div>
          <div className="text-sm text-dark-muted">
            {step === 'voice_record' ? t('voice.titleSub')
              : step === 'category' ? t('cat.titleSub')
              : step === 'subtype' ? t('sub.titleSub')
              : step === 'location' ? t('loc.titleSub')
              : step === 'media' ? t('media.titleSub')
              : t('review.titleSub')}
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
        {/* VOICE RECORDING FLOW */}
        {step === 'voice_record' && (
          <div className="flex flex-col items-center gap-6 pt-6">
            <div className="text-center">
              <div className="text-lg font-bold text-dark-muted mb-1">{t('voice.instruction')}</div>
            </div>

            {/* Recording area */}
            <div className="w-full rounded-3xl bg-white p-6 flex flex-col items-center gap-4" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
              {!voiceUrl ? (
                <>
                  {/* Mic button */}
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className="w-32 h-32 rounded-full flex items-center justify-center transition-all"
                    style={{
                      background: isRecording ? '#B42318' : '#C24E33',
                      boxShadow: isRecording ? '0 0 0 20px rgba(180,35,24,0.15)' : '0 0 0 12px rgba(194,78,51,0.12)',
                    }}
                  >
                    <span className="material-symbols-rounded text-6xl text-white">
                      {isRecording ? 'stop' : 'mic'}
                    </span>
                  </button>

                  {isRecording && (
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-danger animate-pulse" />
                        <span className="text-2xl font-bold text-dark" style={{ fontVariantNumeric: 'tabular-nums' }}>{formatTime(recordingTime)}</span>
                      </div>
                      <div className="text-sm text-dark-muted">{t('voice.recording')}</div>
                      {isTranscribing && transcript && (
                        <div className="mt-2 w-full rounded-xl bg-cream p-3 text-sm text-dark">
                          <div className="text-xs font-bold text-dark-muted mb-1">{t('voice.transcript')}</div>
                          {transcript}
                        </div>
                      )}
                    </div>
                  )}

                  {!isRecording && (
                    <div className="text-base font-bold text-dark-muted">{t('voice.tapToRecord')}</div>
                  )}
                </>
              ) : (
                <>
                  {/* Playback */}
                  <div className="w-full flex flex-col items-center gap-3">
                    <span className="w-20 h-20 rounded-full bg-success text-white flex items-center justify-center">
                      <span className="material-symbols-rounded text-5xl">check</span>
                    </span>
                    <div className="text-lg font-bold text-success">{t('voice.recorded')}</div>
                    <audio controls src={voiceUrl} className="w-full" />

                    {/* Transcript */}
                    {transcript && (
                      <div className="w-full rounded-xl bg-cream p-4">
                        <div className="text-xs font-bold text-dark-muted mb-1">{t('voice.transcript')}</div>
                        <div className="text-base text-dark">"{transcript}"</div>
                        {detectedDept && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="material-symbols-rounded text-lg text-success">auto_awesome</span>
                            <span className="text-sm font-bold text-success">{t('voice.detected')}: {detectedDept}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => { setVoiceBlob(null); setVoiceUrl(null); setRecordingTime(0); setTranscript(''); setDetectedDept(''); }}
                      className="h-12 px-6 rounded-2xl border-2 border-cream-darker bg-white text-dark font-bold text-sm flex items-center gap-2"
                    >
                      <span className="material-symbols-rounded text-xl">refresh</span>
                      {t('voice.rerecord')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

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
                <span className="material-symbols-rounded text-3xl text-primary">edit_note</span>
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

            {/* GPS Auto-detect */}
            <div className="rounded-2xl bg-white p-4 flex flex-col gap-3" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
              {gpsStatus === 'idle' && (
                <button
                  onClick={detectGPS}
                  className="h-20 rounded-2xl border-2 border-dashed border-primary bg-primary-lighter flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-rounded text-4xl text-primary">my_location</span>
                  <div className="text-left">
                    <div className="text-lg font-bold text-primary">{t('loc.gps')}</div>
                    <div className="text-sm text-dark-muted">{t('loc.gpsSub')}</div>
                  </div>
                </button>
              )}
              {gpsStatus === 'detecting' && (
                <div className="h-20 rounded-2xl bg-cream flex items-center justify-center gap-3">
                  <span className="material-symbols-rounded text-3xl text-primary animate-spin">sync</span>
                  <div className="text-lg font-bold">{t('loc.detecting')}</div>
                </div>
              )}
              {gpsStatus === 'done' && gpsCoords && (
                <div className="flex items-center gap-3">
                  <span className="w-14 h-14 rounded-2xl bg-success-light flex items-center justify-center flex-none">
                    <span className="material-symbols-rounded text-3xl text-success">check_circle</span>
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-bold text-success">GPS {t('loc.detected')}</div>
                    <div className="text-sm text-dark-muted truncate" style={{ fontVariantNumeric: 'tabular-nums' }}>{gpsAddress}</div>
                  </div>
                  <button
                    onClick={() => { setGpsStatus('idle'); setGpsCoords(null); setGpsAddress(''); }}
                    className="text-sm font-bold text-primary"
                  >
                    <span className="material-symbols-rounded text-xl">refresh</span>
                  </button>
                </div>
              )}
              {gpsStatus === 'error' && (
                <div className="flex items-center gap-3">
                  <span className="w-14 h-14 rounded-2xl bg-danger-light flex items-center justify-center flex-none">
                    <span className="material-symbols-rounded text-3xl text-danger">location_off</span>
                  </span>
                  <div className="flex-1">
                    <div className="text-base font-bold text-danger">{t('loc.error')}</div>
                    <div className="text-xs text-dark-muted">{t('loc.errorSub')}</div>
                  </div>
                  <button onClick={detectGPS} className="text-sm font-bold text-primary">{t('loc.retry')}</button>
                </div>
              )}
            </div>

            {/* Map picker button */}
            <button
              onClick={() => setShowMap(true)}
              className="h-16 rounded-2xl border-2 border-cream-darker bg-white flex items-center justify-center gap-3"
              style={{ boxShadow: '0 1px 0 #EADFD2' }}
            >
              <span className="material-symbols-rounded text-3xl text-primary">map</span>
              <div className="text-left">
                <div className="text-base font-bold text-dark">{t('map.title')}</div>
                <div className="text-xs text-dark-muted">{t('map.titleSub')}</div>
              </div>
            </button>

            {/* Manual location picker */}
            <div className="text-sm font-bold text-dark-muted px-1">{t('loc.orSelect')}</div>
            <div className="flex flex-col gap-2">
              {locations.map((l, i) => (
                <button
                  key={l.id}
                  onClick={() => setLocIndex(i)}
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
                  {i === locIndex && (
                    <span className="material-symbols-rounded text-xl text-primary ml-auto">check_circle</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'media' && (
          <div className="flex flex-col gap-4">
            {/* Photo section */}
            <div className="rounded-2xl bg-white p-4 flex flex-col gap-3" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
              <div className="text-sm font-bold text-dark-muted flex items-center gap-2">
                <span className="material-symbols-rounded text-lg">photo_camera</span>
                {t('media.photo')}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((url, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden h-28">
                    <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 w-7 h-7 rounded-full bg-danger text-white flex items-center justify-center"
                    >
                      <span className="material-symbols-rounded text-base">close</span>
                    </button>
                  </div>
                ))}
                <button
                  onClick={handlePhotoCapture}
                  className="h-28 rounded-xl border-2 border-dashed border-cream-darker flex flex-col items-center justify-center gap-1 text-dark-muted hover:bg-cream"
                >
                  <span className="material-symbols-rounded text-3xl">add_a_photo</span>
                  <span className="text-xs font-bold">{t('media.photo')}</span>
                </button>
              </div>
            </div>

            {/* Video section */}
            <div className="rounded-2xl bg-white p-4 flex flex-col gap-3" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
              <div className="text-sm font-bold text-dark-muted flex items-center gap-2">
                <span className="material-symbols-rounded text-lg">videocam</span>
                {t('media.video')}
              </div>
              {!videoUrl ? (
                <button
                  onClick={handleVideoCapture}
                  className="h-28 rounded-xl border-2 border-dashed border-cream-darker bg-cream flex flex-col items-center justify-center gap-1"
                >
                  <span className="material-symbols-rounded text-4xl text-dark-faint">videocam</span>
                  <span className="text-sm font-bold text-dark">{t('media.video')}</span>
                </button>
              ) : (
                <div className="relative rounded-xl overflow-hidden">
                  <video src={videoUrl} controls className="w-full h-36 bg-black rounded-xl" />
                  <button
                    onClick={() => setVideoUrl(null)}
                    className="absolute top-1 right-1 w-7 h-7 rounded-full bg-danger text-white flex items-center justify-center"
                  >
                    <span className="material-symbols-rounded text-base">close</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="flex flex-col gap-4">
            <div className="rounded-3xl bg-white p-5 flex flex-col gap-4" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
              {/* Voice recording */}
              {voiceUrl && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center flex-none">
                      <span className="material-symbols-rounded text-2xl text-primary">mic</span>
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-bold">{t('voice.recorded')}</div>
                      <audio controls src={voiceUrl} className="w-full h-8 mt-1" />
                    </div>
                  </div>
                  {transcript && (
                    <div className="rounded-xl bg-cream p-3 text-sm">
                      <div className="text-xs font-bold text-dark-muted">{t('voice.transcript')}</div>
                      <div className="text-dark">"{transcript}"</div>
                    </div>
                  )}
                </div>
              )}

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
              ) : !voiceUrl ? (
                <div className="flex items-center gap-4">
                  <span className="w-16 h-16 rounded-2xl flex items-center justify-center flex-none bg-primary-light">
                    <span className="material-symbols-rounded text-4xl text-primary">edit_note</span>
                  </span>
                  <div>
                    <div className="text-2xl font-extrabold leading-tight">{t('cat.other')}</div>
                    {otherText && <div className="text-sm text-dark-muted mt-1">"{otherText}"</div>}
                  </div>
                </div>
              ) : null}

              <div className="h-px bg-cream-darker" />

              {/* Location */}
              <div className="flex gap-3 items-center">
                <span className="material-symbols-rounded text-2xl text-primary">location_on</span>
                <div className="leading-tight min-w-0 flex-1">
                  {gpsCoords ? (
                    <>
                      <div className="text-lg font-bold">GPS {t('loc.detected')}</div>
                      <div className="text-sm text-dark-muted truncate" style={{ fontVariantNumeric: 'tabular-nums' }}>{gpsAddress}</div>
                    </>
                  ) : (
                    <>
                      <div className="text-lg font-bold">{loc?.hi}</div>
                      <div className="text-sm text-dark-muted">{loc?.landmark}</div>
                    </>
                  )}
                </div>
              </div>

              {/* Media */}
              <div className="flex gap-3 items-center">
                <span className="material-symbols-rounded text-2xl text-primary">photo_camera</span>
                <div className="text-base">
                  {photos.length > 0 && videoUrl ? `${photos.length} ${t('review.photo')}, 1 ${t('review.video')}`
                    : photos.length > 0 ? `${photos.length} ${t('review.photo')}`
                    : videoUrl ? `1 ${t('review.video')}`
                    : t('review.noMedia')}
                </div>
              </div>

              {/* Photo thumbnails in review */}
              {photos.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                  {photos.map((url, i) => (
                    <img key={i} src={url} alt={`Photo ${i + 1}`} className="w-20 h-20 rounded-xl object-cover flex-none" />
                  ))}
                </div>
              )}

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
                  : `आप शिकायत दर्ज करा रहे हैं। जगह: ${loc?.hi ?? ''}।`;
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
      {step === 'voice_record' && voiceUrl && (
        <div className="flex-none px-5 pb-6 pt-2">
          <button
            onClick={() => setStep('location')}
            className="w-full h-16 rounded-2xl bg-primary text-white font-bold text-xl flex items-center justify-center gap-3"
          >
            <span className="material-symbols-rounded text-3xl">arrow_forward</span>
            {t('voice.next')}
          </button>
        </div>
      )}
      {step !== 'category' && step !== 'subtype' && step !== 'voice_record' && (
        <div className="flex-none px-5 pb-6 pt-2">
          {step === 'location' && (
            <button
              onClick={() => setStep('media')}
              className="w-full h-16 rounded-2xl bg-primary text-white font-bold text-xl flex items-center justify-center gap-3"
            >
              <span className="material-symbols-rounded text-3xl">check</span>
              {t('loc.yes')}
            </button>
          )}
          {step === 'media' && (
            <button
              onClick={() => setStep('review')}
              className="w-full h-16 rounded-2xl bg-primary text-white font-bold text-xl flex items-center justify-center gap-3"
            >
              <span className="material-symbols-rounded text-3xl">arrow_forward</span>
              {photos.length > 0 || videoUrl ? t('review.title') : t('media.skip')}
            </button>
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
