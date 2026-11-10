# Distributed & Cloud Databases — ER diagram

```mermaid
erDiagram
    direction LR
    cloud_account {
        bigint account_id PK
        text account_name
        text plan_tier
        timestamptz created_at
    }
    replication_job {
        bigint job_id PK
        bigint account_id FK
        text source_region
        text target_region
        text status
        timestamptz created_at
        integer lag_seconds
        text consistency_mode
    }
    replication_event {
        bigint event_id PK
        bigint job_id FK
        text event_type
        timestamptz occurred_at
        integer bytes_transferred
        text idempotency_key UK
        text payload_summary "Optional"
    }
    cloud_account ||--o{ replication_job : "account_id"
    replication_job ||--o{ replication_event : "job_id"
```

PK identifies a record; FK links to another table; UK marks a single-field unique value. The relationship ends show exactly one, zero or one, or zero or many records. Composite unique keys and conditional rules are listed in the schema and design.

[Diagram image](../images/Yusuf_Umar_301927143_ERDiagram.png)
