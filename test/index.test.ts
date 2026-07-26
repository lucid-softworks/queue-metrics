import {
  type QueueEvent,
  type QueueEventType,
} from "@lucid-softworks/queue-core";
import { describe, expect, it } from "vitest";

import { QueueMetrics } from "../src/index.js";

const event = (
  type: QueueEventType,
  timestamp = 0,
  jobId = "job",
): QueueEvent => ({ jobId, name: "work", timestamp, type });

describe("QueueMetrics", () => {
  it("projects every lifecycle event and duration", () => {
    const metrics = new QueueMetrics();
    metrics.observe(event("job-enqueued"));
    metrics.observe(event("job-scheduled"));
    metrics.observe(event("job-started", 10));
    metrics.observe(event("job-heartbeat", 11));
    metrics.observe(event("job-completed", 20));
    metrics.observe(event("job-started", 30, "failed"));
    metrics.observe(event("job-failed", 25, "failed"));
    metrics.observe(event("job-retrying"));
    metrics.observe(event("job-dead-lettered"));
    metrics.observe(event("job-cancelled"));
    metrics.observe(event("job-completed", 50, "unknown"));
    expect(metrics.snapshot).toEqual({
      active: 0,
      averageDuration: 5,
      cancelled: 1,
      completed: 2,
      deadLettered: 1,
      enqueued: 2,
      failed: 1,
      heartbeats: 1,
      retried: 1,
      started: 2,
    });
    metrics.reset();
    expect(metrics.snapshot.averageDuration).toBe(0);
    expect(metrics.snapshot.enqueued).toBe(0);
  });
});
