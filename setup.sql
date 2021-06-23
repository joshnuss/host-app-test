DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS logs;
DROP TABLE IF EXISTS errors;

CREATE TABLE requests (
  id VARCHAR NOT NULL,
  url VARCHAR NOT NULL,
  timestamp DATETIME NOT NULL,
  host VARCHAR,
  app VARCHAR,
  environment VARCHAR,
  ip VARCHAR,
  headers TEXT DEFAULT '{}' NOT NULL,
  status_code UInt16 NOT NULL,
  commit VARCHAR
) ENGINE = MergeTree() ORDER BY timestamp;

CREATE TABLE logs (
  request_id VARCHAR NOT NULL,
  type VARCHAR DEFAULT 'info' NOT NULL,
  timestamp DATETIME NOT NULL,
  host VARCHAR,
  app VARCHAR,
  environment VARCHAR,
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
  app VARCHAR,
  environment VARCHAR,
  ip VARCHAR,
  commit VARCHAR,
  stacktrace Array(VARCHAR) DEFAULT array() NOT NULL
) ENGINE = MergeTree() ORDER BY timestamp;

CREATE TABLE metrics (
  request_id VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  timestamp DATETIME NOT NULL,
  host VARCHAR,
  app VARCHAR,
  environment VARCHAR,
  value Int64 NOT NULL,
  tags Array(VARCHAR) DEFAULT array() NOT NULL
) ENGINE = MergeTree() ORDER BY timestamp;
