-- Fictional sample records for Distributed & Cloud Databases.
BEGIN;
SET LOCAL standard_conforming_strings = on;
INSERT INTO portfolio."cloud_account" ("account_id", "account_name", "plan_tier", "created_at") VALUES (1001, 'Northwind Demo', 'standard', '2026-01-15T09:00:00Z');
INSERT INTO portfolio."cloud_account" ("account_id", "account_name", "plan_tier", "created_at") VALUES (1002, 'Contoso Demo', 'enterprise', '2026-02-01T12:30:00+00:00');
INSERT INTO portfolio."replication_job" ("job_id", "account_id", "source_region", "target_region", "status", "created_at", "lag_seconds", "consistency_mode") VALUES (2001, 1001, 'us-east-1', 'eu-west-1', 'running', '2026-03-01T10:00:00Z', 12, 'strong');
INSERT INTO portfolio."replication_job" ("job_id", "account_id", "source_region", "target_region", "status", "created_at", "lag_seconds", "consistency_mode") VALUES (2002, 1001, 'us-east-1', 'eu-west-1', 'completed', '2026-03-02T10:00:00Z', 0, 'eventual');
INSERT INTO portfolio."replication_job" ("job_id", "account_id", "source_region", "target_region", "status", "created_at", "lag_seconds", "consistency_mode") VALUES (2003, 1002, 'ap-southeast-1', 'us-west-2', 'queued', '2026-03-03T08:15:00+00:00', 35, 'strong');
INSERT INTO portfolio."replication_event" ("event_id", "job_id", "event_type", "occurred_at", "bytes_transferred", "idempotency_key", "payload_summary") VALUES (3001, 2001, 'chunk_copied', '2026-03-01T10:05:00Z', 4096, 'evt-demo-3001', 'Copied initial chunk');
INSERT INTO portfolio."replication_event" ("event_id", "job_id", "event_type", "occurred_at", "bytes_transferred", "idempotency_key", "payload_summary") VALUES (3002, 2002, 'job_completed', '2026-03-02T10:30:00Z', 8192, 'evt-demo-3002', NULL);
INSERT INTO portfolio."replication_event" ("event_id", "job_id", "event_type", "occurred_at", "bytes_transferred", "idempotency_key", "payload_summary") VALUES (3003, 2003, 'job_queued', '2026-03-03T08:16:00+00:00', 0, 'evt-demo-3003', 'Waiting for a worker');
COMMIT;
