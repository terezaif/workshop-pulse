interface Props {
  positive: number;
  neutral: number;
  negative: number;
}

export default function SentimentChart({ positive, neutral, negative }: Props) {
  const total = positive + neutral + negative;
  if (total === 0) {
    return <div className="sentiment-bar"><div className="segment" style={{ width: '100%', background: 'var(--border-light)' }} /></div>;
  }

  return (
    <div className="sentiment-bar">
      <div className="segment positive" style={{ width: `${(positive / total) * 100}%` }} />
      <div className="segment neutral" style={{ width: `${(neutral / total) * 100}%` }} />
      <div className="segment negative" style={{ width: `${(negative / total) * 100}%` }} />
    </div>
  );
}
