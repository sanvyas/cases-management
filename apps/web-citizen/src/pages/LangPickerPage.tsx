import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useLang } from '../lang';
import type { Lang } from '../types';

const LANGS: { code: Lang; label: string; sub: string }[] = [
  { code: 'hi', label: 'हिन्दी', sub: 'Hindi' },
  { code: 'en', label: 'English', sub: 'English' },
];

function speak(text: string) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'hi-IN';
    u.rate = 0.92;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch (_) { /* noop */ }
}

export function LangPickerPage() {
  const { setLanguage } = useLang();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Lang>('hi');

  function go() {
    setLanguage(selected);
    void navigate({ to: '/home' });
  }

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-extrabold text-dark leading-tight">समाधान</h1>
          <p className="text-lg text-dark-muted mt-1">Samadhan · Public Grievance Platform</p>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-extrabold text-dark">अपनी भाषा चुनें</h2>
          <button
            onClick={() => speak('अपनी भाषा चुनें')}
            className="w-12 h-12 rounded-full bg-primary-light text-primary flex items-center justify-center"
            aria-label="Listen"
          >
            <span className="material-symbols-rounded text-2xl">volume_up</span>
          </button>
        </div>
        <p className="text-sm text-dark-muted mb-6">Select your language</p>

        <div className="w-full space-y-3 max-w-xs">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => setSelected(l.code)}
              className="w-full flex items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-all"
              style={{
                borderColor: selected === l.code ? '#C24E33' : '#EADFD2',
                background: selected === l.code ? '#FDF0EA' : '#fff',
              }}
            >
              <span
                className="material-symbols-rounded text-2xl"
                style={{ color: selected === l.code ? '#C24E33' : '#B5A593' }}
              >
                {selected === l.code ? 'radio_button_checked' : 'radio_button_unchecked'}
              </span>
              <div>
                <div className="text-xl font-bold text-dark">{l.label}</div>
                <div className="text-sm text-dark-muted">{l.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pb-6">
        <div className="mb-4 rounded-2xl bg-white p-4 text-sm text-dark-muted leading-relaxed" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
          <span className="material-symbols-rounded text-base align-middle mr-1 text-success">verified_user</span>
          आगे बढ़कर आप सहमति देते हैं कि आपकी आवाज़ और फ़ोटो केवल शिकायत के लिए उपयोग होगी। आधार नहीं माँगा जाएगा।
          <br />
          <span className="text-xs">By proceeding you consent to use of voice &amp; photos only for the complaint. Aadhaar is never collected.</span>
        </div>
        <button
          onClick={go}
          className="w-full h-16 rounded-2xl bg-primary text-white text-xl font-bold flex items-center justify-center gap-3"
        >
          <span className="material-symbols-rounded text-3xl">arrow_forward</span>
          आगे बढ़ें · Continue
        </button>
      </div>
    </div>
  );
}
