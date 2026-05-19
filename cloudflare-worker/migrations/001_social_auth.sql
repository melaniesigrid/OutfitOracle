-- Migration 001: add Google and Facebook sign-in support
-- Run against existing Neon databases that only have apple_sub

ALTER TABLE users ALTER COLUMN apple_sub DROP NOT NULL;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS google_sub   TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS facebook_sub TEXT UNIQUE;

-- Enforce at least one identifier (safe to add after making apple_sub nullable)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_has_identifier;
ALTER TABLE users ADD CONSTRAINT users_has_identifier CHECK (
  apple_sub IS NOT NULL OR google_sub IS NOT NULL OR facebook_sub IS NOT NULL
);
