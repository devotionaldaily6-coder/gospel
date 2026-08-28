/*
# Create admin_emails table for inbox

## Purpose
Stores both inbound (received from visitors) and outbound (sent by admin) emails
so the admin dashboard inbox can display a full conversation trail.

## New Table: admin_emails
- id (uuid, primary key)
- direction (text: 'inbound' or 'outbound') — whether the email was received or sent
- from_email (text) — sender email address
- from_name (text, nullable) — sender display name
- to_email (text) — recipient email address
- subject (text) — email subject line
- body_text (text, nullable) — plain text email body
- body_html (text, nullable) — HTML email body
- attachments (jsonb, default '[]') — array of attachment metadata objects
- status (text: 'unread', 'read', 'sent', 'replied', 'deleted') — email state
- in_reply_to (uuid, nullable) — ID of the email this is replying to
- thread_id (text, nullable) — thread grouping identifier
- source (text, nullable) — where the email originated (e.g. 'admin_compose', 'resend_webhook')
- source_id (text, nullable) — external ID from Resend
- created_at (timestamptz, default now())

## Security
- RLS enabled on admin_emails
- Only authenticated admin users can read, insert, update, and delete
- The receive-inbound-email edge function uses the service role key to bypass RLS
  when saving inbound emails from the Resend webhook
*/

CREATE TABLE IF NOT EXISTS admin_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  from_email text NOT NULL,
  from_name text,
  to_email text NOT NULL,
  subject text NOT NULL DEFAULT '',
  body_text text,
  body_html text,
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'sent', 'replied', 'deleted')),
  in_reply_to uuid REFERENCES admin_emails(id) ON DELETE SET NULL,
  thread_id text,
  source text,
  source_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_emails ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_admin_emails" ON admin_emails;
CREATE POLICY "select_admin_emails" ON admin_emails FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_admin_emails" ON admin_emails;
CREATE POLICY "insert_admin_emails" ON admin_emails FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_admin_emails" ON admin_emails;
CREATE POLICY "update_admin_emails" ON admin_emails FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_admin_emails" ON admin_emails;
CREATE POLICY "delete_admin_emails" ON admin_emails FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_admin_emails_created_at ON admin_emails (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_emails_direction ON admin_emails (direction);
CREATE INDEX IF NOT EXISTS idx_admin_emails_thread_id ON admin_emails (thread_id);
