import { useState } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { mockCases, STATUS_CONFIG, PRIORITY_CONFIG } from '../data/mockData';
import type { CaseStatus } from '../types';

export function TaskDetailPage() {
  const { taskId } = useParams({ strict: false }) as { taskId: string };
  const original = mockCases.find((c) => c.id === taskId);
  const [status, setStatus] = useState<CaseStatus | null>(original?.status ?? null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [atrNote, setAtrNote] = useState('');
  const [showAtrForm, setShowAtrForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!original) {
    return (
      <div className="py-12 text-center">
        <p className="text-dark-muted">Task not found.</p>
        <Link to="/tasks" className="mt-4 inline-block text-sm font-bold text-primary hover:underline">
          Back to tasks
        </Link>
      </div>
    );
  }

  const st = status ? STATUS_CONFIG[status] : null;
  const pr = PRIORITY_CONFIG[original.priority];

  function handleAccept() {
    setStatus('ACCEPTED');
  }

  function handleStartWork() {
    setStatus('IN_PROGRESS');
  }

  function handlePhotoCapture() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = () => {
      if (input.files?.[0]) {
        const url = URL.createObjectURL(input.files[0]);
        setPhotos((prev) => [...prev, url]);
      }
    };
    input.click();
  }

  function handleSubmitAtr() {
    setStatus('ATR_SUBMITTED');
    setShowAtrForm(false);
    setSubmitted(true);
  }

  const isAssigned = status === 'ASSIGNED';
  const isAccepted = status === 'ACCEPTED';
  const isInProgress = status === 'IN_PROGRESS';
  const isAtrOrBeyond = status === 'ATR_SUBMITTED' || status === 'RESOLVED' || status === 'CLOSED';

  return (
    <div className="flex flex-col min-h-0">
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-cream-darker">
        <Link to="/tasks" className="flex items-center gap-1 text-sm font-bold text-primary mb-2">
          <span className="material-symbols-rounded text-lg">arrow_back</span>
          My Tasks
        </Link>
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-xl flex items-center justify-center flex-none" style={{ background: original.iconBg }}>
            <span className="material-symbols-rounded text-2xl" style={{ color: original.iconFg }}>{original.icon}</span>
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold text-dark">{original.caseNumber}</span>
              {pr && (
                <span className="rounded-lg px-1.5 py-0.5 text-xs font-bold" style={{ background: pr.bg, color: pr.fg }}>
                  {pr.label}
                </span>
              )}
            </div>
            <p className="text-sm text-dark-muted">{original.complaintType} · {original.subType}</p>
          </div>
          {st && (
            <span className="flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold flex-none" style={{ background: st.bg, color: st.fg }}>
              <span className="material-symbols-rounded text-sm">{st.icon}</span>
              {st.label}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {/* Submitted banner */}
        {submitted && (
          <div className="rounded-2xl bg-success-light p-4 flex items-center gap-3">
            <span className="material-symbols-rounded text-3xl text-success">task_alt</span>
            <div>
              <p className="text-base font-extrabold text-success">ATR Submitted</p>
              <p className="text-sm" style={{ color: '#2F6A47' }}>Waiting for officer approval.</p>
            </div>
          </div>
        )}

        {/* Complaint Details */}
        <div className="rounded-2xl bg-white p-4 flex flex-col gap-3" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
          <div className="flex items-center gap-2 text-sm font-bold text-dark-muted">
            <span className="material-symbols-rounded text-lg">description</span>
            Complaint Details
          </div>
          <p className="text-sm text-dark-secondary leading-relaxed">{original.description}</p>
        </div>

        {/* Location */}
        <div className="rounded-2xl bg-white p-4 flex flex-col gap-3" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
          <div className="flex items-center gap-2 text-sm font-bold text-dark-muted">
            <span className="material-symbols-rounded text-lg">location_on</span>
            Location
          </div>
          <p className="text-sm font-bold text-dark">{original.location}</p>
          <p className="text-xs text-dark-muted">{original.zone}, {original.ward}</p>
          <div
            className="h-32 rounded-xl flex items-center justify-center"
            style={{ background: 'repeating-linear-gradient(135deg, #E9DFD2 0 10px, #F1E8DD 10px 20px)' }}
          >
            <span className="text-sm text-dark-muted">Map placeholder</span>
          </div>
        </div>

        {/* Citizen Info */}
        <div className="rounded-2xl bg-white p-4 flex flex-col gap-3" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
          <div className="flex items-center gap-2 text-sm font-bold text-dark-muted">
            <span className="material-symbols-rounded text-lg">person</span>
            Citizen
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-dark">{original.citizenName}</p>
              <p className="text-xs text-dark-muted">{original.citizenPhone}</p>
            </div>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-light text-success">
              <span className="material-symbols-rounded text-xl">call</span>
            </button>
          </div>
        </div>

        {/* SLA */}
        <div className="rounded-2xl bg-white p-4 flex items-center gap-3" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
          <span className="material-symbols-rounded text-2xl text-warning">schedule</span>
          <div>
            <p className="text-xs font-bold text-dark-muted">SLA Deadline</p>
            <p className="text-sm font-bold text-dark">
              {new Date(original.slaDueAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Photo proofs (for in-progress state) */}
        {(isInProgress || isAccepted) && !showAtrForm && (
          <div className="rounded-2xl bg-white p-4 flex flex-col gap-3" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
            <div className="flex items-center gap-2 text-sm font-bold text-dark-muted">
              <span className="material-symbols-rounded text-lg">photo_camera</span>
              Work Photos
            </div>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((url, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden h-24">
                  <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-danger text-white flex items-center justify-center"
                  >
                    <span className="material-symbols-rounded text-sm">close</span>
                  </button>
                </div>
              ))}
              <button
                onClick={handlePhotoCapture}
                className="h-24 rounded-xl border-2 border-dashed border-cream-darker flex flex-col items-center justify-center gap-1 text-dark-muted hover:bg-cream"
              >
                <span className="material-symbols-rounded text-2xl">add_a_photo</span>
                <span className="text-xs font-bold">Add Photo</span>
              </button>
            </div>
          </div>
        )}

        {/* ATR Form */}
        {showAtrForm && (
          <div className="rounded-2xl bg-white p-4 flex flex-col gap-4" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
            <div className="flex items-center gap-2 text-base font-extrabold text-dark">
              <span className="material-symbols-rounded text-xl text-primary">description</span>
              Submit ATR
            </div>

            <div>
              <label className="block text-sm font-bold text-dark mb-1">Work description</label>
              <textarea
                rows={3}
                value={atrNote}
                onChange={(e) => setAtrNote(e.target.value)}
                placeholder="Describe the work done..."
                className="w-full rounded-xl border-2 border-cream-darker bg-cream px-4 py-3 text-sm outline-none focus:border-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-dark mb-2">Proof photos</label>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((url, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden h-24">
                    <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-danger text-white flex items-center justify-center"
                    >
                      <span className="material-symbols-rounded text-sm">close</span>
                    </button>
                  </div>
                ))}
                <button
                  onClick={handlePhotoCapture}
                  className="h-24 rounded-xl border-2 border-dashed border-cream-darker flex flex-col items-center justify-center gap-1 text-dark-muted hover:bg-cream"
                >
                  <span className="material-symbols-rounded text-2xl">add_a_photo</span>
                  <span className="text-xs font-bold">Add</span>
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAtrForm(false)}
                className="flex-1 h-12 rounded-xl border-2 border-cream-darker bg-white text-dark font-bold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAtr}
                className="flex-1 h-12 rounded-xl bg-primary text-white font-bold text-sm flex items-center justify-center gap-2"
              >
                <span className="material-symbols-rounded text-xl">send</span>
                Submit ATR
              </button>
            </div>
          </div>
        )}

        {/* ATR submitted info */}
        {isAtrOrBeyond && !submitted && (
          <div className="rounded-2xl bg-white p-4 flex flex-col gap-3" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
            <div className="flex items-center gap-2 text-sm font-bold text-dark-muted">
              <span className="material-symbols-rounded text-lg">description</span>
              ATR Report
            </div>
            <p className="text-sm text-dark-secondary">Action taken report has been submitted. Awaiting officer review.</p>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="rounded-xl overflow-hidden h-20" style={{ background: 'repeating-linear-gradient(135deg, #E9DFD2 0 10px, #F1E8DD 10px 20px)' }}>
                  <div className="h-full flex items-center justify-center">
                    <span className="material-symbols-rounded text-xl text-dark-muted">image</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      {!showAtrForm && !submitted && !isAtrOrBeyond && (
        <div className="flex-none px-4 py-3 bg-white border-t border-cream-darker">
          {isAssigned && (
            <button
              onClick={handleAccept}
              className="w-full h-14 rounded-xl bg-primary text-white text-lg font-bold flex items-center justify-center gap-2"
            >
              <span className="material-symbols-rounded text-2xl">check_circle</span>
              Accept Task
            </button>
          )}
          {isAccepted && (
            <button
              onClick={handleStartWork}
              className="w-full h-14 rounded-xl bg-warning text-white text-lg font-bold flex items-center justify-center gap-2"
            >
              <span className="material-symbols-rounded text-2xl">engineering</span>
              Start Work
            </button>
          )}
          {isInProgress && (
            <button
              onClick={() => setShowAtrForm(true)}
              className="w-full h-14 rounded-xl bg-success text-white text-lg font-bold flex items-center justify-center gap-2"
            >
              <span className="material-symbols-rounded text-2xl">description</span>
              Submit ATR Report
            </button>
          )}
        </div>
      )}
    </div>
  );
}
