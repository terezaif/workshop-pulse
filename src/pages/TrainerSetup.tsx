import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { useCreateWorkshop } from '../hooks/useWorkshop';
import { generateJoinCode } from '../utils/joinCode';

interface CreatedWorkshop {
  id: string;
  join_code: string;
  title: string;
}

export default function TrainerSetup() {
  const navigate = useNavigate();
  const { create, loading, error } = useCreateWorkshop();
  const [title, setTitle] = useState('');
  const [trainerName, setTrainerName] = useState('');
  const [sections, setSections] = useState(['']);
  const [created, setCreated] = useState<CreatedWorkshop | null>(null);
  const [copied, setCopied] = useState(false);

  const addSection = () => setSections((prev) => [...prev, '']);
  const removeSection = (i: number) => setSections((prev) => prev.filter((_, idx) => idx !== i));
  const updateSection = (i: number, val: string) =>
    setSections((prev) => prev.map((s, idx) => (idx === i ? val : s)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validSections = sections.filter((s) => s.trim());
    if (!title.trim() || !trainerName.trim() || validSections.length === 0) return;

    const joinCode = generateJoinCode();
    const ws = await create(title.trim(), trainerName.trim(), joinCode, validSections);
    if (ws) {
      setCreated({ id: ws.id, join_code: ws.join_code, title: ws.title });
    }
  };

  const surveyUrl = created
    ? `${window.location.origin}/survey/${created.join_code}`
    : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(surveyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for insecure contexts
      const input = document.createElement('input');
      input.value = surveyUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (created) {
    return (
      <div className="page-container" style={{ maxWidth: 540, textAlign: 'center' }}>
        <div className="animate-in">
          <span style={{ fontSize: '3rem' }}>🎉</span>
          <h2 className="mt-sm mb-sm">Workshop Created!</h2>
          <p className="text-muted mb-lg">{created.title}</p>
        </div>

        <div className="card animate-in stagger-1" style={{ padding: 'var(--space-xl)' }}>
          <p className="text-sm text-muted mb-md">
            Share this with your participants
          </p>

          <div style={{
            background: 'white',
            padding: 'var(--space-lg)',
            borderRadius: 'var(--radius-lg)',
            display: 'inline-block',
            marginBottom: 'var(--space-lg)',
          }}>
            <QRCode value={surveyUrl} size={200} level="M" />
          </div>

          <div className="mb-md">
            <span className="badge badge-purple" style={{ fontSize: '1.6rem', padding: '0.5em 1em', letterSpacing: '0.15em' }}>
              {created.join_code}
            </span>
          </div>

          <div className="input-group mb-md">
            <label htmlFor="share-url" className="text-sm text-muted">Direct Link</label>
            <div className="flex gap-sm">
              <input
                id="share-url"
                className="input w-full"
                value={surveyUrl}
                readOnly
                style={{ fontSize: '0.85rem' }}
              />
              <button className="btn btn-secondary btn-sm" onClick={handleCopyLink}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-col gap-sm mt-lg animate-in stagger-2">
          <button
            className="btn btn-primary btn-lg w-full"
            onClick={() => navigate(`/dashboard/${created.id}`)}
          >
            Open Live Dashboard →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 640 }}>
      <h2 className="animate-in mb-lg">Create Workshop</h2>

      <form onSubmit={handleSubmit} className="flex-col gap-md">
        <div className="card animate-in stagger-1">
          <div className="input-group mb-md">
            <label htmlFor="title">Workshop Title</label>
            <input
              id="title"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Introduction to React"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="trainer">Your Name</label>
            <input
              id="trainer"
              className="input"
              value={trainerName}
              onChange={(e) => setTrainerName(e.target.value)}
              placeholder="e.g. Alex"
              required
            />
          </div>
        </div>

        <div className="card animate-in stagger-2">
          <h3 className="mb-md">Workshop Sections</h3>
          <p className="text-sm text-muted mb-md">
            Participants will give feedback per section. Add them in order.
          </p>

          {sections.map((sec, i) => (
            <div key={i} className="flex items-center gap-sm mb-sm">
              <span className="text-muted text-sm" style={{ minWidth: 24 }}>
                {i + 1}.
              </span>
              <input
                className="input w-full"
                value={sec}
                onChange={(e) => updateSection(i, e.target.value)}
                placeholder={`Section ${i + 1} title`}
              />
              {sections.length > 1 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => removeSection(i)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button type="button" className="btn btn-secondary btn-sm mt-sm" onClick={addSection}>
            + Add Section
          </button>
        </div>

        {error && (
          <div className="card" style={{ borderColor: 'var(--orange)', color: 'var(--orange)' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-lg w-full animate-in stagger-3"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Workshop'}
        </button>
      </form>
    </div>
  );
}
