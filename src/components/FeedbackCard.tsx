import type { FeedbackEntry } from '../hooks/useRealtimeFeedback';

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

interface Props {
  entry: FeedbackEntry;
  showNickname?: boolean;
  showSection?: boolean;
}

export default function FeedbackCard({ entry, showNickname = false, showSection = false }: Props) {
  return (
    <div className={`feedback-entry ${entry.sentiment} animate-in`}>
      <div className="meta">
        <span className={`badge badge-${entry.sentiment}`}>{entry.sentiment}</span>
        {showNickname && <span>{entry.nickname}</span>}
        {showSection && <span>in {entry.section_title}</span>}
        <span style={{ marginLeft: 'auto' }}>{timeAgo(entry.created_at)}</span>
      </div>
      <div className="message">{entry.message}</div>
    </div>
  );
}
