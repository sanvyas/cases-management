import { useState } from 'react';
import { PLANS } from '../data/mockData';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
];

interface Props {
  onBack: () => void;
  onCreate: (name: string, type: string, planId: string, extra: { state: string; contactName: string; contactEmail: string }) => void;
}

const BODY_TYPES = [
  { key: 'nagar_nigam', label: 'Nagar Nigam', icon: 'location_city', desc: 'Municipal Corporation' },
  { key: 'nagar_palika', label: 'Nagar Palika', icon: 'apartment', desc: 'Nagar Palika Parishad' },
  { key: 'nagar_panchayat', label: 'Nagar Panchayat', icon: 'home_work', desc: 'Town Panchayat' },
  { key: 'zila_parishad', label: 'Zila Parishad', icon: 'domain', desc: 'District Council' },
  { key: 'block', label: 'Block', icon: 'grid_view', desc: 'Block Development Office' },
  { key: 'gram_panchayat', label: 'Gram Panchayat', icon: 'cottage', desc: 'Village Council' },
  { key: 'development_authority', label: 'Dev. Authority', icon: 'engineering', desc: 'Development Authority' },
  { key: 'smart_city', label: 'Smart City SPV', icon: 'smart_toy', desc: 'Smart City Mission' },
];

export function NewEnvironmentPage({ onBack, onCreate }: Props) {
  const [step, setStep] = useState(1);
  const [bodyType, setBodyType] = useState('');
  const [name, setName] = useState('');
  const [state, setState] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');

  function handleCreate() {
    if (name && bodyType && selectedPlan) {
      onCreate(name, bodyType, selectedPlan, { state, contactName, contactEmail });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-cream-dark">
          <span className="material-symbols-rounded text-2xl text-dark">arrow_back</span>
        </button>
        <div>
          <h2 className="text-2xl font-extrabold text-dark">New Environment</h2>
          <p className="text-sm text-dark-muted">Set up a new tenant deployment</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
              style={{
                background: step >= s ? '#C24E33' : '#E3D6C6',
                color: step >= s ? '#fff' : '#8A7766',
              }}
            >
              {s}
            </div>
            <span className="text-sm font-bold" style={{ color: step >= s ? '#2A1F17' : '#8A7766' }}>
              {s === 1 ? 'Type' : s === 2 ? 'Details' : 'Plan'}
            </span>
            {s < 3 && <div className="w-12 h-0.5 rounded" style={{ background: step > s ? '#C24E33' : '#E3D6C6' }} />}
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-6" style={{ boxShadow: '0 1px 0 #EADFD2' }}>
        {step === 1 && (
          <div>
            <h3 className="text-base font-extrabold text-dark mb-4">Select Body Type</h3>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {BODY_TYPES.map(bt => (
                <button
                  key={bt.key}
                  onClick={() => { setBodyType(bt.key); setStep(2); }}
                  className="flex flex-col items-center gap-2 rounded-2xl border-2 p-5 transition-colors hover:border-primary"
                  style={{
                    borderColor: bodyType === bt.key ? '#C24E33' : '#E3D6C6',
                    background: bodyType === bt.key ? '#FBE3D9' : 'transparent',
                  }}
                >
                  <span className="material-symbols-rounded text-3xl" style={{ color: bodyType === bt.key ? '#C24E33' : '#8A7766' }}>
                    {bt.icon}
                  </span>
                  <span className="text-sm font-bold text-dark">{bt.label}</span>
                  <span className="text-xs text-dark-muted">{bt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-lg space-y-4">
            <h3 className="text-base font-extrabold text-dark mb-4">Environment Details</h3>
            <div>
              <label className="block text-xs font-bold text-dark-muted mb-1.5">Organization Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full h-12 rounded-xl border-2 border-cream-darker bg-cream px-4 text-sm font-bold text-dark outline-none focus:border-primary"
                placeholder="e.g. Nagar Nigam, Lucknow"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-dark-muted mb-1.5">State</label>
              <select
                value={state}
                onChange={e => setState(e.target.value)}
                className="w-full h-12 rounded-xl border-2 border-cream-darker bg-cream px-4 text-sm font-bold text-dark outline-none focus:border-primary appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%234A3E34' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-dark-muted mb-1.5">Contact Person</label>
              <input
                type="text"
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                className="w-full h-12 rounded-xl border-2 border-cream-darker bg-cream px-4 text-sm font-bold text-dark outline-none focus:border-primary"
                placeholder="e.g. Sh. Ravi Kumar"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-dark-muted mb-1.5">Contact Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                className="w-full h-12 rounded-xl border-2 border-cream-darker bg-cream px-4 text-sm font-bold text-dark outline-none focus:border-primary"
                placeholder="e.g. eo@lucknow.gov.in"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="flex h-12 items-center gap-2 rounded-xl border-2 border-cream-darker bg-white px-6 text-sm font-bold text-dark"
              >
                Back
              </button>
              <button
                onClick={() => name && state && setStep(3)}
                disabled={!name || !state}
                className="flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white disabled:opacity-40"
              >
                Continue
                <span className="material-symbols-rounded text-lg">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="text-base font-extrabold text-dark mb-4">Select Plan</h3>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
              {PLANS.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className="flex flex-col rounded-2xl border-2 p-5 text-left transition-colors"
                  style={{
                    borderColor: selectedPlan === plan.id ? '#C24E33' : '#E3D6C6',
                    background: selectedPlan === plan.id ? '#FBE3D9' : 'transparent',
                  }}
                >
                  <h4 className="text-lg font-extrabold text-dark">{plan.name}</h4>
                  <p className="text-2xl font-extrabold text-primary mt-1">
                    {(plan.monthlyPrice / 1000).toFixed(0)}K
                    <span className="text-xs font-bold text-dark-muted"> /month</span>
                  </p>
                  <div className="mt-3 text-xs text-dark-muted space-y-1">
                    <p>{plan.limits.casesPerDay?.toLocaleString('en-IN')} cases/day</p>
                    <p>{plan.limits.staffUsers} staff users</p>
                    <p>{plan.limits.storageGB} GB storage</p>
                    <p>{plan.modules.length} modules</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(2)}
                className="flex h-12 items-center gap-2 rounded-xl border-2 border-cream-darker bg-white px-6 text-sm font-bold text-dark"
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={!selectedPlan}
                className="flex h-12 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-white disabled:opacity-40"
              >
                <span className="material-symbols-rounded text-lg">rocket_launch</span>
                Create Environment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
