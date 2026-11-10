-- Show related cloud_account, replication_job, replication_event records (up to 20).
SELECT t0."account_id" AS "cloud_account_account_id",
       t0."account_name" AS "cloud_account_account_name",
       t1."job_id" AS "replication_job_job_id",
       t1."source_region" AS "replication_job_source_region",
       t2."event_id" AS "replication_event_event_id",
       t2."event_type" AS "replication_event_event_type"
FROM portfolio."cloud_account" t0
JOIN portfolio."replication_job" t1 ON t1."account_id" = t0."account_id"
JOIN portfolio."replication_event" t2 ON t2."job_id" = t1."job_id"
ORDER BY t0."account_id", t1."job_id", t2."event_id"
LIMIT 20;

EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT t0."account_id" AS "cloud_account_account_id",
       t0."account_name" AS "cloud_account_account_name",
       t1."job_id" AS "replication_job_job_id",
       t1."source_region" AS "replication_job_source_region",
       t2."event_id" AS "replication_event_event_id",
       t2."event_type" AS "replication_event_event_type"
FROM portfolio."cloud_account" t0
JOIN portfolio."replication_job" t1 ON t1."account_id" = t0."account_id"
JOIN portfolio."replication_event" t2 ON t2."job_id" = t1."job_id"
ORDER BY t0."account_id", t1."job_id", t2."event_id"
LIMIT 20;

-- Find replication_event records where occurred_at matches "2026-03-01T10:05:00Z" (up to 20).
SELECT * FROM portfolio."replication_event"
WHERE "occurred_at" IS NOT DISTINCT FROM '2026-03-01T10:05:00Z'
ORDER BY "event_id"
LIMIT 20;

EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT * FROM portfolio."replication_event"
WHERE "occurred_at" IS NOT DISTINCT FROM '2026-03-01T10:05:00Z'
ORDER BY "event_id"
LIMIT 20;

-- Count replication_job records for each account_id (up to 20 groups).
SELECT "account_id", count(*) AS record_count
FROM portfolio."replication_job"
GROUP BY "account_id"
ORDER BY record_count DESC, "account_id" NULLS LAST
LIMIT 20;

EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT "account_id", count(*) AS record_count
FROM portfolio."replication_job"
GROUP BY "account_id"
ORDER BY record_count DESC, "account_id" NULLS LAST
LIMIT 20;
