DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'roadmap_status'
  ) THEN
    CREATE TYPE "roadmap_status" AS ENUM ('planned', 'in_progress', 'shipped');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'changelog_tag'
  ) THEN
    CREATE TYPE "changelog_tag" AS ENUM (
      'feature',
      'improvement',
      'fix',
      'announcement',
      'other'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "roadmap_entry" (
  "id" text PRIMARY KEY,
  "title" text NOT NULL,
  "status" "roadmap_status" NOT NULL DEFAULT 'planned',
  "category" text,
  "content" text NOT NULL,
  "published" boolean NOT NULL DEFAULT FALSE,
  "sort_order" integer NOT NULL DEFAULT 0,
  "author_id" text REFERENCES "user"("id") ON DELETE SET NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "changelog_entry" (
  "id" text PRIMARY KEY,
  "title" text NOT NULL,
  "tag" "changelog_tag" NOT NULL DEFAULT 'other',
  "category" text,
  "content" text NOT NULL,
  "published" boolean NOT NULL DEFAULT TRUE,
  "published_at" timestamp DEFAULT now(),
  "author_id" text REFERENCES "user"("id") ON DELETE SET NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "roadmap_entry_published_sort_idx"
  ON "roadmap_entry" ("published", "sort_order", "updated_at");

CREATE INDEX IF NOT EXISTS "changelog_entry_published_at_idx"
  ON "changelog_entry" ("published", "published_at", "updated_at");

