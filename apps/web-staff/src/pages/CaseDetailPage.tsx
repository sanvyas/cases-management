import { useState } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { mockCases, mockTimeline, STATUS_CONFIG, PRIORITY_CONFIG } from '../data/mockData';

export function CaseDetailPage() {
  const { caseId } = useParams({ strict: false }) as { caseId: string };
  const [caseData, setCaseData] = useState(() => mockCases.find((c) => c.id === caseId));
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [actionDone, setActionDone] = useState('');

  if (!caseData) {
    return (
      <div className="py-12 text-center">
        <p className="text-dark-muted">Case not found.</p>
        <Link to="/cases" className="mt-4 inline-block text-sm font-bold text-primary hover:underline">
          Back to cases
        </Link>
      </div>
    );
  }

  const timeline = caseData.id === 'c001' ? mockTimeline : [];
  const st = STATUS_CONFIG[caseData.status];
  const pr = PRIORITY_CONFIG[caseData.priority];
  const isAtr = caseData.status === 'ATR_SUBMITTED';
  const isOverdue = caseData.status === 'OVERDUE';

  function handleApprove() {
    setCaseData((prev) => prev ? { ...prev, status: 'RESOLVED' as const } : prev);
    setShowApproveModal(false);
    setActionDone('approved');
  }

  function handleReturn() {
    setCaseData((prev) => prev ? { ...prev, status: 'IN_PROGRESS' as const } : prev);
    setShowReturnModal(false);
    setActionDone('returned');
  }

  function handleExtend() {
    setShowExtendModal(false);
    setActionDone('extended');
  }

  return (
    <div className="space-y-6">
      {/* Action result banner */}
      {actionDone && (
        <div
          className="flex items-center gap-3 rounded-2xl p-4"
          style={{
            background: actionDone === 'approved' ? '#E6F5EC' : actionDone === 'returned' ? '#FFF4D6' : '#E0F0FF',
            color: actionDone === 'approved' ? '#2F7D4F' : actionDone === 'returned' ? '#8A5A00' : '#2F6690',
          }}
        >
          <span className="material-symbols-rounded text-2xl">
            {actionDone === 'approved' ? 'task_alt' : actionDone === 'returned' ? 'restart_alt' : 'schedule'}
          </span>
          <span className="text-sm font-bold">
            {actionDone === 'approved' && 'ATR approved. Case marked as Resolved.'}
            {actionDone === 'returned' && 'Case returned for rework. Worker has been notified.'}
            {actionDone === 'extended' && 'SLA extended by 48 hours.'}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link to="/cases" className="flex items-center gap-1 text-sm font-bold text-primary hover:underline mb-2">
            <span className="material-symbols-rounded text-lg">arrow_back</span>
            Back to cases
          </Link>
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: caseData.iconBg }}>
              <span className="material-symbols-rounded text-2xl" style={{ color: caseData.iconFg }}>{caseData.icon}</span>
            </span>
            <div>
              <h2 className="text-2xl font-extrabold text-dark">{caseData.caseNumber}</h2>
              <p className="text-sm text-dark-muted">{caseData.complaintType} · {caseData.subType}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pr && (
            <span className="rounded-xl px-3 py-1 text-sm font-bold" style={{ background: pr.bg, color: pr.fg }}>
              {pr.label}
            </span>
          )}
          {st && (
            <span className="flex items-center gap-1 rounded-xl px-3 py-1 text-sm font-bold" style={{ background: st.bg, color: st.fg }}>
              <span className="material-symbols-rounded text-lg">{st.icon}</span>
              {st.label}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons for Officer */}
      {(isAtr || isOverdue) && !actionDone && (
        <div className="flex gap-3 flex-wrap">
          {isAtr && (
            <>
              <button
                onClick={() => setShowApproveModal(true)}
                className="flex items-center gap-2 h-12 px-6 rounded-xl bg-success text-white font-bold text-sm"
              >
                <span className="material-symbols-rounded text-xl">check_circle</span>
                Approve ATR
              </button>
              <button
                onClick={() => setShowReturnModal(true)}
                className="flex items-center gap-2 h-12 px-6 rounded-xl bg-warning text-white font-bold text-sm"
              >
                <span className="material-symbols-rounded text-xl">restart_alt</span>
                Return for Rework
              </button>
            </>
          )}
          {isOverdue && (
            <button
              onClick={() => setShowExtendModal(true)}
              className="flex items-center gap-2 h-12 px-6 rounded-xl bg-info text-white font-bold text-sm"
            >
              <span className="material-symbols-rounded text-xl">more_time</span>
              Extend SLA
            </button>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="space-y-5 lg:col-span-2">
          <Card title="Description" icon="description">
            <p className="text-sm text-dark-secondary leading-relaxed">{caseData.description}</p>
          </Card>

          {/* Timeline */}
          <Card title="Timeline" icon="timeline">
            {timeline.length > 0 ? (
              <div className="space-y-0">
                {timeline.map((entry, i) => (
                  <div key={entry.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className="w-8 h-8 rounded-full bg-cream-dark flex items-center justify-center flex-none">
                        <span className="material-symbols-rounded text-base text-dark-muted">{entry.icon}</span>
                      </span>
                      {i < timeline.length - 1 && <div className="w-0.5 flex-1 bg-cream-darker min-h-4" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-bold text-dark">{entry.action}</p>
                      <p className="text-xs text-dark-muted">
                        {new Date(entry.timestamp).toLocaleString('en-IN')} · {entry.actor}
                      </p>
                      <p className="mt-1 text-sm text-dark-secondary">{entry.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-dark-muted">Timeline details available for case GRV-2026-00142.</p>
            )}
          </Card>

          {/* ATR Photo Proofs */}
          {(caseData.status === 'ATR_SUBMITTED' || caseData.status === 'RESOLVED') && (
            <Card title="ATR Photos" icon="photo_camera">
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="rounded-xl overflow-hidden" style={{ background: 'repeating-linear-gradient(135deg, #E9DFD2 0 10px, #F1E8DD 10px 20px)' }}>
                    <div className="h-28 flex items-center justify-center">
                      <span className="material-symbols-rounded text-3xl text-dark-muted">image</span>
                    </div>
                    <div className="px-2 py-1 bg-white/80 text-xs text-dark-muted">
                      Photo {n} · GPS ✓
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card title="Details" icon="info">
            <dl className="space-y-3 text-sm">
              <Detail label="Channel" value={caseData.channel} icon="campaign" />
              <Detail label="Location" value={caseData.location} icon="location_on" />
              <Detail label="Zone / Ward" value={`${caseData.zone}, ${caseData.ward}`} icon="map" />
              <Detail label="Registered" value={new Date(caseData.registeredAt).toLocaleString('en-IN')} icon="calendar_today" />
              <Detail label="SLA Due" value={new Date(caseData.slaDueAt).toLocaleString('en-IN')} icon="schedule" />
              {caseData.resolvedAt && (
                <Detail label="Resolved" value={new Date(caseData.resolvedAt).toLocaleString('en-IN')} icon="task_alt" />
              )}
            </dl>
          </Card>

          <Card title="Citizen" icon="person">
            <dl className="space-y-3 text-sm">
              <Detail label="Name" value={caseData.citizenName} icon="badge" />
              <Detail label="Phone" value={caseData.citizenPhone} icon="phone" />
            </dl>
          </Card>

          <Card title="Assignee" icon="engineering">
            <dl className="space-y-3 text-sm">
              <Detail label="Name" value={caseData.assignee || 'Unassigned'} icon="person" />
              <Detail label="Designation" value={caseData.assigneeDesignation || '—'} icon="work" />
              <Detail label="Department" value={caseData.department} icon="apartment" />
            </dl>
          </Card>
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <Modal onClose={() => setShowApproveModal(false)}>
          <div className="text-center">
            <span className="material-symbols-rounded text-5xl text-success mb-3">task_alt</span>
            <h3 className="text-xl font-extrabold text-dark mb-2">Approve ATR?</h3>
            <p className="text-sm text-dark-muted mb-6">This will mark the case as Resolved and notify the citizen for feedback.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 h-12 rounded-xl border-2 border-cream-darker bg-white text-dark font-bold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 h-12 rounded-xl bg-success text-white font-bold text-sm"
              >
                Approve
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Return Modal */}
      {showReturnModal && (
        <Modal onClose={() => setShowReturnModal(false)}>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-rounded text-2xl text-warning">restart_alt</span>
              <h3 className="text-xl font-extrabold text-dark">Return for Rework</h3>
            </div>
            <label className="block text-sm font-bold text-dark mb-1">Reason</label>
            <textarea
              rows={3}
              placeholder="Explain what needs to be redone..."
              className="w-full rounded-xl border-2 border-cream-darker bg-cream px-4 py-3 text-sm outline-none focus:border-primary resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowReturnModal(false)}
                className="flex-1 h-12 rounded-xl border-2 border-cream-darker bg-white text-dark font-bold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleReturn}
                className="flex-1 h-12 rounded-xl bg-warning text-white font-bold text-sm"
              >
                Return
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Extend SLA Modal */}
      {showExtendModal && (
        <Modal onClose={() => setShowExtendModal(false)}>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-rounded text-2xl text-info">more_time</span>
              <h3 className="text-xl font-extrabold text-dark">Extend SLA</h3>
            </div>
            <label className="block text-sm font-bold text-dark mb-1">Extension period</label>
            <select className="w-full rounded-xl border-2 border-cream-darker bg-cream px-4 py-3 text-sm outline-none focus:border-primary">
              <option>24 hours</option>
              <option>48 hours</option>
              <option>72 hours</option>
              <option>1 week</option>
            </select>
            <label className="block text-sm font-bold text-dark mb-1 mt-3">Reason</label>
            <textarea
              rows={2}
              placeholder="Reason for SLA extension..."
              className="w-full rounded-xl border-2 border-cream-darker bg-cream px-4 py-3 text-sm outline-none focus:border-primary resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowExtendModal(false)}
                className="flex-1 h-12 rounded-xl border-2 border-cream-darker bg-white text-dark font-bold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleExtend}
                className="flex-1 h-12 rounded-xl bg-info text-white font-bold text-sm"
              >
                Extend
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Card({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
      <div className="flex items-center gap-2 border-b border-cream-darker px-5 py-3">
        <span className="material-symbols-rounded text-lg text-dark-muted">{icon}</span>
        <h3 className="text-sm font-extrabold text-dark">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Detail({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="material-symbols-rounded text-base text-dark-muted mt-0.5">{icon}</span>
      <div>
        <dt className="text-xs font-bold text-dark-muted">{label}</dt>
        <dd className="text-dark">{value}</dd>
      </div>
    </div>
  );
}

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-white p-6 mx-4" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
