import { useParams, Link } from '@tanstack/react-router';
import { useLang } from '../lang';
import { mockComplaints, categories } from '../data/mockData';
import type { ComplaintStatus } from '../types';

const progressSteps: { status: ComplaintStatus; key: string }[] = [
  { status: 'RECEIVED', key: 'progress.received' },
  { status: 'ASSIGNED', key: 'progress.assigned' },
  { status: 'IN_PROGRESS', key: 'progress.workDone' },
  { status: 'CLOSED', key: 'progress.closed' },
];

const statusOrder: ComplaintStatus[] = ['RECEIVED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export function DetailPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const { language, t } = useLang();

  const complaint = mockComplaints.find((c) => c.id === id);
  if (!complaint) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Not found</p>
      </div>
    );
  }

  const cat = categories.find((c) => c.id === complaint.categoryId);
  const currentIndex = statusOrder.indexOf(complaint.status);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center gap-3 bg-blue-700 px-4 py-4 text-white">
        <Link to="/track">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-lg font-semibold">{t('detail.title')}</h1>
      </header>

      <div className="flex-1 px-4 py-6 space-y-6">
        {/* Status Card */}
        <div className="rounded-xl bg-blue-50 p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-blue-600">{t('detail.caseNumber')}</p>
              <p className="text-lg font-bold text-blue-900">{complaint.caseNumber}</p>
            </div>
            <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
              {t(`status.${complaint.status}`)}
            </span>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="flex justify-between px-2">
          {progressSteps.map((step, i) => {
            const reached = currentIndex >= statusOrder.indexOf(step.status);
            return (
              <div key={step.key} className="flex flex-col items-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  reached ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {reached ? '✓' : i + 1}
                </div>
                <p className={`mt-1 text-xs ${reached ? 'font-medium text-green-700' : 'text-gray-400'}`}>
                  {t(step.key)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <InfoRow label={t('detail.category')} value={`${cat?.icon ?? ''} ${cat?.name[language] ?? ''}`} />
          <InfoRow label={t('detail.location')} value={complaint.location[language]} />
          <InfoRow label={t('detail.date')} value={complaint.dateCreated} />
          <InfoRow label={t('detail.description')} value={complaint.description[language]} />
          {complaint.officer && (
            <InfoRow label={t('detail.officer')} value={complaint.officer.name} />
          )}
        </div>

        {/* Timeline */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">{t('detail.timeline')}</h3>
          <div className="space-y-3">
            {complaint.timeline.map((entry, i) => (
              <div key={entry.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                  {i < complaint.timeline.length - 1 && <div className="w-0.5 flex-1 bg-blue-200" />}
                </div>
                <div className="pb-3">
                  <p className="text-sm font-medium text-gray-900">{entry.title[language]}</p>
                  <p className="text-xs text-gray-500">{entry.date}</p>
                  <p className="mt-0.5 text-sm text-gray-600">{entry.description[language]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback CTA for resolved cases */}
        {complaint.status === 'RESOLVED' && (
          <button className="w-full rounded-lg bg-green-600 py-3 text-sm font-semibold text-white">
            {t('detail.giveFeedback')}
          </button>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-0.5 text-sm text-gray-900">{value}</p>
    </div>
  );
}
