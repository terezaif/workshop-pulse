-- Workshop Pulse — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- Workshops created by trainers
CREATE TABLE workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  join_code TEXT UNIQUE NOT NULL,
  trainer_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sections within a workshop
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Participant registrations
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(workshop_id, nickname)
);

-- Feedback entries
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE,
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  sentiment TEXT CHECK(sentiment IN ('positive', 'neutral', 'negative')),
  message TEXT NOT NULL,
  is_final_feedback BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Realtime on the feedback table
ALTER PUBLICATION supabase_realtime ADD TABLE feedback;

-- Row Level Security
ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Workshops: anyone can read and create
CREATE POLICY "Anyone can read workshops" ON workshops FOR SELECT USING (true);
CREATE POLICY "Anyone can create workshops" ON workshops FOR INSERT WITH CHECK (true);

-- Sections: anyone can read and create
CREATE POLICY "Anyone can read sections" ON sections FOR SELECT USING (true);
CREATE POLICY "Anyone can create sections" ON sections FOR INSERT WITH CHECK (true);

-- Participants: anyone can read and join
CREATE POLICY "Anyone can read participants" ON participants FOR SELECT USING (true);
CREATE POLICY "Anyone can join" ON participants FOR INSERT WITH CHECK (true);

-- Feedback: anyone can read and submit
CREATE POLICY "Anyone can read feedback" ON feedback FOR SELECT USING (true);
CREATE POLICY "Anyone can submit feedback" ON feedback FOR INSERT WITH CHECK (true);
