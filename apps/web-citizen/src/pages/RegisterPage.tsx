import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useLang } from '../lang';
import { categories, subTypes } from '../data/mockData';

type Step = 'category' | 'subtype' | 'location' | 'description' | 'contact' | 'review' | 'success';

export function RegisterPage() {
  const { language, t } = useLang();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('category');
  const [categoryId, setCategoryId] = useState('');
  const [subTypeId, setSubTypeId] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [caseNumber, setCaseNumber] = useState('');

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const availableSubTypes = categoryId ? subTypes[categoryId] ?? [] : [];
  const selectedSubType = availableSubTypes.find((s) => s.id === subTypeId);

  function handleSubmit() {
    const num = `GMD-26-${String(Math.floor(Math.random() * 100000)).padStart(6, '0')}`;
    setCaseNumber(num);
    setStep('success');
  }

  if (step === 'success') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">{t('register.success.title')}</h2>
        <p className="mt-2 text-sm text-gray-600">{t('register.success.message')}</p>
        <div className="mt-4 rounded-lg bg-blue-50 px-6 py-3">
          <p className="text-xs text-blue-600">{t('register.success.caseNumber')}</p>
          <p className="text-2xl font-bold text-blue-800">{caseNumber}</p>
        </div>
        <div className="mt-8 flex gap-3">
          <Link to="/home" className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white">
            {t('register.success.goHome')}
          </Link>
          <Link to="/track" className="rounded-lg border border-blue-600 px-6 py-2.5 text-sm font-medium text-blue-600">
            {t('register.success.track')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 bg-blue-700 px-4 py-4 text-white">
        <button onClick={() => step === 'category' ? navigate({ to: '/home' }) : goBack()}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold">{t('register.title')}</h1>
      </header>

      {/* Progress */}
      <div className="flex gap-1 px-4 py-3">
        {(['category', 'subtype', 'location', 'description', 'contact', 'review'] as Step[]).map((s, i) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full ${
              getStepIndex(step) >= i ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4">
        {step === 'category' && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">{t('register.selectCategory')}</h2>
            <div className="grid grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setCategoryId(cat.id); setSubTypeId(''); setStep('subtype'); }}
                  className={`flex flex-col items-center rounded-xl border px-2 py-4 transition-colors ${
                    categoryId === cat.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="mt-2 text-xs font-medium text-gray-700">{cat.name[language]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'subtype' && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">{t('register.selectSubType')}</h2>
            <div className="space-y-2">
              {availableSubTypes.map((st) => (
                <button
                  key={st.id}
                  onClick={() => { setSubTypeId(st.id); setStep('location'); }}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900 hover:border-blue-300 hover:bg-blue-50"
                >
                  {st.name[language]}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'location' && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">{t('register.locationLabel')}</h2>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t('register.locationPlaceholder')}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
            <button className="mt-3 flex items-center gap-2 text-sm text-blue-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {t('register.useMyLocation')}
            </button>
          </div>
        )}

        {step === 'description' && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">{t('register.descriptionLabel')}</h2>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('register.descriptionPlaceholder')}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
            />
            <button className="mt-3 flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
              {t('register.takePhoto')}
            </button>
          </div>
        )}

        {step === 'contact' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('register.phoneLabel')}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                maxLength={10}
                placeholder={t('register.phonePlaceholder')}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('register.nameLabel')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('register.namePlaceholder')}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {step === 'review' && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">{t('register.reviewTitle')}</h2>
            <div className="space-y-3 rounded-lg bg-gray-50 p-4">
              <ReviewRow label={t('register.category')} value={selectedCategory?.name[language] ?? ''} />
              <ReviewRow label={t('register.subType')} value={selectedSubType?.name[language] ?? ''} />
              <ReviewRow label={t('register.location')} value={location} />
              <ReviewRow label={t('register.description')} value={description} />
              <ReviewRow label={t('register.phone')} value={phone} />
              <ReviewRow label={t('register.name')} value={name} />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {step !== 'category' && step !== 'subtype' && (
        <div className="sticky bottom-0 border-t border-gray-200 bg-white px-4 py-4">
          {step === 'review' ? (
            <button
              onClick={handleSubmit}
              className="w-full rounded-lg bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700"
            >
              {t('register.submit')}
            </button>
          ) : (
            <button
              onClick={goNext}
              className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {t('register.next')}
            </button>
          )}
        </div>
      )}
    </div>
  );

  function goBack() {
    const steps: Step[] = ['category', 'subtype', 'location', 'description', 'contact', 'review'];
    const idx = steps.indexOf(step);
    if (idx > 0) setStep(steps[idx - 1]!);
  }

  function goNext() {
    const steps: Step[] = ['category', 'subtype', 'location', 'description', 'contact', 'review'];
    const idx = steps.indexOf(step);
    if (idx < steps.length - 1) setStep(steps[idx + 1]!);
  }
}

function getStepIndex(step: string): number {
  return ['category', 'subtype', 'location', 'description', 'contact', 'review'].indexOf(step);
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-sm text-gray-900">{value || '—'}</p>
    </div>
  );
}
