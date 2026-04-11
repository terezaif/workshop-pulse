import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const [joinCode, setJoinCode] = useState('');
  const navigate = useNavigate();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (code) navigate(`/survey/${code}`);
  };

  return (
    <div className="page-container">
      <section className="hero">
        <h1 className="animate-in">
          Workshop<br />
          <span style={{ color: 'var(--orange)' }}>Pulse</span>
        </h1>
        <p className="subtitle animate-in stagger-1">
          Real-time feedback for live workshops. Share your thoughts as it happens —
          not just at the end.
        </p>

        <div className="hero-actions animate-in stagger-2">
          <div className="card" style={{ padding: 'var(--space-xl)', minWidth: 300 }}>
            <h3 style={{ marginBottom: 'var(--space-md)' }}>Join a Workshop</h3>
            <form onSubmit={handleJoin} className="flex-col gap-md">
              <div className="input-group">
                <label htmlFor="join-code">Join Code</label>
                <input
                  id="join-code"
                  className="input"
                  type="text"
                  placeholder="e.g. ABC123"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '0.15em', fontWeight: 700 }}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg w-full" disabled={joinCode.trim().length < 6}>
                Join →
              </button>
            </form>
          </div>
        </div>

        <div className="animate-in stagger-3 mt-xl">
          <button className="btn btn-ghost" onClick={() => navigate('/create')}>
            I'm a trainer — Create Workshop
          </button>
        </div>
      </section>
    </div>
  );
}
