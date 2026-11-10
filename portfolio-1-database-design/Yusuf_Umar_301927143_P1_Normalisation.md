# Distributed & Cloud Databases — normalisation

The example uses the saved sample records. The full set of fields is in the design and schema.

## Starting grouped records

| job_id | replication_event records (list) |
| --- | --- |
| 2001 | [3001] |
| 2002 | [3002] |
| 2003 | [3003] |


The record IDs are grouped in a list. In 1NF, each record has its own row and each cell holds one value.

## 1NF: one value per cell

| replication_event.event_id | replication_event.job_id | replication_event.event_type | replication_job.job_id | replication_job.account_id | replication_job.source_region | cloud_account.account_id | cloud_account.account_name |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 3001 | 2001 | chunk_copied | 2001 | 1001 | us-east-1 | 1001 | Northwind Demo |
| 3002 | 2002 | job_completed | 2002 | 1001 | us-east-1 | 1001 | Northwind Demo |
| 3003 | 2003 | job_queued | 2003 | 1002 | ap-southeast-1 | 1002 | Contoso Demo |

Key: event_id.

## 2NF: depend on the whole key

The declared candidate keys do not introduce a partial dependency here, so the 1NF rows stay unchanged at this step.

## replication_event_example

| replication_event.event_id | replication_event.job_id | replication_event.event_type | replication_job.job_id | replication_job.account_id | replication_job.source_region | cloud_account.account_id | cloud_account.account_name |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 3001 | 2001 | chunk_copied | 2001 | 1001 | us-east-1 | 1001 | Northwind Demo |
| 3002 | 2002 | job_completed | 2002 | 1001 | us-east-1 | 1001 | Northwind Demo |
| 3003 | 2003 | job_queued | 2003 | 1002 | ap-southeast-1 | 1002 | Contoso Demo |

## 3NF: store each entity’s details once

The entity keys determine their own descriptions. Related records keep foreign keys rather than repeating those descriptions.

## cloud_account

| account_id | account_name | plan_tier | created_at |
| --- | --- | --- | --- |
| 1001 | Northwind Demo | standard | 2026-01-15T09:00:00+00:00 |
| 1002 | Contoso Demo | enterprise | 2026-02-01T12:30:00+00:00 |

## replication_job

| job_id | account_id | source_region | target_region | status | created_at | lag_seconds | consistency_mode |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2001 | 1001 | us-east-1 | eu-west-1 | running | 2026-03-01T10:00:00+00:00 | 12 | strong |
| 2002 | 1001 | us-east-1 | eu-west-1 | completed | 2026-03-02T10:00:00+00:00 | 0 | eventual |
| 2003 | 1002 | ap-southeast-1 | us-west-2 | queued | 2026-03-03T08:15:00+00:00 | 35 | strong |

## replication_event

| event_id | job_id | event_type | occurred_at | bytes_transferred | idempotency_key | payload_summary |
| --- | --- | --- | --- | --- | --- | --- |
| 3001 | 2001 | chunk_copied | 2026-03-01T10:05:00+00:00 | 4096 | evt-demo-3001 | Copied initial chunk |
| 3002 | 2002 | job_completed | 2026-03-02T10:30:00+00:00 | 8192 | evt-demo-3002 | NULL |
| 3003 | 2003 | job_queued | 2026-03-03T08:16:00+00:00 | 0 | evt-demo-3003 | Waiting for a worker |

## Dependencies

- cloud_account: (account_id) → account_name, plan_tier, created_at
- replication_job: (job_id) → account_id, source_region, target_region, status, created_at, lag_seconds, consistency_mode
- replication_event: (event_id) → job_id, event_type, occurred_at, bytes_transferred, idempotency_key, payload_summary

Joining the decomposed sample tables reproduces the original 3 example rows. The design assumes the declared keys describe the relevant business dependencies.
