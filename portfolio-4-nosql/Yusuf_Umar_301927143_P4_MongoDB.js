// Run once in mongosh against a fresh exercise database.
// These records are fictional events for the case study.
(async function () {
  db = db.getSiblingDB('portfolio_nosql');
  if ((await db.getCollectionNames()).includes("replication_events")) {
    throw new Error('The exercise collection already exists. Use a fresh database.');
  }

  // The validator checks the stable event fields while details can vary.
  await db.createCollection("replication_events", {
    validator: {
    "$jsonSchema": {
        "bsonType": "object",
        "required": [
            "_id",
            "schemaVersion",
            "simulation",
            "eventType",
            "occurredAt",
            "source",
            "embedded",
            "references",
            "details"
        ],
        "properties": {
            "_id": {
                "bsonType": "string",
                "minLength": 1
            },
            "schemaVersion": {
                "enum": [
                    1
                ]
            },
            "simulation": {
                "enum": [
                    true
                ]
            },
            "eventType": {
                "bsonType": "string",
                "enum": [
                    "job_queued",
                    "chunk_copied"
                ]
            },
            "occurredAt": {
                "bsonType": "date"
            },
            "source": {
                "bsonType": "object",
                "required": [
                    "entity",
                    "key",
                    "snapshot"
                ],
                "properties": {
                    "entity": {
                        "enum": [
                            "replication_event"
                        ]
                    },
                    "key": {
                        "bsonType": "object",
                        "required": [
                            "event_id"
                        ]
                    },
                    "snapshot": {
                        "bsonType": "object"
                    }
                }
            },
            "embedded": {
                "bsonType": "object"
            },
            "references": {
                "bsonType": "object"
            },
            "details": {
                "bsonType": "object"
            }
        }
    }
},
    validationLevel: 'strict', validationAction: 'error'
  });

  // Insert the four example events and show their IDs.
  printjson(await db.getCollection("replication_events").insertMany([
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
    },
    {
        "_id": "event_000002",
        "schemaVersion": 1,
        "simulation": true,
        "eventType": "chunk_copied",
        "occurredAt": ISODate("2030-01-01T10:01:00Z"),
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
            "channel": "mobile",
            "note": "Illustrative event-specific metadata",
            "examples": {
                "provider_metadata": "illustrative provider_metadata",
                "error_context": "illustrative error_context",
                "checkpoint": "illustrative checkpoint"
            }
        }
    },
    {
        "_id": "event_000003",
        "schemaVersion": 1,
        "simulation": true,
        "eventType": "job_queued",
        "occurredAt": ISODate("2030-01-01T10:02:00Z"),
        "source": {
            "entity": "replication_event",
            "key": {
                "event_id": 3002
            },
            "snapshot": {
                "event_id": 3002,
                "job_id": 2002,
                "event_type": "job_completed",
                "occurred_at": "2026-03-02T10:30:00Z",
                "bytes_transferred": 8192,
                "idempotency_key": "evt-demo-3002",
                "payload_summary": null
            }
        },
        "embedded": {
            "replication_job": [
                {
                    "key": {
                        "job_id": 2002
                    },
                    "snapshot": {
                        "job_id": 2002,
                        "account_id": 1001,
                        "source_region": "us-east-1",
                        "target_region": "eu-west-1",
                        "status": "completed",
                        "created_at": "2026-03-02T10:00:00Z",
                        "lag_seconds": 0,
                        "consistency_mode": "eventual"
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
    },
    {
        "_id": "event_000004",
        "schemaVersion": 1,
        "simulation": true,
        "eventType": "chunk_copied",
        "occurredAt": ISODate("2030-01-01T10:03:00Z"),
        "source": {
            "entity": "replication_event",
            "key": {
                "event_id": 3002
            },
            "snapshot": {
                "event_id": 3002,
                "job_id": 2002,
                "event_type": "job_completed",
                "occurred_at": "2026-03-02T10:30:00Z",
                "bytes_transferred": 8192,
                "idempotency_key": "evt-demo-3002",
                "payload_summary": null
            }
        },
        "embedded": {
            "replication_job": [
                {
                    "key": {
                        "job_id": 2002
                    },
                    "snapshot": {
                        "job_id": 2002,
                        "account_id": 1001,
                        "source_region": "us-east-1",
                        "target_region": "eu-west-1",
                        "status": "completed",
                        "created_at": "2026-03-02T10:00:00Z",
                        "lag_seconds": 0,
                        "consistency_mode": "eventual"
                    },
                    "via": [
                        "replication_event.job_id → replication_job"
                    ]
                }
            ]
        },
        "references": {},
        "details": {
            "channel": "mobile",
            "note": "Illustrative event-specific metadata",
            "examples": {
                "provider_metadata": "illustrative provider_metadata",
                "error_context": "illustrative error_context",
                "checkpoint": "illustrative checkpoint"
            }
        }
    },
    {
        "_id": "event_000005",
        "schemaVersion": 1,
        "simulation": true,
        "eventType": "job_queued",
        "occurredAt": ISODate("2030-01-01T10:04:00Z"),
        "source": {
            "entity": "replication_event",
            "key": {
                "event_id": 3003
            },
            "snapshot": {
                "event_id": 3003,
                "job_id": 2003,
                "event_type": "job_queued",
                "occurred_at": "2026-03-03T08:16:00+00:00",
                "bytes_transferred": 0,
                "idempotency_key": "evt-demo-3003",
                "payload_summary": "Waiting for a worker"
            }
        },
        "embedded": {
            "replication_job": [
                {
                    "key": {
                        "job_id": 2003
                    },
                    "snapshot": {
                        "job_id": 2003,
                        "account_id": 1002,
                        "source_region": "ap-southeast-1",
                        "target_region": "us-west-2",
                        "status": "queued",
                        "created_at": "2026-03-03T08:15:00+00:00",
                        "lag_seconds": 35,
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
    },
    {
        "_id": "event_000006",
        "schemaVersion": 1,
        "simulation": true,
        "eventType": "chunk_copied",
        "occurredAt": ISODate("2030-01-01T10:05:00Z"),
        "source": {
            "entity": "replication_event",
            "key": {
                "event_id": 3003
            },
            "snapshot": {
                "event_id": 3003,
                "job_id": 2003,
                "event_type": "job_queued",
                "occurred_at": "2026-03-03T08:16:00+00:00",
                "bytes_transferred": 0,
                "idempotency_key": "evt-demo-3003",
                "payload_summary": "Waiting for a worker"
            }
        },
        "embedded": {
            "replication_job": [
                {
                    "key": {
                        "job_id": 2003
                    },
                    "snapshot": {
                        "job_id": 2003,
                        "account_id": 1002,
                        "source_region": "ap-southeast-1",
                        "target_region": "us-west-2",
                        "status": "queued",
                        "created_at": "2026-03-03T08:15:00+00:00",
                        "lag_seconds": 35,
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
            "channel": "mobile",
            "note": "Illustrative event-specific metadata",
            "examples": {
                "provider_metadata": "illustrative provider_metadata",
                "error_context": "illustrative error_context",
                "checkpoint": "illustrative checkpoint"
            }
        }
    }
]));
  await db.getCollection("replication_events").createIndex({eventType: 1, occurredAt: -1}, {name: 'event_type_time'});

  // 1. Find the first sample event type (up to five documents).
  printjson(await db.getCollection("replication_events").find({"eventType":"job_queued"}).sort({_id:1}).limit(5).toArray());

  // 2. Find events for the first source record using nested key fields (up to five).
  printjson(await db.getCollection("replication_events").find({"source.key.event_id":3001}).sort({_id:1}).limit(5).toArray());

  // 3. Find events in the sample time range using a MongoDB Date filter (up to five).
  printjson(await db.getCollection("replication_events").find({"occurredAt":{"$gte":ISODate("2030-01-01T10:00:00Z"), "$lt":ISODate("2030-01-01T11:00:00Z")}}).sort({_id:1}).limit(5).toArray());

  // 4. Count documents for each event type.
  printjson(await db.getCollection("replication_events").aggregate([{"$group":{"_id":"$eventType", "documentCount":{"$sum":1}}}, {"$sort":{"_id":1}}]).toArray());

  // A date stored as text should be rejected by the validator.
  try {
    await db.getCollection("replication_events").insertOne({...{
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
}, _id: 'invalid_date_example', occurredAt: 'not-a-date'});
  } catch (error) { print('Invalid date error: ' + error.code); }

  // Reusing an event ID should be rejected by the unique _id index.
  try { await db.getCollection("replication_events").insertOne({
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
}); }
  catch (error) { print('Duplicate ID error: ' + error.code); }

  print('Document count: ' + await db.getCollection("replication_events").countDocuments());
})().catch(error => { print(error.stack || String(error)); quit(1); });
