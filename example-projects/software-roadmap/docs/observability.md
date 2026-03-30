# Observability

The three pillars: **logs**, **metrics**, and **traces**.

## Structured logging

All services emit JSON logs to stdout. The log collector (Promtail) ships them to Loki.

### Required fields on every log line

```json
{
  "level": "info",
  "ts": "2025-03-15T12:00:00Z",
  "service": "api",
  "trace_id": "abc123",
  "msg": "request completed",
  "method": "GET",
  "path": "/api/v1/users",
  "status": 200,
  "duration_ms": 14
}
```

Use `slog` (Go) or `pino` (Node). Never use `fmt.Println` or `console.log` in production paths.

## Metrics

Prometheus scrapes `/metrics` on port 9090 of each service.

### Key metrics to instrument

| Metric | Type | Description |
|---|---|---|
| `http_requests_total` | Counter | Requests by method, path, status |
| `http_request_duration_seconds` | Histogram | Latency distribution |
| `db_pool_connections` | Gauge | Active PgBouncer connections |
| `queue_depth` | Gauge | Background job queue length |

Grafana dashboards live in `infra/grafana/dashboards/`. Import them via the provisioning config — do not create dashboards manually in the UI.

## Distributed tracing

OpenTelemetry SDK is initialised in the app entrypoint. Spans are exported to Tempo via OTLP (gRPC, port 4317).

Trace every inbound HTTP request and every outbound database query. Propagate the `traceparent` header to downstream services.

### Sampling

- Development: 100% sampling.
- Production: 10% head-based sampling, 100% for errors (tail sampling via Grafana Alloy).

## Alerts

Alerts are defined as Prometheus rules in `infra/alerts/`. Key SLOs:

| Alert | Condition | Severity |
|---|---|---|
| High error rate | `error_rate_5m > 1%` | critical |
| Slow responses | `p99_latency > 2s` | warning |
| Pod crash loop | `kube_pod_container_status_restarts_total > 3` | critical |
