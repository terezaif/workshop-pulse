import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useWorkshop } from '../hooks/useWorkshop';
import { useRealtimeFeedback } from '../hooks/useRealtimeFeedback';
import FeedbackCard from '../components/FeedbackCard';
import SectionNav from '../components/SectionNav';
import SentimentChart from '../components/SentimentChart';
import { exportToCSV } from '../utils/export';

export default function Dashboard() {
  const { workshopId } = useParams<{ workshopId: string }>();
  const { workshop, sections, loading: wsLoading } = useWorkshop(workshopId);
  const { feedback, loading: fbLoading } = useRealtimeFeedback(workshopId);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const feedbackCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const f of feedback) {
      counts[f.section_id] = (counts[f.section_id] || 0) + 1;
    }
    return counts;
  }, [feedback]);

  const sentimentCounts = useMemo(() => {
    const filtered = activeSection
      ? feedback.filter((f) => f.section_id === activeSection)
      : feedback;
    return {
      positive: filtered.filter((f) => f.sentiment === 'positive').length,
      neutral: filtered.filter((f) => f.sentiment === 'neutral').length,
      negative: filtered.filter((f) => f.sentiment === 'negative').length,
    };
  }, [feedback, activeSection]);

  const displayedFeedback = activeSection
    ? feedback.filter((f) => f.section_id === activeSection)
    : feedback;

  const handleExport = () => {
    if (!workshop) return;
    const rows = feedback.map((f) => ({
      section_title: f.section_title ?? '',
      nickname: f.nickname ?? '',
      sentiment: f.sentiment,
      message: f.message,
      created_at: f.created_at,
      is_final_feedback: f.is_final_feedback,
    }));
    exportToCSV(rows, workshop.title);
  };

  if (wsLoading) return <div className="page-container text-center">Loading...</div>;
  if (!workshop) return <div className="page-container text-center">Workshop not found.</div>;

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-lg animate-in">
        <div>
          <h2>{workshop.title}</h2>
          <div className="flex items-center gap-sm mt-sm">
            <span className="badge badge-purple">
              Code: {workshop.join_code}
            </span>
            <span className="text-sm text-muted">
              {feedback.length} response{feedback.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleExport}>
          📥 Export CSV
        </button>
      </div>

      <div className="sidebar-layout">
        <div className="animate-in stagger-1">
          <SectionNav
            sections={sections}
            activeId={activeSection}
            onSelect={(id) => setActiveSection(activeSection === id ? null : id)}
            feedbackCounts={feedbackCounts}
          />
          <button
            className={`section-nav-item ${activeSection === null ? 'active' : ''}`}
            onClick={() => setActiveSection(null)}
            style={{ marginTop: 'var(--space-sm)' }}
          >
            All Sections
          </button>
        </div>

        <div>
          <div className="card mb-md animate-in stagger-2">
            <h3 className="mb-sm">Sentiment Overview</h3>
            <SentimentChart {...sentimentCounts} />
            <div className="flex gap-md mt-sm text-sm">
              <span className="badge badge-positive">😊 {sentimentCounts.positive}</span>
              <span className="badge badge-neutral">😐 {sentimentCounts.neutral}</span>
              <span className="badge badge-negative">😟 {sentimentCounts.negative}</span>
            </div>
          </div>

          {fbLoading ? (
            <p className="text-muted">Loading feedback...</p>
          ) : displayedFeedback.length === 0 ? (
            <div className="card text-center text-muted" style={{ padding: 'var(--space-2xl)' }}>
              <p style={{ fontSize: '2rem', marginBottom: 'var(--space-sm)' }}>🎧</p>
              <p>Waiting for feedback...</p>
              <p className="text-sm mt-sm">
                Share code <strong>{workshop.join_code}</strong> with participants
              </p>
            </div>
          ) : (
            <div className="flex-col gap-sm">
              {displayedFeedback.map((entry) => (
                <FeedbackCard
                  key={entry.id}
                  entry={entry}
                  showNickname
                  showSection={!activeSection}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
