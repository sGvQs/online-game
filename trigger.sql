CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_user_id uuid;
BEGIN
  INSERT INTO public.users (name, email)
  VALUES (new.raw_user_meta_data->>'name', new.email)
  RETURNING id INTO new_user_id;

  INSERT INTO public.user_idp (supabase_uid, user_id)
  VALUES (new.id, new_user_id);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
