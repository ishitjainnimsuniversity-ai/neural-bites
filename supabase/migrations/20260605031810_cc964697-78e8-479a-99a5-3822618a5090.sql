
-- profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  age int,
  sex text,
  height_cm numeric,
  weight_kg numeric,
  goal text,
  intensity text,
  target_fat_kg numeric,
  fasting_hours int,
  photo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles self select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles self insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles self delete" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);

-- course_progress (one row per user+course)
CREATE TABLE public.course_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id text NOT NULL,
  watched jsonb NOT NULL DEFAULT '{}'::jsonb,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  last_active_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_progress TO authenticated;
GRANT ALL ON public.course_progress TO service_role;
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cp self select" ON public.course_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "cp self insert" ON public.course_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cp self update" ON public.course_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cp self delete" ON public.course_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- exam_attempts
CREATE TABLE public.exam_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id text NOT NULL,
  exam_id text NOT NULL,
  score numeric NOT NULL,
  passed boolean NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.exam_attempts TO authenticated;
GRANT ALL ON public.exam_attempts TO service_role;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ea self select" ON public.exam_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "ea self insert" ON public.exam_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- certificates (publicly readable for verification)
CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  serial text NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id text NOT NULL,
  course_title text NOT NULL,
  user_name text NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.certificates TO anon;
GRANT SELECT, INSERT ON public.certificates TO authenticated;
GRANT ALL ON public.certificates TO service_role;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cert public select" ON public.certificates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "cert owner insert" ON public.certificates FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_cp_touch BEFORE UPDATE ON public.course_progress FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
