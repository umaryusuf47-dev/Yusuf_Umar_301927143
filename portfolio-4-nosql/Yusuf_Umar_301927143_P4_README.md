# Portfolio 4 — NoSQL and Advanced Data Models

I used MongoDB collection replication_events for job_queued and chunk_copied events. These are fictional event examples based on replication_event, replication_job.

## Document model

| Field | Meaning |
| --- | --- |
| _id | Unique string event ID |
| eventType | One of the two selected case event labels |
| occurredAt | Native BSON Date; sample timestamps are in 2030 |
| source | Original entity, primary key and saved JSON snapshot |
| embedded | Linked record snapshots read with the event |
| references | Keys for linked sources kept outside the embedded snapshots |
| details | Event metadata whose fields vary |

Related replication_job details are stored as snapshots with the event. This makes an event readable in one document. It duplicates some information, and later SQL changes do not automatically update the snapshots. PostgreSQL continues to enforce the relational rules.

## Example document

```javascript
{
    "_id": "event_000001",
    "schemaVersion": 1,
    "simulation": true,
    "eventType": "job_queued",
    "occurredAt": ISODate("2030-01-01T10:00:00Z"),
    "source": {
        "entity": "replication_event",
        "key": {
            "event_id": 3001
        },
        "snapshot": {
            "event_id": 3001,
            "job_id": 2001,
            "event_type": "chunk_copied",
            "occurred_at": "2026-03-01T10:05:00Z",
            "bytes_transferred": 4096,
            "idempotency_key": "evt-demo-3001",
            "payload_summary": "Copied initial chunk"
        }
    },
    "embedded": {
        "replication_job": [
            {
                "key": {
                    "job_id": 2001
                },
                "snapshot": {
                    "job_id": 2001,
                    "account_id": 1001,
                    "source_region": "us-east-1",
                    "target_region": "eu-west-1",
                    "status": "running",
                    "created_at": "2026-03-01T10:00:00Z",
                    "lag_seconds": 12,
                    "consistency_mode": "strong"
                },
                "via": [
                    "replication_event.job_id → replication_job"
                ]
            }
        ]
    },
    "references": {},
    "details": {
        "channel": "web"
    }
}
```

## Queries and results

| Query | Returned documents |
| --- | --- |
| Find the first sample event type (up to five documents). | 3 |
| Find events for the first source record using nested key fields (up to five). | 2 |
| Find events in the sample time range using a MongoDB Date filter (up to five). | 5 |
| Count documents for each event type. | 2 |

## 1. Find the first sample event type (up to five documents).

```javascript
db.getCollection("replication_events").find({"eventType":"job_queued"}).sort({_id:1}).limit(5).toArray();
```

Selected fields from the returned documents:

```json
[
  {
    "_id": "event_000001",
    "eventType": "job_queued",
    "occurredAt": {
      "$date": "2030-01-01T10:00:00Z"
    },
    "source": {
      "event_id": 3001
    }
  },
  {
    "_id": "event_000003",
    "eventType": "job_queued",
    "occurredAt": {
      "$date": "2030-01-01T10:02:00Z"
    },
    "source": {
      "event_id": 3002
    }
  },
  {
    "_id": "event_000005",
    "eventType": "job_queued",
    "occurredAt": {
      "$date": "2030-01-01T10:04:00Z"
    },
    "source": {
      "event_id": 3003
    }
  }
]
```

## 2. Find events for the first source record using nested key fields (up to five).

```javascript
db.getCollection("replication_events").find({"source.key.event_id":3001}).sort({_id:1}).limit(5).toArray();
```

Selected fields from the returned documents:

```json
[
  {
    "_id": "event_000001",
    "eventType": "job_queued",
    "occurredAt": {
      "$date": "2030-01-01T10:00:00Z"
    },
    "source": {
      "event_id": 3001
    }
  },
  {
    "_id": "event_000002",
    "eventType": "chunk_copied",
    "occurredAt": {
      "$date": "2030-01-01T10:01:00Z"
    },
    "source": {
      "event_id": 3001
    }
  }
]
```

## 3. Find events in the sample time range using a MongoDB Date filter (up to five).

```javascript
db.getCollection("replication_events").find({"occurredAt":{"$gte":ISODate("2030-01-01T10:00:00Z"), "$lt":ISODate("2030-01-01T11:00:00Z")}}).sort({_id:1}).limit(5).toArray();
```

Selected fields from the returned documents:

```json
[
  {
    "_id": "event_000001",
    "eventType": "job_queued",
    "occurredAt": {
      "$date": "2030-01-01T10:00:00Z"
    },
    "source": {
      "event_id": 3001
    }
  },
  {
    "_id": "event_000002",
    "eventType": "chunk_copied",
    "occurredAt": {
      "$date": "2030-01-01T10:01:00Z"
    },
    "source": {
      "event_id": 3001
    }
  },
  {
    "_id": "event_000003",
    "eventType": "job_queued",
    "occurredAt": {
      "$date": "2030-01-01T10:02:00Z"
    },
    "source": {
      "event_id": 3002
    }
  },
  {
    "_id": "event_000004",
    "eventType": "chunk_copied",
    "occurredAt": {
      "$date": "2030-01-01T10:03:00Z"
    },
    "source": {
      "event_id": 3002
    }
  },
  {
    "_id": "event_000005",
    "eventType": "job_queued",
    "occurredAt": {
      "$date": "2030-01-01T10:04:00Z"
    },
    "source": {
      "event_id": 3003
    }
  }
]
```

## 4. Count documents for each event type.

```javascript
db.getCollection("replication_events").aggregate([{"$group":{"_id":"$eventType", "documentCount":{"$sum":1}}}, {"$sort":{"_id":1}}]).toArray();
```

| _id | documentCount |
| --- | --- |
| chunk_copied | 3 |
| job_queued | 3 |

## Validation and suitability

MongoDB inserted 6 documents. An invalid date type was rejected with code 121 and a repeated event ID with 11000. The collection still contained 6 valid documents. The compound eventType/occurredAt index supports those access fields; this exercise does not measure its speed.

The details field can vary across event types, while the common fields have a validator. Events can be added as separate documents rather than growing one large history record.

## Run the script

Connect mongosh to a fresh exercise database and run Yusuf_Umar_301927143_P4_MongoDB.js. It selects portfolio_nosql, creates the collection, inserts the sample documents and displays the query results. [Implementation evidence](screenshots/Yusuf_Umar_301927143_P4_DocumentsAndQueries.png).

## References

- [MongoDB — data modelling](https://www.mongodb.com/docs/manual/data-modeling/)

