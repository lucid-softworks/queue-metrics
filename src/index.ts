import { type QueueEvent } from "@lucid-softworks/queue-core";

export type QueueMetricsSnapshot = Readonly<{
  enqueued: number;
  started: number;
  active: number;
  completed: number;
  failed: number;
  retried: number;
  deadLettered: number;
  cancelled: number;
  heartbeats: number;
  averageDuration: number;
}>;

export class QueueMetrics {
  #enqueued = 0;
  #started = 0;
  #active = 0;
  #completed = 0;
  #failed = 0;
  #retried = 0;
  #deadLettered = 0;
  #cancelled = 0;
  #heartbeats = 0;
  #totalDuration = 0;
  #durationCount = 0;
  readonly #startedAt = new Map<string, number>();

  observe(event: QueueEvent): void {
    switch (event.type) {
      case "job-enqueued":
      case "job-scheduled": {
        this.#enqueued++;
        break;
      }
      case "job-started": {
        this.#started++;
        this.#active++;
        this.#startedAt.set(event.jobId, event.timestamp);
        break;
      }
      case "job-heartbeat": {
        this.#heartbeats++;
        break;
      }
      case "job-completed": {
        this.#completed++;
        this.#finish(event);
        break;
      }
      case "job-failed": {
        this.#failed++;
        this.#finish(event);
        break;
      }
      case "job-retrying": {
        this.#retried++;
        break;
      }
      case "job-dead-lettered": {
        this.#deadLettered++;
        break;
      }
      case "job-cancelled": {
        this.#cancelled++;
        break;
      }
    }
  }

  get snapshot(): QueueMetricsSnapshot {
    return {
      active: this.#active,
      averageDuration:
        this.#durationCount === 0
          ? 0
          : this.#totalDuration / this.#durationCount,
      cancelled: this.#cancelled,
      completed: this.#completed,
      deadLettered: this.#deadLettered,
      enqueued: this.#enqueued,
      failed: this.#failed,
      heartbeats: this.#heartbeats,
      retried: this.#retried,
      started: this.#started,
    };
  }

  reset(): void {
    this.#enqueued = 0;
    this.#started = 0;
    this.#active = 0;
    this.#completed = 0;
    this.#failed = 0;
    this.#retried = 0;
    this.#deadLettered = 0;
    this.#cancelled = 0;
    this.#heartbeats = 0;
    this.#totalDuration = 0;
    this.#durationCount = 0;
    this.#startedAt.clear();
  }

  #finish(event: QueueEvent): void {
    this.#active = Math.max(0, this.#active - 1);
    const startedAt = this.#startedAt.get(event.jobId);
    if (startedAt !== undefined) {
      this.#totalDuration += Math.max(0, event.timestamp - startedAt);
      this.#durationCount++;
      this.#startedAt.delete(event.jobId);
    }
  }
}
