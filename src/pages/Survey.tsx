import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useWorkshopByCode } from '../hooks/useWorkshop';
import { useParticipant } from '../hooks/useParticipant';
import { useSubmitFeedback, useMyFeedback } from '../hooks/useRealtimeFeedback';
import SentimentPicker from '../components/SentimentPicker';
import SectionNav from '../components/SectionNav';
import FeedbackCard from '../components/FeedbackCard';

export default function Survey() {
  const { joinCode } = useParams<{ joinCode: string }>();
  const { workshop, sections, loading: wsLoading, error: wsError } = useWorkshopByCode(joinCode);
  const { participant, join, loading: joinLoading, error: joinError } = useParticipant();
  const { submit, loading: submitLoading } = useSubmitFeedback();

  const [nickname, setNickname] = useState('');
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isFinal, setIsFinal] = useState(false);
  const [sentiment, setSentiment] = useState<'positive' | 'neutral' | 'negative' | null>(null);
  const [message, setMessage] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Final feedback fields
  const [whatWentWell, setWhatWentWell] = useState('');
  const [whatToImprove, setWhatToImprove] = useState('');
  const [trainerFeedback, setTrainerFeedback] = useState('');

  const { feedback: myFeedback, refresh } = useMyFeedback(participant?.id, workshop?.id);

  // Auto-select first section
  useEffect(() => {
    if (sections.length > 0 && !activeSection && !isFinal) {
      setActiveSection(sections[0].id);
    }
  }, [sections, activeSection, isFinal]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workshop || !nickname.trim()) return;
    await join(workshop.id, nickname.trim());
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workshop || !participant || !activeSection || !sentiment || !message.trim()) return;
    setSubmitError(null);

    try {
      await submit({
        workshop_id: workshop.id,
        section_id: activeSection,
        participant_id: participant.id,
        sentiment,
        message: message.trim(),
      });
      setMessage('');
      setSentiment(null);
      refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit feedback. Please try again.');
    }
  };

  const handleSubmitFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workshop || !participant || sections.length === 0) return;
    setSubmitError(null);

    const lastSection = sections[sections.length - 1];
    const parts: string[] = [];
    if (whatWentWell.trim()) parts.push(`What went well: ${whatWentWell.trim()}`);
    if (whatToImprove.trim()) parts.push(`What could improve: ${whatToImprove.trim()}`);
    if (trainerFeedback.trim()) parts.push(`Trainer feedback: ${trainerFeedback.trim()}`);

    if (parts.length === 0) return;

    try {
      await submit({
        workshop_id: workshop.id,
        section_id: lastSection.id,
        participant_id: participant.id,
        sentiment: 'positive',
        message: parts.join('\n\n'),
        is_final_feedback: true,
      });

      setWhatWentWell('');
      setWhatToImprove('');
      setTrainerFeedback('');
      refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit feedback. Please try again.');
    }
  };

  // Feed counts per section for the nav
  const feedbackCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const f of myFeedback) {
      counts[f.section_id] = (counts[f.section_id] || 0) + 1;
    }
    return counts;
  }, [myFeedback]);

  const sectionFeedback = myFeedback.filter(
    (f) => f.section_id === activeSection && !f.is_final_feedback
  );

  // Loading & error states
  if (wsLoading) return <div className="page-container text-center">Loading workshop...</div>;
  if (wsError) return <div className="page-container text-center" style={{ color: 'var(--orange)' }}>{wsError}</div>;
  if (!workshop) return <div className="page-container text-center">Workshop not found.</div>;

  // Join screen
  if (!participant || participant.workshop_id !== workshop.id) {
    return (
      <div className="page-container" style={{ maxWidth: 440 }}>
        <div className="card animate-in" style={{ padding: 'var(--space-xl)' }}>
          <h2 className="mb-sm">{workshop.title}</h2>
          <p className="text-muted mb-lg">by {workshop.trainer_name}</p>

          <form onSubmit={handleJoin} className="flex-col gap-md">
            <div className="input-group">
              <label htmlFor="nickname">Your Nickname</label>
              <input
                id="nickname"
                className="input"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. Alex"
                required
                autoFocus
              />
            </div>
            {joinError && <p style={{ color: 'var(--orange)' }}>{joinError}</p>}
            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={joinLoading}>
              {joinLoading ? 'Joining...' : 'Join Workshop'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-lg animate-in">
        <div>
          <h2>{workshop.title}</h2>
          <p className="text-sm text-muted">
            Logged in as <strong>{participant.nickname}</strong>
          </p>
        </div>
      </div>

      <div className="sidebar-layout">
        <div className="animate-in stagger-1">
          <SectionNav
            sections={sections}
            activeId={activeSection}
            onSelect={(id) => {
              setActiveSection(id);
              setIsFinal(false);
            }}
            feedbackCounts={feedbackCounts}
            showFinal
            finalActive={isFinal}
            onFinalSelect={() => {
              setIsFinal(true);
              setActiveSection(null);
            }}
          />
        </div>

        <div className="animate-in stagger-2">
          {isFinal ? (
            <div className="card">
              <h3 className="mb-md">✨ Final Feedback</h3>
              <p className="text-sm text-muted mb-lg">
                Share your overall thoughts on the workshop.
              </p>
              <form onSubmit={handleSubmitFinal} className="flex-col gap-md">
                <div className="input-group">
                  <label htmlFor="well">What went well?</label>
                  <textarea
                    id="well"
                    className="textarea"
                    value={whatWentWell}
                    onChange={(e) => setWhatWentWell(e.target.value)}
                    placeholder="The best parts of this workshop..."
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="improve">What could be improved?</label>
                  <textarea
                    id="improve"
                    className="textarea"
                    value={whatToImprove}
                    onChange={(e) => setWhatToImprove(e.target.value)}
                    placeholder="I wish we had more time for..."
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="trainer">Feedback for the trainer</label>
                  <textarea
                    id="trainer"
                    className="textarea"
                    value={trainerFeedback}
                    onChange={(e) => setTrainerFeedback(e.target.value)}
                    placeholder="Suggestions, appreciation, ideas..."
                  />
                </div>
                {submitError && <p style={{ color: 'var(--orange)' }}>{submitError}</p>}
                <button type="submit" className="btn btn-accent btn-lg w-full" disabled={submitLoading}>
                  {submitLoading ? 'Sending...' : 'Submit Final Feedback'}
                </button>
              </form>
            </div>
          ) : activeSection ? (
            <>
              <div className="card mb-md">
                <h3 className="mb-md">
                  {sections.find((s) => s.id === activeSection)?.title}
                </h3>
                <form onSubmit={handleSubmitFeedback} className="flex-col gap-md">
                  <div className="input-group">
                    <label>How's it going?</label>
                    <SentimentPicker value={sentiment} onChange={setSentiment} />
                  </div>
                  <div className="input-group">
                    <label htmlFor="msg">Your thoughts</label>
                    <textarea
                      id="msg"
                      className="textarea"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="What's on your mind? Share highlights, questions, or suggestions..."
                      required
                    />
                  </div>
                  {submitError && <p style={{ color: 'var(--orange)' }}>{submitError}</p>}
                  <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={submitLoading || !sentiment || !message.trim()}
                  >
                    {submitLoading ? 'Sending...' : 'Submit Feedback'}
                  </button>
                </form>
              </div>

              {sectionFeedback.length > 0 && (
                <div>
                  <h4 className="text-sm text-muted mb-sm">
                    Your previous feedback ({sectionFeedback.length})
                  </h4>
                  {sectionFeedback.map((f) => (
                    <FeedbackCard key={f.id} entry={f} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="card text-center text-muted" style={{ padding: 'var(--space-2xl)' }}>
              <p>← Select a section to start giving feedback</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
