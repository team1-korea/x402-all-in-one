-- x402 Quest DB Schema
-- Supabase SQL Editor에서 실행하세요

CREATE TABLE IF NOT EXISTS users (
  wallet_address  TEXT PRIMARY KEY,
  private_key     TEXT NOT NULL,
  registered_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  initial_airdrop_tx TEXT,
  nickname        TEXT,
  current_product_id TEXT,
  current_step    INTEGER NOT NULL DEFAULT 0,
  is_completed    BOOLEAN NOT NULL DEFAULT FALSE,
  purchased_steps INTEGER[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS quest_tokens (
  uuid            TEXT PRIMARY KEY,
  product_id      TEXT NOT NULL,
  step            INTEGER NOT NULL,
  wallet_address  TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quest_answers (
  id              BIGSERIAL PRIMARY KEY,
  wallet_address  TEXT NOT NULL,
  product_id      TEXT NOT NULL,
  step            INTEGER NOT NULL,
  quest_type      TEXT NOT NULL,
  answers         JSONB,
  is_correct      BOOLEAN NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedback (
  id              BIGSERIAL PRIMARY KEY,
  wallet_address  TEXT NOT NULL,
  good            TEXT NOT NULL,
  bad             TEXT NOT NULL,
  next            TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interests (
  id              BIGSERIAL PRIMARY KEY,
  wallet_address  TEXT NOT NULL,
  tags            TEXT[] NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
