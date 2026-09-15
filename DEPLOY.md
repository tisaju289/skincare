# Notun customer er jonno setup (Supabase + Cloudflare Worker)

Website er code sobar jonno same thake. Sudhu niche 6 ta value change hoy.

---

## 1) Notun Supabase project banan

1. https://supabase.com -> New project.
2. Project ready hole: **SQL Editor -> New query**.
3. `supabase/setup/store-setup.sql` file ta pura copy kore paste korun -> **Run**.
   - Ei file e: sob table, enum, function, RLS policy, `media` storage bucket,
     ar default store settings + demo data create hoye jay.
4. **Authentication -> Providers -> Email** on rakhun.
   Instant login chaile "Confirm email" off kore din.

## 2) Admin account banan

1. Site er `/auth` page e giye email + password diye **Sign up** korun.
2. Abar Supabase SQL Editor e giye ei line ta run korun (apnar email diye):

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'you@example.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

3. Ekhon `/admin` e login kore sob kichu control korte parben.

## 3) Ei 6 ta variable bosan

Supabase Dashboard -> **Project Settings -> API** theke:

| Variable | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | anon / publishable key |
| `VITE_SUPABASE_PROJECT_ID` | project ref (URL er sub-domain ta) |
| `SUPABASE_URL` | same Project URL |
| `SUPABASE_PUBLISHABLE_KEY` | same anon key |
| `SUPABASE_PROJECT_ID` | same project ref |

> Service role key lage **na** — website er kothao eta use hoy na.

**Local e:** `.env.example` copy kore `.env` banie value bosan.

**Cloudflare Worker e:** `VITE_*` 3 ta **build time** e lagbe (Workers Build /
CI er Environment variables e din), ar `SUPABASE_*` 3 ta Worker er
**Variables and Secrets** e din. Shob 6 ta duijaygatei diye dile shob theke safe.

## 4) Build ar deploy

```bash
bun install
bun run build
npx wrangler deploy
```

Build er por Worker chalu hole storefront ar `/admin` duitai sathe sathe kaj korbe.

---

### Checklist (notun customer)

- [ ] Supabase project create
- [ ] `store-setup.sql` run
- [ ] Email auth on
- [ ] `/auth` e sign up + admin role SQL run
- [ ] 6 ta variable set (build + worker)
- [ ] Deploy
- [ ] `/admin -> Settings` theke logo, nam, colour, delivery charge, WhatsApp set
