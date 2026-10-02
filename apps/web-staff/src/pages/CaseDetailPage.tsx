import { useParams, Link } from '@tanstack/react-router';
import { mockCases, mockTimeline, mockAttachments } from '../data/mockData';

export function CaseDetailPage() {
  const { caseId } = useParams({ strict: false }) as { caseId: string };
  const caseData = mockCases.find((c) => c.id === caseId);

  if (!caseData) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Case not found.</p>
        <Link to="/cases" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          Back to cases
        </Link>
      </div>
    );
  }

  const timeline = caseData.id === 'c001' ? mockTimeline : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link to="/cases" className="text-sm text-blue-600 hover:underline">
            &larr; Back to cases
          </Link>
          <h2 className="mt-2 text-xl font-semibold text-gray-900">{caseData.caseNumber}</h2>
          <p className="text-sm text-gray-500">
            {caseData.complaintType} &middot; {caseData.subType}
          </p>
        </div>
        <StatusBadge status={caseData.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Description */}
          <Card title="Description">
            <p className="text-sm text-gray-700">{caseData.description}</p>
          </Card>

          {/* Timeline */}
          <Card title="Timeline">
            {timeline.length > 0 ? (
              <div className="space-y-4">
                {timeline.map((entry, i) => (
                  <div key={entry.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-slate-600" />
                      {i < timeline.length - 1 && <div className="w-0.5 flex-1 bg-slate-200" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium text-gray-900">{entry.action}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(entry.timestamp).toLocaleString('en-IN')} &middot; {entry.actor} ({entry.actorRole})
                      </p>
                      <p className="mt-1 text-sm text-gray-600">{entry.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Timeline details available for case GRV-2026-00142.</p>
            )}
          </Card>

          {/* Attachments */}
          {caseData.id === 'c001' && (
            <Card title="Attachments">
              <div className="flex gap-3">
                {mockAttachments.map((a) => (
                  <div key={a.id} className="rounded-lg border border-gray-200 p-3">
                    <div className="flex h-20 w-28 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
                      Photo
                    </div>
                    <p className="mt-1 truncate text-xs text-gray-600">{a.filename}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card title="Details">
            <dl className="space-y-3 text-sm">
              <Detail label="Priority" value={caseData.priority} />
              <Detail label="Channel" value={caseData.channel} />
              <Detail label="Location" value={caseData.location} />
              <Detail label="Zone / Ward" value={`${caseData.zone}, ${caseData.ward}`} />
              <Detail label="Registered" value={new Date(caseData.registeredAt).toLocaleString('en-IN')} />
              <Detail label="SLA Due" value={new Date(caseData.slaDueAt).toLocaleString('en-IN')} />
              {caseData.resolvedAt && (
                <Detail label="Resolved" value={new Date(caseData.resolvedAt).toLocaleString('en-IN')} />
              )}
            </dl>
          </Card>

          <Card title="Citizen">
            <dl className="space-y-3 text-sm">
              <Detail label="Name" value={caseData.citizenName} />
              <Detail label="Phone" value={caseData.citizenPhone} />
            </dl>
          </Card>

          <Card title="Assignee">
            <dl className="space-y-3 text-sm">
              <Detail label="Name" value={caseData.assignee || 'Unassigned'} />
              <Detail label="Designation" value={caseData.assigneeDesignation || '—'} />
              <Detail label="Department" value={caseData.department} />
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-5 py-3">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-gray-900">{value}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    REGISTERED: 'bg-gray-100 text-gray-800',
    ASSIGNED: 'bg-blue-100 text-blue-800',
    ACCEPTED: 'bg-indigo-100 text-indigo-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    ATR_SUBMITTED: 'bg-purple-100 text-purple-800',
    RESOLVED: 'bg-green-100 text-green-800',
    CLOSED: 'bg-slate-100 text-slate-800',
    OVERDUE: 'bg-red-100 text-red-800',
    REOPENED: 'bg-orange-100 text-orange-800',
  };
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${colors[status] ?? 'bg-gray-100 text-gray-800'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
