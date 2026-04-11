interface Props {
  value: string | null;
  onChange: (value: 'positive' | 'neutral' | 'negative') => void;
}

const options = [
  { value: 'positive' as const, emoji: '😊', label: 'Great' },
  { value: 'neutral' as const, emoji: '😐', label: 'Okay' },
  { value: 'negative' as const, emoji: '😟', label: 'Needs work' },
];

export default function SentimentPicker({ value, onChange }: Props) {
  return (
    <div className="sentiment-picker">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`sentiment-option ${opt.value} ${value === opt.value ? 'active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          <span className="emoji">{opt.emoji}</span>
          {opt.label}
        </button>
      ))}
    </div>
  );
}
