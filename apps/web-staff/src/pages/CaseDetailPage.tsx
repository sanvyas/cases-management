import { useState } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { mockCases, mockTimeline, STATUS_CONFIG, PRIORITY_CONFIG, staffMembers } from '../data/mockData';
import type { CaseStatus } from '../types';

interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
}

export function CaseDetailPage() {
  const { caseId } = useParams({ strict: false }) as { caseId: string };
  const [caseData, setCaseData] = useState(() => mockCases.find((c) => c.id === caseId));
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [actionDone, setActionDone] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [returnReason, setReturnReason] = useState('');

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
  const isUnassigned = !caseData.assignee || caseData.status === 'REGISTERED';
  const isAtr = caseData.status === 'ATR_SUBMITTED';
  const isOverdue = caseData.status === 'OVERDUE';

  function handleApprove() {
    setCaseData((prev) => prev ? { ...prev, status: 'RESOLVED' as CaseStatus } : prev);
    setShowApproveModal(false);
    setActionDone('approved');
  }

  function handleReturn() {
    setCaseData((prev) => prev ? { ...prev, status: 'IN_PROGRESS' as CaseStatus } : prev);
    setShowReturnModal(false);
    setReturnReason('');
    setActionDone('returned');
  }

  function handleExtend() {
    setShowExtendModal(false);
    setActionDone('extended');
  }

  function handleAssign() {
    const staff = staffMembers.find(s => s.id === selectedStaff);
    if (staff) {
      setCaseData((prev) => prev ? {
        ...prev,
        assignee: staff.name,
        assigneeDesignation: staff.designation,
        status: 'ASSIGNED' as CaseStatus,
      } : prev);
    }
    setShowAssignModal(false);
    setSelectedStaff('');
    setActionDone('assigned');
  }

  function handleReassign() {
    const staff = staffMembers.find(s => s.id === selectedStaff);
    if (staff) {
      setCaseData((prev) => prev ? {
        ...prev,
        assignee: staff.name,
        assigneeDesignation: staff.designation,
      } : prev);
    }
    setShowReassignModal(false);
    setSelectedStaff('');
    setActionDone('reassigned');
  }

  function handleAddComment() {
    if (!commentText.trim()) return;
    const newComment: Comment = {
      id: `cmt-${Date.now()}`,
      text: commentText.trim(),
      author: 'Aarav Mehta',
      timestamp: new Date().toISOString(),
    };
    setComments(prev => [newComment, ...prev]);
    setCommentText('');
  }

  return (
    <div className="space-y-6">
      {/* Action result banner */}
      {actionDone && (
        <div
          className="flex items-center gap-3 rounded-2xl p-4"
          style={{
            background: actionDone === 'approved' ? '#E6F5EC'
              : actionDone === 'returned' ? '#FFF4D6'
              : actionDone === 'assigned' || actionDone === 'reassigned' ? '#E0F0FF'
              : '#E0F0FF',
            color: actionDone === 'approved' ? '#2F7D4F'
              : actionDone === 'returned' ? '#8A5A00'
              : '#2F6690',
          }}
        >
          <span className="material-symbols-rounded text-2xl">
            {actionDone === 'approved' ? 'task_alt'
              : actionDone === 'returned' ? 'restart_alt'
              : actionDone === 'assigned' ? 'person_add'
              : actionDone === 'reassigned' ? 'swap_horiz'
              : 'schedule'}
          </span>
          <span className="text-sm font-bold">
            {actionDone === 'approved' && 'ATR approved. Case marked as Resolved.'}
            {actionDone === 'returned' && 'Case returned for rework. Assignee notified.'}
            {actionDone === 'assigned' && `Case assigned to ${caseData.assignee}.`}
            {actionDone === 'reassigned' && `Case reassigned to ${caseData.assignee}.`}
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

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap">
        {isUnassigned && (
          <button
            onClick={() => setShowAssignModal(true)}
            className="flex items-center gap-2 h-12 px-6 rounded-xl bg-primary text-white font-bold text-sm"
          >
            <span className="material-symbols-rounded text-xl">person_add</span>
            Assign Case
          </button>
        )}
        {!isUnassigned && !isAtr && caseData.status !== 'RESOLVED' && caseData.status !== 'CLOSED' && (
          <button
            onClick={() => setShowReassignModal(true)}
            className="flex items-center gap-2 h-12 px-6 rounded-xl border-2 border-cream-darker bg-white text-dark font-bold text-sm"
          >
            <span className="material-symbols-rounded text-xl">swap_horiz</span>
            Change Assignee
          </button>
        )}
        {isAtr && !actionDone && (
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
        {isOverdue && !actionDone && (
          <button
            onClick={() => setShowExtendModal(true)}
            className="flex items-center gap-2 h-12 px-6 rounded-xl bg-info text-white font-bold text-sm"
          >
            <span className="material-symbols-rounded text-xl">more_time</span>
            Extend SLA
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="space-y-5 lg:col-span-2">
          <Card title="Description" icon="description">
            <p className="text-sm text-dark-secondary leading-relaxed">{caseData.description}</p>
          </Card>

          {/* Comments Section */}
          <Card title="Comments" icon="chat">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(); }}
                placeholder="Add a comment..."
                className="flex-1 rounded-xl border-2 border-cream-darker bg-cream px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
              <button
                onClick={handleAddComment}
                disabled={!commentText.trim()}
                className="h-11 px-4 rounded-xl bg-primary text-white font-bold text-sm flex items-center gap-1 disabled:opacity-40"
              >
                <span className="material-symbols-rounded text-lg">send</span>
                Post
              </button>
            </div>
            {comments.length > 0 ? (
              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className="rounded-xl bg-cream p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                        {c.author.split(' ').map(n => n[0]).join('')}
                      </span>
                      <span className="text-sm font-bold text-dark">{c.author}</span>
                      <span className="text-xs text-dark-muted">{new Date(c.timestamp).toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-sm text-dark-secondary pl-8">{c.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-dark-muted">No comments yet. Add a comment above.</p>
            )}
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
                      Photo {n} · GPS verified
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
            {caseData.assignee && caseData.status !== 'RESOLVED' && caseData.status !== 'CLOSED' && (
              <button
                onClick={() => setShowReassignModal(true)}
                className="mt-3 flex items-center gap-1 text-sm font-bold text-primary hover:underline"
              >
                <span className="material-symbols-rounded text-lg">swap_horiz</span>
                Change Assignee
              </button>
            )}
          </Card>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <Modal onClose={() => setShowAssignModal(false)}>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-rounded text-2xl text-primary">person_add</span>
              <h3 className="text-xl font-extrabold text-dark">Assign Case</h3>
            </div>
            <p className="text-sm text-dark-muted mb-3">Select staff member to assign this case to:</p>
            <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
              {staffMembers.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStaff(s.id)}
                  className="w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all"
                  style={{
                    background: selectedStaff === s.id ? '#FDF0EA' : '#FAF5EE',
                    border: `2px solid ${selectedStaff === s.id ? '#C24E33' : 'transparent'}`,
                  }}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-dark text-sm font-bold text-dark">
                    {s.name.split(' ').slice(-2).map(n => n[0]).join('')}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-dark">{s.name}</div>
                    <div className="text-xs text-dark-muted">{s.designation} · {s.department}</div>
                  </div>
                  {selectedStaff === s.id && (
                    <span className="material-symbols-rounded text-xl text-primary ml-auto">check_circle</span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowAssignModal(false); setSelectedStaff(''); }}
                className="flex-1 h-12 rounded-xl border-2 border-cream-darker bg-white text-dark font-bold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedStaff}
                className="flex-1 h-12 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-40"
              >
                Assign
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reassign Modal */}
      {showReassignModal && (
        <Modal onClose={() => setShowReassignModal(false)}>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-rounded text-2xl text-primary">swap_horiz</span>
              <h3 className="text-xl font-extrabold text-dark">Change Assignee</h3>
            </div>
            <div className="rounded-xl bg-cream p-3 mb-3 text-sm">
              <span className="font-bold">Current: </span>{caseData.assignee} ({caseData.assigneeDesignation})
            </div>
            <p className="text-sm text-dark-muted mb-3">Select new assignee:</p>
            <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
              {staffMembers.filter(s => s.name !== caseData.assignee).map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStaff(s.id)}
                  className="w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all"
                  style={{
                    background: selectedStaff === s.id ? '#FDF0EA' : '#FAF5EE',
                    border: `2px solid ${selectedStaff === s.id ? '#C24E33' : 'transparent'}`,
                  }}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-dark text-sm font-bold text-dark">
                    {s.name.split(' ').slice(-2).map(n => n[0]).join('')}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-dark">{s.name}</div>
                    <div className="text-xs text-dark-muted">{s.designation} · {s.department}</div>
                  </div>
                  {selectedStaff === s.id && (
                    <span className="material-symbols-rounded text-xl text-primary ml-auto">check_circle</span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowReassignModal(false); setSelectedStaff(''); }}
                className="flex-1 h-12 rounded-xl border-2 border-cream-darker bg-white text-dark font-bold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleReassign}
                disabled={!selectedStaff}
                className="flex-1 h-12 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-40"
              >
                Reassign
              </button>
            </div>
          </div>
        </Modal>
      )}

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
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="Explain what needs to be redone..."
              className="w-full rounded-xl border-2 border-cream-darker bg-cream px-4 py-3 text-sm outline-none focus:border-primary resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowReturnModal(false); setReturnReason(''); }}
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
