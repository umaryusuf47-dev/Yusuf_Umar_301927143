# Distributed & Cloud Databases — database design

My case study records cloud_account, replication_job, replication_event.

## Users

- Database students
- Cloud operations analysts

## Main operations

- Create and track replication jobs
- Record replication events
- Review job status and transfer activity

## Entities

| Entity | Information stored |
| --- | --- |
| cloud_account | A synthetic customer account that owns replication jobs. |
| replication_job | A replication task owned by one account, with source and target region codes. |
| replication_event | An immutable synthetic record of activity for one replication job. |

## cloud_account

| Field | Type | Key | Required |
| --- | --- | --- | --- |
| account_id | BIGINT | PK | Yes |
| account_name | TEXT |  | Yes |
| plan_tier | TEXT |  | Yes |
| created_at | TIMESTAMPTZ |  | Yes |


## replication_job

| Field | Type | Key | Required |
| --- | --- | --- | --- |
| job_id | BIGINT | PK | Yes |
| account_id | BIGINT | FK | Yes |
| source_region | TEXT |  | Yes |
| target_region | TEXT |  | Yes |
| status | TEXT |  | Yes |
| created_at | TIMESTAMPTZ |  | Yes |
| lag_seconds | INTEGER |  | Yes |
| consistency_mode | TEXT |  | Yes |
- account_id → cloud_account.account_id

## replication_event

| Field | Type | Key | Required |
| --- | --- | --- | --- |
| event_id | BIGINT | PK | Yes |
| job_id | BIGINT | FK | Yes |
| event_type | TEXT |  | Yes |
| occurred_at | TIMESTAMPTZ |  | Yes |
| bytes_transferred | INTEGER |  | Yes |
| idempotency_key | TEXT | Unique | Yes |
| payload_summary | TEXT |  | No |
- job_id → replication_job.job_id
- Unique key: (idempotency_key).

## Relationships and business rules

- A replication job status must be queued, running, completed, failed, or cancelled.
- Replication lag in seconds must be zero or greater.
- For an account and source-target region pair, at most one job may have status queued or running; enforce uniqueness on those key fields only for that active-status predicate.
- Bytes transferred in an event must be zero or greater.
- Each replication_job account_id must reference cloud_account.account_id.
- Each replication_event job_id must reference replication_job.job_id.

## Assumptions

- All records and identifiers are synthetic; account_id, job_id, and event_id are UUIDs globally unique across all entities.
- Source and target regions are stored as region-code values on a job; a separate region entity is out of scope.
- Job statuses are queued, running, completed, failed, or cancelled. A job is active while its status is queued or running.
- For a normalization exercise, begin with replication_event rows that repeat job_status and account_name. Move job_status to replication_job and account_name to cloud_account, leaving the event linked to its job by job_id and the job linked to its account by account_id. This example follows one account ancestry path.
- Separate benchmark plan: generate 20000 synthetic replication_event rows, then compare a scan with a B-tree index plan for the same occurred_at range filter and aggregation. Record plan shape and rows examined, not result claims.

