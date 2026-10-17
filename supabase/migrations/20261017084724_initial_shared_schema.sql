create table public.companies (
  slug text primary key,
  name text not null,
  active boolean not null default true
);

create table public.employee_accounts (
  id bigint generated always as identity primary key,
  company_slug text not null references public.companies(slug),
  username text not null,
  display_name text not null,
  employee_type text not null
    check (employee_type in ('employee', 'merchandiser', 'guard', 'subcontractor')),
  password_salt bytea not null,
  password_hash bytea not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index employee_accounts_username_lower_idx
  on public.employee_accounts (lower(username));

create table public.auth_sessions (
  token_hash char(64) primary key,
  account_id bigint not null references public.employee_accounts(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index auth_sessions_account_idx on public.auth_sessions(account_id);
create index auth_sessions_expiry_idx on public.auth_sessions(expires_at);

create table public.applications (
  id text primary key,
  account_id bigint not null references public.employee_accounts(id) on delete cascade,
  type text not null,
  summary text not null,
  submitted_at date not null default current_date,
  status text not null default 'Pending'
    check (status in ('Pending', 'Approved', 'Disapproved', 'Cancelled')),
  cancellation_reason text,
  details jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index applications_account_date_idx
  on public.applications (account_id, submitted_at desc, created_at desc);
create index applications_account_type_status_idx
  on public.applications (account_id, type, status);

