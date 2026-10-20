-- Web and mobile use the Vercel API; they must not query these tables directly.
alter table public.companies enable row level security;
alter table public.employee_accounts enable row level security;
alter table public.auth_sessions enable row level security;
alter table public.applications enable row level security;

revoke all on table public.companies, public.employee_accounts,
  public.auth_sessions, public.applications from anon, authenticated;
grant all on table public.companies, public.employee_accounts,
  public.auth_sessions, public.applications to service_role;
grant usage, select on sequence public.employee_accounts_id_seq to service_role;
