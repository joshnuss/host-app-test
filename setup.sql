DROP TABLE IF EXISTS logs;

CREATE TABLE logs (
  request_id VARCHAR NOT NULL,
  type VARCHAR DEFAULT 'info' NOT NULL,
  timestamp DATETIME NOT NULL,
  host VARCHAR,
  ip VARCHAR,
  commit VARCHAR,
  message TEXT NOT NULL,
  data TEXT
) ENGINE = MergeTree() ORDER BY timestamp;
