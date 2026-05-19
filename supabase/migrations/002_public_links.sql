CREATE TABLE IF NOT EXISTS public_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id uuid NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  expires_at timestamptz,
  password_hash text,
  permission text NOT NULL DEFAULT 'view' CHECK (permission IN ('view', 'view+download')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_all" ON public_links
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "public_read" ON public_links
  FOR SELECT USING (true);
