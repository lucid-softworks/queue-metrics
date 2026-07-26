# `@lucid-softworks/queue-metrics`

Projects queue lifecycle events into an in-process metrics snapshot.

```ts
import { QueueMetrics } from "@lucid-softworks/queue-metrics";

const metrics = new QueueMetrics();
metrics.observe({
  jobId: "job-1",
  name: "send-email",
  timestamp: Date.now(),
  type: "job-completed",
});
console.log(metrics.snapshot.averageDuration);
```

Tracks enqueue, start, active, completion, failure, retry, dead-letter,
cancellation, heartbeat, and average observed execution duration counts.
`reset` clears all counters and in-flight timing state.
