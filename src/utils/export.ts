interface FeedbackRow {
  section_title: string;
  nickname: string;
  sentiment: string;
  message: string;
  created_at: string;
  is_final_feedback: boolean;
}

export function exportToCSV(rows: FeedbackRow[], workshopTitle: string): void {
  const headers = ['Section', 'Participant', 'Sentiment', 'Message', 'Time', 'Final Feedback'];
  const csvRows = [
    headers.join(','),
    ...rows.map((r) =>
      [
        quote(r.section_title),
        quote(r.nickname),
        r.sentiment,
        quote(r.message),
        r.created_at,
        r.is_final_feedback ? 'Yes' : 'No',
      ].join(',')
    ),
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${workshopTitle.replace(/\s+/g, '-').toLowerCase()}-feedback.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function quote(str: string): string {
  // Sanitize CSV formula injection — prefix dangerous chars with a single quote
  let safe = str;
  if (/^[=+\-@\t\r]/.test(safe)) {
    safe = "'" + safe;
  }
  if (safe.includes(',') || safe.includes('"') || safe.includes('\n')) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}
