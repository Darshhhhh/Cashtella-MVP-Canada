-- =========================
-- USERS
-- =========================
create table if not exists users (
  id text primary key,
  country text not null,
  created_at timestamptz default now()
);

-- =========================
-- WALLETS (custodial ledger)
-- =========================
create table if not exists wallets (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  currency text not null,
  balance numeric not null default 0,
  updated_at timestamptz default now()
);

-- =========================
-- TRANSFERS (state machine)
-- =========================
create table if not exists transfers (
  id uuid primary key,
  sender_id text not null,
  receiver_id text not null,
  amount_cad numeric not null,
  usdt_amount numeric,
  usd_amount numeric,
  status text not null,
  interac_request_id text,
  created_at timestamptz default now()
);
