import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useLang } from '../lang';
import { mockComplaints, categories } from '../data/mockData';

export function TrackPage() {
  const { language, t } = useLang();
  const [phone, setPhone] = useState('');
  const [searched, setSearched] = useState(false);

  function handleSearch() {
    setSearched(true);
  }

  const complaints = searched ? mockComplaints : [];

  const statusColors: Record<string, string> = {
    RECEIVED: 'bg-gray-100 text-gray-700',
    ASSIGNED: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
    RESOLVED: 'bg-green-100 text-green-700',
    CLOSED: 'bg-slate-100 text-slate-700',
    REOPENED: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center gap-3 bg-blue-700 px-4 py-4 text-white">
        <Link to="/home">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-lg font-semibold">{t('track.title')}</h1>
      </header>

      <div className="px-4 py-6">
        <label className="block text-sm font-medium text-gray-700">{t('track.phoneLabel')}</label>
        <div className="mt-2 flex gap-2">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            maxLength={10}
            placeholder={t('track.phonePlaceholder')}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSearch}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            {t('track.search')}
          </button>
        </div>
      </div>

      {searched && (
        <div className="flex-1 px-4">
          {complaints.length === 0 ? (
            <p className="text-center text-sm text-gray-500">{t('track.noComplaints')}</p>
          ) : (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-700">{t('track.myComplaints')}</h2>
              {complaints.map((c) => {
                const cat = categories.find((cat) => cat.id === c.categoryId);
                return (
                  <Link
                    key={c.id}
                    to="/complaint/$id"
                    params={{ id: c.id }}
                    className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-blue-300"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{c.caseNumber}</p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {cat?.icon} {cat?.name[language]} &middot; {c.dateCreated}
                        </p>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[c.status] ?? ''}`}>
                        {t(`status.${c.status}`)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{c.description[language]}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
