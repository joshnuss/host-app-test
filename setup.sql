DROP TABLE IF EXISTS logs;
DROP TABLE IF EXISTS errors;

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

CREATE TABLE errors (
  request_id VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  message VARCHAR NOT NULL,
  timestamp DATETIME NOT NULL,
  host VARCHAR,
  ip VARCHAR,
  commit VARCHAR,
  stacktrace Array(VARCHAR) DEFAULT array() NOT NULL
) ENGINE = MergeTree() ORDER BY timestamp;
