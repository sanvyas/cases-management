import { useState, useRef } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { mockCases, mockTimeline, STATUS_CONFIG, PRIORITY_CONFIG, staffMembers } from '../data/mockData';
import { getCitizenCasesAsStaffCases, updateStoredComplaint } from '../store';
import { useAuth } from '../auth';
import { compressImage } from '../media';
import type { Case, CaseStatus } from '../types';

interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
}

interface UploadedMedia {
  id: string;
  name: string;
  type: 'image' | 'video';
  size: string;
  timestamp: string;
  url: string;
}

function findCase(id: string): Case | undefined {
  const mock = mockCases.find((c) => c.id === id);
  if (mock) return mock;
  return getCitizenCasesAsStaffCases().find((c) => c.id === id);
}

const STATUS_TRANSITIONS: Record<string, string[]> = {
  REGISTERED: ['ASSIGNED'],
  ASSIGNED: ['IN_PROGRESS'],
  IN_PROGRESS: ['ATR_SUBMITTED'],
  ATR_SUBMITTED: ['RESOLVED', 'IN_PROGRESS'],
  RESOLVED: ['CLOSED', 'REOPENED'],
  OVERDUE: ['IN_PROGRESS', 'ATR_SUBMITTED'],
  REOPENED: ['IN_PROGRESS'],
};

