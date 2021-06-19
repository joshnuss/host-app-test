DROP TABLE IF EXISTS logs;

CREATE TABLE logs (
  type VARCHAR DEFAULT 'info' NOT NULL,
  timestamp DATETIME NOT NULL,
  host VARCHAR DEFAULT 'unknown' NOT NULL,
  message TEXT NOT NULL,
  data TEXT
) ENGINE = MergeTree() ORDER BY timestamp;
