-- Distributed & Cloud Databases: tables, keys and business constraints.
-- Run once in a fresh PostgreSQL database.
BEGIN;
SET LOCAL standard_conforming_strings = on;
CREATE SCHEMA portfolio;
CREATE TABLE portfolio."cloud_account" (
  "account_id" bigint NOT NULL,
  "account_name" text NOT NULL,
  "plan_tier" text NOT NULL,
  "created_at" timestamptz NOT NULL,
  CONSTRAINT "pk_cloud_account" PRIMARY KEY ("account_id")
);
CREATE TABLE portfolio."replication_job" (
  "job_id" bigint NOT NULL,
  "account_id" bigint NOT NULL,
  "source_region" text NOT NULL,
  "target_region" text NOT NULL,
  "status" text NOT NULL,
  "created_at" timestamptz NOT NULL,
  "lag_seconds" bigint NOT NULL,
  "consistency_mode" text NOT NULL,
  CONSTRAINT "pk_replication_job" PRIMARY KEY ("job_id")
);
CREATE TABLE portfolio."replication_event" (
  "event_id" bigint NOT NULL,
  "job_id" bigint NOT NULL,
  "event_type" text NOT NULL,
  "occurred_at" timestamptz NOT NULL,
  "bytes_transferred" bigint NOT NULL,
  "idempotency_key" text NOT NULL,
  "payload_summary" text,
  CONSTRAINT "pk_replication_event" PRIMARY KEY ("event_id"),
  CONSTRAINT "uq_replication_event_0" UNIQUE ("idempotency_key")
);
ALTER TABLE portfolio."replication_job" ADD CONSTRAINT "fk_replication_job_0" FOREIGN KEY ("account_id") REFERENCES portfolio."cloud_account" ("account_id");
ALTER TABLE portfolio."replication_event" ADD CONSTRAINT "fk_replication_event_0" FOREIGN KEY ("job_id") REFERENCES portfolio."replication_job" ("job_id");
ALTER TABLE portfolio."replication_job" ADD CONSTRAINT "job_status_valid" CHECK (("status" = 'queued') OR ("status" = 'running') OR ("status" = 'completed') OR ("status" = 'failed') OR ("status" = 'cancelled'));
ALTER TABLE portfolio."replication_job" ADD CONSTRAINT "job_lag_nonnegative" CHECK ("lag_seconds" >= 0);
CREATE UNIQUE INDEX "one_active_job_per_pair" ON portfolio."replication_job" ("account_id", "source_region", "target_region") WHERE (("status" = 'queued') OR ("status" = 'running'));
ALTER TABLE portfolio."replication_event" ADD CONSTRAINT "event_bytes_nonnegative" CHECK ("bytes_transferred" >= 0);
COMMIT;