export function CaseDetailPage() {
  const { caseId } = useParams({ strict: false }) as { caseId: string };
  const { user, hasPermission } = useAuth();
  const [caseData, setCaseData] = useState(() => findCase(caseId));
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [actionDone, setActionDone] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [uploads, setUploads] = useState<UploadedMedia[]>([]);
  const [statusNote, setStatusNote] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAssign = hasPermission('cases.assign');
  const canApprove = hasPermission('cases.approve');
  const canManage = hasPermission('cases.manage');
  const canChangeStatus = hasPermission('cases.status.change');
  const canUploadMedia = hasPermission('cases.media.upload');
  const canSubmitAtr = hasPermission('cases.atr.submit');
  const canComment = hasPermission('cases.comment');
  const canEscalate = hasPermission('cases.escalate');

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
  const isClosed = caseData.status === 'CLOSED';
  const allowedTransitions = STATUS_TRANSITIONS[caseData.status] || [];

  function updateCase(updates: Partial<Case>) {
    setCaseData(prev => {
      if (!prev) return prev;
      if (prev.id.startsWith('citizen-')) {
        updateStoredComplaint(prev.id, { status: updates.status });
      }
      return { ...prev, ...updates };
    });
  }

  function handleApprove() {
    updateCase({ status: 'RESOLVED' as CaseStatus });
    setShowApproveModal(false);
    setActionDone('approved');
  }

  function handleReturn() {
    updateCase({ status: 'IN_PROGRESS' as CaseStatus });
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
      updateCase({
        assignee: staff.name,
        assigneeDesignation: staff.designation,
        status: 'ASSIGNED' as CaseStatus,
      });
    }
    setShowAssignModal(false);
    setSelectedStaff('');
    setActionDone('assigned');
  }

  function handleReassign() {
    const staff = staffMembers.find(s => s.id === selectedStaff);
    if (staff) {
      updateCase({
        assignee: staff.name,
        assigneeDesignation: staff.designation,
      });
    }
    setShowReassignModal(false);
    setSelectedStaff('');
    setActionDone('reassigned');
  }

  function handleStatusChange(newStatus: string) {
    updateCase({ status: newStatus as CaseStatus });
    setShowStatusModal(false);
    setStatusNote('');
    setActionDone(`status_${newStatus.toLowerCase()}`);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const newUploads: UploadedMedia[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i]!;
      const isVideo = file.type.startsWith('video/');
      let blob: Blob = file;
      if (!isVideo && file.type.startsWith('image/')) {
        try { blob = await compressImage(file); } catch { blob = file; }
      }
      const sizeKB = Math.round(blob.size / 1024);
      const sizeStr = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;
      newUploads.push({
        id: `upload-${Date.now()}-${i}`,
        name: file.name,
        type: isVideo ? 'video' : 'image',
        size: sizeStr,
        timestamp: new Date().toISOString(),
        url: URL.createObjectURL(blob),
      });
    }
    setUploads(prev => [...prev, ...newUploads]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeUpload(id: string) {
    setUploads(prev => {
      const item = prev.find(u => u.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter(u => u.id !== id);
    });
  }

  function handleAddComment() {
    if (!commentText.trim()) return;
    const newComment: Comment = {
      id: `cmt-${Date.now()}`,
      text: commentText.trim(),
      author: user?.name || 'Staff',
      timestamp: new Date().toISOString(),
    };
    setComments(prev => [newComment, ...prev]);
    setCommentText('');
  }

  return (
    <div className="space-y-6">
      {actionDone && (
        <div
          className="flex items-center gap-3 rounded-2xl p-4"
          style={{
            background: actionDone === 'approved' ? '#E6F5EC'
              : actionDone === 'returned' ? '#FFF4D6'
              : actionDone.startsWith('status_') ? '#E0F0FF'
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
              : actionDone.startsWith('status_') ? 'sync'
              : 'schedule'}
          </span>
          <span className="text-sm font-bold">
            {actionDone === 'approved' && 'ATR approved. Case marked as Resolved.'}
            {actionDone === 'returned' && 'Case returned for rework. Assignee notified.'}
            {actionDone === 'assigned' && `Case assigned to ${caseData.assignee}.`}
            {actionDone === 'reassigned' && `Case reassigned to ${caseData.assignee}.`}
            {actionDone === 'extended' && 'SLA extended by 48 hours.'}
            {actionDone.startsWith('status_') && `Status updated to ${STATUS_CONFIG[caseData.status]?.label || caseData.status}.`}
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

      {/* Action Buttons — role-based */}
      <div className="flex gap-3 flex-wrap">
        {isUnassigned && canAssign && (
          <button
            onClick={() => setShowAssignModal(true)}
            className="flex items-center gap-2 h-12 px-6 rounded-xl bg-primary text-white font-bold text-sm"
          >
            <span className="material-symbols-rounded text-xl">person_add</span>
            Assign Case
          </button>
        )}
        {!isUnassigned && !isAtr && !isClosed && caseData.status !== 'RESOLVED' && canAssign && (
          <button
            onClick={() => setShowReassignModal(true)}
            className="flex items-center gap-2 h-12 px-6 rounded-xl border-2 border-cream-darker bg-white text-dark font-bold text-sm"
          >
            <span className="material-symbols-rounded text-xl">swap_horiz</span>
            Change Assignee
          </button>
        )}
        {isAtr && canApprove && !actionDone && (
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
        {isOverdue && canManage && !actionDone && (
          <button
            onClick={() => setShowExtendModal(true)}
            className="flex items-center gap-2 h-12 px-6 rounded-xl bg-info text-white font-bold text-sm"
          >
            <span className="material-symbols-rounded text-xl">more_time</span>
            Extend SLA
          </button>
        )}
        {canChangeStatus && allowedTransitions.length > 0 && !isClosed && (
          <button
            onClick={() => setShowStatusModal(true)}
            className="flex items-center gap-2 h-12 px-6 rounded-xl border-2 border-cream-darker bg-white text-dark font-bold text-sm"
          >
            <span className="material-symbols-rounded text-xl">sync</span>
            Change Status
          </button>
        )}
        {canUploadMedia && !isClosed && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 h-12 px-6 rounded-xl border-2 border-cream-darker bg-white text-dark font-bold text-sm"
          >
            <span className="material-symbols-rounded text-xl">add_photo_alternate</span>
            Upload Media
          </button>
        )}
        {canEscalate && !isClosed && caseData.status !== 'RESOLVED' && (
          <button
            onClick={() => setActionDone('escalated')}
            className="flex items-center gap-2 h-12 px-6 rounded-xl border-2 border-danger bg-white font-bold text-sm"
            style={{ color: '#B42318' }}
          >
            <span className="material-symbols-rounded text-xl">priority_high</span>
            Escalate
          </button>
        )}
        {canSubmitAtr && caseData.status === 'IN_PROGRESS' && (
          <button
            onClick={() => handleStatusChange('ATR_SUBMITTED')}
            className="flex items-center gap-2 h-12 px-6 rounded-xl bg-info text-white font-bold text-sm"
          >
            <span className="material-symbols-rounded text-xl">description</span>
            Submit ATR
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="space-y-5 lg:col-span-2">
          <Card title="Description" icon="description">
            <p className="text-sm text-dark-secondary leading-relaxed">{caseData.description}</p>
          </Card>

          {/* Uploaded Media */}
          {uploads.length > 0 && (
            <Card title={`Uploaded Media (${uploads.length})`} icon="photo_library">
              <div className="grid grid-cols-3 gap-3">
                {uploads.map(u => (
                  <div key={u.id} className="rounded-xl overflow-hidden bg-cream relative group">
                    {u.type === 'image' ? (
                      <img src={u.url} alt={u.name} className="h-28 w-full object-cover" />
                    ) : (
                      <div className="h-28 flex items-center justify-center bg-dark/5">
                        <span className="material-symbols-rounded text-4xl text-dark-muted">videocam</span>
                      </div>
                    )}
                    <div className="px-2 py-1.5 bg-white">
                      <p className="text-xs font-bold text-dark truncate">{u.name}</p>
                      <p className="text-[10px] text-dark-muted">{u.size} · {new Date(u.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <button
                      onClick={() => removeUpload(u.id)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-rounded text-sm text-danger">close</span>
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Comments Section */}
          <Card title="Comments" icon="chat">
            {canComment && (
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
            )}
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
              <p className="text-sm text-dark-muted">No comments yet.{canComment ? ' Add a comment above.' : ''}</p>
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
            {caseData.assignee && !isClosed && caseData.status !== 'RESOLVED' && canAssign && (
              <button
                onClick={() => setShowReassignModal(true)}
                className="mt-3 flex items-center gap-1 text-sm font-bold text-primary hover:underline"
              >
                <span className="material-symbols-rounded text-lg">swap_horiz</span>
                Change Assignee
              </button>
            )}
          </Card>

          {/* Your Permissions */}
          <Card title="Your Permissions" icon="admin_panel_settings">
            <div className="space-y-1.5">
              {[
                { key: 'cases.assign', label: 'Assign', icon: 'person_add' },
                { key: 'cases.approve', label: 'Approve ATR', icon: 'check_circle' },
                { key: 'cases.status.change', label: 'Change Status', icon: 'sync' },
                { key: 'cases.media.upload', label: 'Upload Media', icon: 'add_photo_alternate' },
                { key: 'cases.atr.submit', label: 'Submit ATR', icon: 'description' },
                { key: 'cases.escalate', label: 'Escalate', icon: 'priority_high' },
                { key: 'cases.comment', label: 'Comment', icon: 'chat' },
              ].map(p => (
                <div key={p.key} className="flex items-center gap-2 text-sm">
                  <span
                    className="material-symbols-rounded text-base"
                    style={{ color: hasPermission(p.key) ? '#2F7D4F' : '#E3D6C6' }}
                  >
                    {hasPermission(p.key) ? 'check_circle' : 'cancel'}
                  </span>
                  <span style={{ color: hasPermission(p.key) ? '#2A1F17' : '#8A7766' }}>{p.label}</span>
                </div>
              ))}
            </div>
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

      {/* Status Change Modal */}
      {showStatusModal && (
        <Modal onClose={() => setShowStatusModal(false)}>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-rounded text-2xl text-info">sync</span>
              <h3 className="text-xl font-extrabold text-dark">Change Status</h3>
            </div>
            <div className="rounded-xl bg-cream p-3 mb-3 text-sm">
              <span className="font-bold">Current: </span>
              {st && (
                <span className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-bold ml-1" style={{ background: st.bg, color: st.fg }}>
                  <span className="material-symbols-rounded text-sm">{st.icon}</span>
                  {st.label}
                </span>
              )}
            </div>
            <p className="text-sm text-dark-muted mb-3">Select new status:</p>
            <div className="space-y-2 mb-4">
              {allowedTransitions.map(s => {
                const cfg = STATUS_CONFIG[s];
                if (!cfg) return null;
                return (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className="w-full flex items-center gap-3 rounded-xl p-3 text-left hover:bg-cream transition-colors"
                    style={{ border: '2px solid #EADFD2' }}
                  >
                    <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: cfg.bg }}>
                      <span className="material-symbols-rounded text-xl" style={{ color: cfg.fg }}>{cfg.icon}</span>
                    </span>
                    <div>
                      <div className="text-sm font-bold text-dark">{cfg.label}</div>
                      <div className="text-xs text-dark-muted">{s}</div>
                    </div>
                    <span className="material-symbols-rounded text-xl text-dark-muted ml-auto">arrow_forward</span>
                  </button>
                );
              })}
            </div>
            <label className="block text-xs font-bold text-dark-muted mb-1">Note (optional)</label>
            <textarea
              rows={2}
              value={statusNote}
              onChange={e => setStatusNote(e.target.value)}
              placeholder="Add a note about this status change..."
              className="w-full rounded-xl border-2 border-cream-darker bg-cream px-4 py-3 text-sm outline-none focus:border-primary resize-none mb-4"
            />
            <button
              onClick={() => setShowStatusModal(false)}
              className="w-full h-12 rounded-xl border-2 border-cream-darker bg-white text-dark font-bold text-sm"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <Modal onClose={() => setShowUploadModal(false)}>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-rounded text-2xl text-primary">add_photo_alternate</span>
              <h3 className="text-xl font-extrabold text-dark">Upload Media</h3>
            </div>
            <p className="text-sm text-dark-muted mb-4">Upload photos or videos as evidence for this case.</p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 rounded-2xl border-2 border-dashed border-cream-darker bg-cream flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors mb-4"
            >
              <span className="material-symbols-rounded text-4xl text-dark-muted">cloud_upload</span>
              <span className="text-sm font-bold text-dark-muted">Click to select files</span>
              <span className="text-xs text-dark-faint">Photos (JPG, PNG) or Videos (MP4)</span>
            </button>

            {uploads.length > 0 && (
              <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                {uploads.map(u => (
                  <div key={u.id} className="flex items-center gap-3 rounded-xl bg-cream p-2.5">
                    <span className="material-symbols-rounded text-xl text-dark-muted">
                      {u.type === 'image' ? 'image' : 'videocam'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-dark truncate">{u.name}</p>
                      <p className="text-xs text-dark-muted">{u.size}</p>
                    </div>
                    <button onClick={() => removeUpload(u.id)} className="text-danger">
                      <span className="material-symbols-rounded text-lg">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowUploadModal(false)}
              className="w-full h-12 rounded-xl bg-primary text-white font-bold text-sm"
            >
              Done
            </button>
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
