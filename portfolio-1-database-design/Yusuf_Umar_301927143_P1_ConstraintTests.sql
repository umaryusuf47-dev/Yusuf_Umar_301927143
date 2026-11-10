-- Run these deliberately invalid statements one at a time, outside a transaction.
-- Each should fail at the named constraint; the sample rows should remain unchanged.

-- 1. reject account pk. Expected: pk_cloud_account, SQLSTATE 23505.
INSERT INTO portfolio."cloud_account" ("account_id", "account_name", "plan_tier", "created_at")
VALUES (1001, 'Duplicate Account', 'standard', '2026-04-01T00:00:00Z');

-- 2. reject account name null. Expected: account_name, SQLSTATE 23502.
INSERT INTO portfolio."cloud_account" ("account_id", "account_name", "plan_tier", "created_at")
VALUES (90001, NULL, 'standard', '2026-04-01T00:00:00Z');

-- 3. reject job pk. Expected: pk_replication_job, SQLSTATE 23505.
INSERT INTO portfolio."replication_job" ("job_id", "account_id", "source_region", "target_region", "status", "created_at", "lag_seconds", "consistency_mode")
VALUES (2001, 1002, 'ca-central-1', 'sa-east-1', 'completed', '2026-04-01T00:00:00Z', 0, 'strong');

-- 4. reject job fk. Expected: fk_replication_job_0, SQLSTATE 23503.
INSERT INTO portfolio."replication_job" ("job_id", "account_id", "source_region", "target_region", "status", "created_at", "lag_seconds", "consistency_mode")
VALUES (90002, 999999, 'ca-central-1', 'sa-east-1', 'completed', '2026-04-01T00:00:00Z', 0, 'strong');

-- 5. reject job status check. Expected: job_status_valid, SQLSTATE 23514.
INSERT INTO portfolio."replication_job" ("job_id", "account_id", "source_region", "target_region", "status", "created_at", "lag_seconds", "consistency_mode")
VALUES (90003, 1001, 'ca-central-1', 'sa-east-1', 'paused', '2026-04-01T00:00:00Z', 0, 'strong');

-- 6. reject job lag check. Expected: job_lag_nonnegative, SQLSTATE 23514.
INSERT INTO portfolio."replication_job" ("job_id", "account_id", "source_region", "target_region", "status", "created_at", "lag_seconds", "consistency_mode")
VALUES (90004, 1001, 'ca-central-1', 'sa-east-1', 'completed', '2026-04-01T00:00:00Z', -1, 'strong');

-- 7. reject active pair. Expected: one_active_job_per_pair, SQLSTATE 23505.
INSERT INTO portfolio."replication_job" ("job_id", "account_id", "source_region", "target_region", "status", "created_at", "lag_seconds", "consistency_mode")
VALUES (90005, 1001, 'us-east-1', 'eu-west-1', 'queued', '2026-04-01T00:00:00Z', 1, 'strong');

-- 8. reject event pk. Expected: pk_replication_event, SQLSTATE 23505.
INSERT INTO portfolio."replication_event" ("event_id", "job_id", "event_type", "occurred_at", "bytes_transferred", "idempotency_key", "payload_summary")
VALUES (3001, 2002, 'checkpoint_written', '2026-04-01T00:00:00Z', 10, 'evt-test-pk', 'Checkpoint');

-- 9. reject event unique. Expected: uq_replication_event_0, SQLSTATE 23505.
INSERT INTO portfolio."replication_event" ("event_id", "job_id", "event_type", "occurred_at", "bytes_transferred", "idempotency_key", "payload_summary")
VALUES (90006, 2002, 'checkpoint_written', '2026-04-01T00:00:00Z', 10, 'evt-demo-3001', 'Checkpoint');

-- 10. reject event fk. Expected: fk_replication_event_0, SQLSTATE 23503.
INSERT INTO portfolio."replication_event" ("event_id", "job_id", "event_type", "occurred_at", "bytes_transferred", "idempotency_key", "payload_summary")
VALUES (90007, 999998, 'checkpoint_written', '2026-04-01T00:00:00Z', 10, 'evt-test-fk', 'Checkpoint');

-- 11. reject event bytes check. Expected: event_bytes_nonnegative, SQLSTATE 23514.
INSERT INTO portfolio."replication_event" ("event_id", "job_id", "event_type", "occurred_at", "bytes_transferred", "idempotency_key", "payload_summary")
VALUES (90008, 2002, 'chunk_copied', '2026-04-01T00:00:00Z', -1, 'evt-test-bytes', 'Invalid transfer count');
