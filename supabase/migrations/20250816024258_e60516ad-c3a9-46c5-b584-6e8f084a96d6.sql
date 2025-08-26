-- Create types and tables for promo activation and wallet tracking
create type if not exists public.promo_value_type as enum ('fixed', 'percent');

-- Promo codes master table
create table if not exists public.promo_codes (
  code text primary key,
  value_type public.promo_value_type not null default 'fixed',
  value integer not null default 0, -- amount of Ran to award for 'fixed'; for 'percent' reserved for future
  channel text,                     -- issuing channel
  campaign text,                    -- campaign identifier
  start_at timestamptz,             -- optional start time
  end_at timestamptz,               -- optional end time
  max_redemptions integer,          -- optional global cap
  per_user_limit integer not null default 1, -- per phone/user limit
  metadata jsonb,                   -- flexible rules storage
  created_at timestamptz not null default now()
);

-- Redemptions audit log
create table if not exists public.promo_redemptions (
  id uuid primary key default gen_random_uuid(),
  code text not null references public.promo_codes(code) on delete cascade,
  user_phone text not null,
  status text not null check (status in ('success','failed')),
  reason text,                      -- reason for failure if any
  value_awarded integer not null default 0,
  created_at timestamptz not null default now()
);

-- Wallet transactions for Ran
create table if not exists public.ran_wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  user_phone text not null,
  amount integer not null,          -- positive for credit, negative for debit
  kind text not null check (kind in ('promo','bill','redeem','adjust')),
  reference text,                   -- e.g., promo code or order id
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_promo_redemptions_phone on public.promo_redemptions(user_phone);
create index if not exists idx_promo_redemptions_code on public.promo_redemptions(code);
create index if not exists idx_wallet_phone on public.ran_wallet_transactions(user_phone);

-- Enable RLS (deny by default - edge function will use service role)
alter table public.promo_codes enable row level security;
alter table public.promo_redemptions enable row level security;
alter table public.ran_wallet_transactions enable row level security;

-- No public policies are added to keep data secure; all mutations occur via edge function using service role.
