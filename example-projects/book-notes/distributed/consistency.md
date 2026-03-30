# Consistency Models

Consistency models define what a client can expect to observe when reading from a distributed system.

---

## Linearisability (Strong Consistency)

The system **behaves as if there is only one copy of the data**, and all operations happen atomically.

Once a write completes, all subsequent reads (from any node) see that write. There is a single global timeline of operations.

**Cost:** Requires coordination — every write must be agreed on by a quorum before it is considered complete. This adds latency and reduces availability (see CAP theorem).

**Used by:** etcd, ZooKeeper, Google Spanner (approximate).

---

## Causal Consistency

Operations that are **causally related** must be seen in order. Concurrent operations (with no causal dependency) may be seen in different orders by different nodes.

Example: If you post a message and then edit it, anyone who sees the edit must also see the original post — but two unrelated posts can appear in any order.

**Cost:** No global coordination needed. Available under network partitions. Weaker than linearisability.

**Implemented via:** Vector clocks or version vectors to track causal dependencies.

---

## Eventual Consistency

If no new writes occur, **all replicas will eventually converge** to the same value. No guarantee on when.

This is the weakest useful model. Intermediate states may be visible (stale reads, missing updates).

**Used by:** DNS, most caches, Cassandra (with low consistency levels), DynamoDB (eventually consistent reads).

---

## Session Guarantees (practical middle ground)

In practice, applications often want stronger guarantees *for a single client session* without requiring full linearisability:

| Guarantee | Meaning |
|---|---|
| Read-your-own-writes | After a write, the same client always sees it |
| Monotonic reads | A client never reads older data after reading newer data |
| Monotonic writes | Writes from one client are applied in order |

These can be implemented by routing a client's reads to the same replica they wrote to.

---

## CAP Theorem (brief)

A distributed system can guarantee at most two of:
- **C**onsistency (linearisability)
- **A**vailability (every request receives a response)
- **P**artition tolerance (the system continues despite network splits)

Since network partitions are unavoidable, the real choice is **CP** (sacrifice availability) vs **AP** (sacrifice consistency) during a partition.
