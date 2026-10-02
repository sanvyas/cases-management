import { useNavigate } from '@tanstack/react-router';
import { useLang } from '../lang';
import type { Lang } from '../types';

export function LangPickerPage() {
  const { setLanguage } = useLang();
  const navigate = useNavigate();

  function pick(lang: Lang) {
    setLanguage(lang);
    void navigate({ to: '/home' });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-gradient-to-b from-blue-600 to-blue-800 text-white">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Samadhan</h1>
        <p className="mt-2 text-lg text-blue-200">Public Grievance Platform</p>
        <p className="mt-1 text-sm text-blue-300">
          समाधान · लोक शिकायत मंच
        </p>
      </div>

      <p className="mb-6 text-sm text-blue-200">Select Language / भाषा चुनें</p>

      <div className="flex gap-4">
        <button
          onClick={() => pick('en')}
          className="rounded-xl bg-white px-8 py-4 text-lg font-semibold text-blue-800 shadow-lg transition-transform hover:scale-105"
        >
          English
        </button>
        <button
          onClick={() => pick('hi')}
          className="rounded-xl bg-white px-8 py-4 text-lg font-semibold text-blue-800 shadow-lg transition-transform hover:scale-105"
        >
          हिन्दी
        </button>
      </div>
    </div>
  );
}
