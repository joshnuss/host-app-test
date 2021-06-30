Testing ground for monitoring solution.

By wrapping the app, it provides all monitoring backed by ClickHouse:

## Error reporting

All exceptions thrown are persisted.

## Log persistance

All `console.log()` `console.error()` etc.. are persisted.

## Metrics

App can emit statsd metrics, and they are persisted too.

## Request analytics

Each request is persisted, providing server-side analytics


## Uptime monitoring

It implements a heartbeat endpoint at `/ping`, so that uptime can be tracked.

## TODO

- Batching all monitoring data, and sending it when the request ends
- Call backend instead of clickhouse directly
- More language support: Ruby, Elixir, Python