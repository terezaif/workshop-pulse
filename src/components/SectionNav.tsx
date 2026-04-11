import type { Section } from '../hooks/useWorkshop';

interface Props {
  sections: Section[];
  activeId: string | null;
  onSelect: (id: string) => void;
  feedbackCounts?: Record<string, number>;
  showFinal?: boolean;
  finalActive?: boolean;
  onFinalSelect?: () => void;
}

export default function SectionNav({
  sections,
  activeId,
  onSelect,
  feedbackCounts = {},
  showFinal = false,
  finalActive = false,
  onFinalSelect,
}: Props) {
  return (
    <nav className="section-nav">
      {sections.map((s) => (
        <button
          key={s.id}
          className={`section-nav-item ${activeId === s.id && !finalActive ? 'active' : ''}`}
          onClick={() => onSelect(s.id)}
        >
          <span>{s.title}</span>
          {feedbackCounts[s.id] != null && (
            <span className="section-count">{feedbackCounts[s.id]}</span>
          )}
        </button>
      ))}
      {showFinal && (
        <button
          className={`section-nav-item ${finalActive ? 'active' : ''}`}
          onClick={onFinalSelect}
          style={{ borderTop: '1px solid var(--border)', marginTop: 'var(--space-sm)' }}
        >
          <span>✨ Final Feedback</span>
        </button>
      )}
    </nav>
  );
}
