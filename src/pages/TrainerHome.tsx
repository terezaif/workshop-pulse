import { useNavigate } from 'react-router-dom';
import { useWorkshops } from '../hooks/useWorkshop';

export default function TrainerHome() {
  const navigate = useNavigate();
  const { workshops, loading, error } = useWorkshops();

  if (loading) return <div className="page-container text-center">Loading workshops...</div>;

  return (
    <div className="page-container" style={{ maxWidth: 720 }}>
      <div className="flex justify-between items-center mb-lg animate-in">
        <h2>Your Workshops</h2>
        <button className="btn btn-primary" onClick={() => navigate('/create')}>
          + New Workshop
        </button>
      </div>

      {error && (
        <div className="card animate-in" style={{ borderColor: 'var(--orange)', color: 'var(--orange)' }}>
          {error}
        </div>
      )}

      {workshops.length === 0 && !error && (
        <div className="card animate-in stagger-1" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
          <p className="text-muted mb-md">No workshops yet.</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/create')}>
            Create Your First Workshop
          </button>
        </div>
      )}

      <div className="flex-col gap-md">
        {workshops.map((ws, i) => (
          <div
            key={ws.id}
            className={`card animate-in stagger-${Math.min(i + 1, 5)}`}
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/dashboard/${ws.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate(`/dashboard/${ws.id}`)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 style={{ marginBottom: 'var(--space-xs)' }}>{ws.title}</h3>
                <div className="flex items-center gap-sm">
                  <span className="badge badge-purple">{ws.join_code}</span>
                  <span className="text-sm text-muted">by {ws.trainer_name}</span>
                  <span className="text-sm text-muted">·</span>
                  <span className="text-sm text-muted">
                    {new Date(ws.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <span style={{ fontSize: '1.2rem', color: 'var(--purple)' }}>→</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
