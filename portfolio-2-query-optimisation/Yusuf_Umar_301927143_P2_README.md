# Distributed & Cloud Databases — SQL queries

## 1. Show related cloud_account, replication_job, replication_event records (up to 20).

```sql
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
```

| cloud_account_account_id | cloud_account_account_name | replication_job_job_id | replication_job_source_region | replication_event_event_id | replication_event_event_type |
| --- | --- | --- | --- | --- | --- |
| 1001 | Northwind Demo | 2001 | us-east-1 | 3001 | chunk_copied |
| 1001 | Northwind Demo | 2002 | us-east-1 | 3002 | job_completed |
| 1002 | Contoso Demo | 2003 | ap-southeast-1 | 3003 | job_queued |

## 2. Find replication_event records where occurred_at matches "2026-03-01T10:05:00Z" (up to 20).

```sql
SELECT * FROM portfolio."replication_event"
WHERE "occurred_at" IS NOT DISTINCT FROM '2026-03-01T10:05:00Z'
ORDER BY "event_id"
LIMIT 20;
```

| event_id | job_id | event_type | occurred_at | bytes_transferred | idempotency_key | payload_summary |
| --- | --- | --- | --- | --- | --- | --- |
| 3001 | 2001 | chunk_copied | 2026-03-01T10:05:00+00:00 | 4096 | evt-demo-3001 | Copied initial chunk |

## 3. Count replication_job records for each account_id (up to 20 groups).

```sql
SELECT "account_id", count(*) AS record_count
FROM portfolio."replication_job"
GROUP BY "account_id"
ORDER BY record_count DESC, "account_id" NULLS LAST
LIMIT 20;
```

| account_id | record_count |
| --- | --- |
| 1001 | 2 |
| 1002 | 1 |


## Index comparison

| Phase | Median (ms) | Three runs (ms) | Plan nodes | Buffer hits |
| --- | --- | --- | --- | --- |
| Before index | 1.027 | 1.034, 1.027, 1.016 | Sort → Seq Scan | 112 |
| After index | 0.187 | 0.187, 0.184, 0.198 | Sort → Bitmap Heap Scan → Bitmap Index Scan | 25 |

The median execution time changed from 1.027 ms to 0.187 ms. The measured plan used p2_filter_idx. The results matched in both phases. An index adds storage and write-maintenance costs; timings depend on the selected lookup and environment.

## Execution plans

### Before index, run 1

```text
Sort (actual time=1.008..1.009 rows=20 loops=1)
  Seq Scan on replication_event (actual time=0.017..0.94 rows=20 loops=1)
Planning Time: 0.343 ms
Execution Time: 1.034 ms
```

### Before index, run 2

```text
Sort (actual time=0.997..0.999 rows=20 loops=1)
  Seq Scan on replication_event (actual time=0.015..0.962 rows=20 loops=1)
Planning Time: 0.337 ms
Execution Time: 1.027 ms
```

### Before index, run 3

```text
Sort (actual time=0.989..0.991 rows=20 loops=1)
  Seq Scan on replication_event (actual time=0.014..0.955 rows=20 loops=1)
Planning Time: 0.324 ms
Execution Time: 1.016 ms
```

### After index, run 1

```text
Sort (actual time=0.133..0.135 rows=20 loops=1)
  Bitmap Heap Scan on replication_event (actual time=0.031..0.097 rows=20 loops=1)
    Bitmap Index Scan using p2_filter_idx (actual time=0.014..0.014 rows=20 loops=1)
Planning Time: 0.578 ms
Execution Time: 0.187 ms
```

### After index, run 2

```text
Sort (actual time=0.133..0.134 rows=20 loops=1)
  Bitmap Heap Scan on replication_event (actual time=0.027..0.097 rows=20 loops=1)
    Bitmap Index Scan using p2_filter_idx (actual time=0.014..0.014 rows=20 loops=1)
Planning Time: 0.602 ms
Execution Time: 0.184 ms
```

### After index, run 3

```text
Sort (actual time=0.138..0.14 rows=20 loops=1)
  Bitmap Heap Scan on replication_event (actual time=0.031..0.095 rows=20 loops=1)
    Bitmap Index Scan using p2_filter_idx (actual time=0.017..0.017 rows=20 loops=1)
Planning Time: 0.613 ms
Execution Time: 0.198 ms
```

## Reproduce

Use a fresh database with the Portfolio 1 schema and sample data. Run Yusuf_Umar_301927143_P2_Queries.sql, then Yusuf_Umar_301927143_P2_Optimisation.sql. The optimisation script creates a separate performance table and runs EXPLAIN (ANALYZE, BUFFERS).

[Query screenshot](screenshots/Yusuf_Umar_301927143_P2_QueryResults.png) · [Index comparison](screenshots/Yusuf_Umar_301927143_P2_IndexComparison.png)

## References

- [PostgreSQL — EXPLAIN](https://www.postgresql.org/docs/17/using-explain.html)

