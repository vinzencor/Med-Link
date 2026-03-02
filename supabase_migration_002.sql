-- ============================================================
-- NurseConnect Pro — Migration 002: New Feature Schema
-- Run via: supabase db push  OR  psql -f this file
-- ============================================================

-- ─── profiles table additions ────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS video_url          TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS video_status       TEXT    DEFAULT 'pending' CHECK (video_status IN ('pending','approved','rejected'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS employer_status    TEXT    DEFAULT 'pending' CHECK (employer_status IN ('pending','approved','suspended'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consent_given      BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consent_date       TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auto_renew         BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reveals_total      INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reveals_used       INTEGER DEFAULT 0;

-- ─── notifications ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type        TEXT        NOT NULL CHECK (type IN ('job_match','badge','payment','verification','general')),
    title       TEXT        NOT NULL,
    message     TEXT,
    read        BOOLEAN     DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_notifications" ON notifications
    FOR ALL USING (auth.uid() = user_id);

-- ─── audit_logs ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    action      TEXT        NOT NULL,
    target_type TEXT        NOT NULL,
    target_id   UUID,
    actor_id    UUID        REFERENCES auth.users(id),
    metadata    JSONB       DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Only admins should read audit logs; service role writes
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins_read_audit_logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- ─── payment_logs ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_logs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL REFERENCES auth.users(id),
    amount          NUMERIC(10,2) NOT NULL,
    currency        TEXT        DEFAULT 'USD',
    plan_id         TEXT,
    add_on_id       TEXT,
    status          TEXT        DEFAULT 'completed' CHECK (status IN ('completed','failed','refunded')),
    gateway_ref     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_payments" ON payment_logs
    FOR SELECT USING (auth.uid() = user_id);

-- ─── certificates ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS certificates (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    partner_id  TEXT        NOT NULL,
    file_url    TEXT        NOT NULL,
    verified    BOOLEAN     DEFAULT FALSE,
    badge_name  TEXT,
    issued_at   TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_certificates" ON certificates
    FOR ALL USING (auth.uid() = user_id);

-- ─── ads ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ads (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    title       TEXT        NOT NULL,
    partner_id  TEXT,
    placement   TEXT        NOT NULL CHECK (placement IN ('job_feed_top','dashboard_banner','sidebar','feed_inline')),
    image_url   TEXT,
    link_url    TEXT,
    active      BOOLEAN     DEFAULT TRUE,
    impressions INTEGER     DEFAULT 0,
    starts_at   DATE,
    ends_at     DATE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── partners ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS partners (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT        NOT NULL,
    category        TEXT        NOT NULL,
    logo_url        TEXT,
    website_url     TEXT,
    commission_pct  NUMERIC(5,2) DEFAULT 0,
    badge_name      TEXT,
    active          BOOLEAN     DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── user_add_ons ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_add_ons (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    add_on_id   TEXT        NOT NULL,
    name        TEXT        NOT NULL,
    price       NUMERIC(10,2),
    purchased_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_add_ons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_add_ons" ON user_add_ons
    FOR ALL USING (auth.uid() = user_id);

-- ─── Supabase Storage Buckets (run via dashboard or CLI) ─────
-- supabase storage create profile-videos --public
-- supabase storage create profile-avatars --public
-- supabase storage create application-cvs --private
-- supabase storage create user-documents  --private
-- supabase storage create ad-images       --public
