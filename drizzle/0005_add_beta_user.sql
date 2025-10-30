-- Add is_beta_user column to user table
ALTER TABLE "user" ADD COLUMN "is_beta_user" boolean DEFAULT false NOT NULL;

