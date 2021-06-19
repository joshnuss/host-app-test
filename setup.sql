DROP TABLE IF EXISTS logs;

CREATE TABLE logs (
  type VARCHAR NOT NULL,
  timestamp DATETIME NOT NULL,
  message TEXT NOT NULL,
  json TEXT
) ENGINE = MergeTree() ORDER BY timestamp;
