# Replication

Replication means keeping a copy of the same data on multiple machines. Reasons: **fault tolerance**, **scalability** (read replicas), **latency** (geographically close replicas).

---

## Single-Leader Replication

One node is the **leader** (primary). All writes go to the leader. Replicas are **followers** (secondaries).

**Replication log:** The leader writes changes to a replication log. Followers consume the log and apply changes in the same order.

**Replication lag:** Followers are *eventually* consistent with the leader. If you read from a follower immediately after a write to the leader, you may not see the write — **read-your-own-writes** consistency is not guaranteed unless you route reads to the leader.

**Failover:** When the leader fails, a follower is promoted. Challenges:
- The new leader may not have all writes (data loss if async replication).
- Clients must be reconfigured to point to the new leader.
- Split-brain: two nodes think they are leader.

Used by: PostgreSQL (streaming replication), MySQL, MongoDB.

---

## Multi-Leader Replication

Multiple nodes accept writes. Each leader also acts as a follower of other leaders.

**Use case:** Multi-datacenter deployments where writes must succeed locally even if the cross-datacenter link is down.

**Conflict resolution:** Two leaders may accept conflicting writes to the same record. Must be resolved:
- **Last write wins (LWW):** Use timestamps. Risk of data loss.
- **Merge:** Application-level merge (e.g., CRDTs for collaborative editing).
- **Custom logic:** Application defines resolution rules.

Used by: CouchDB, multi-datacenter MySQL.

---

## Leaderless Replication (Dynamo-style)

Any replica accepts writes. The client sends writes to multiple replicas in parallel.

**Quorum reads/writes:** With *n* replicas, require *w* write acknowledgements and *r* read responses.
- As long as `w + r > n`, at least one read node has the latest write.
- Common: `n = 3`, `w = 2`, `r = 2`.

**Read repair:** When the client reads, it detects stale responses and writes the latest value back to lagging replicas.

**Anti-entropy:** Background process compares replicas and syncs differences.

Used by: Amazon Dynamo, Apache Cassandra, Riak, Voldemort.

---

## Key trade-offs summary

| Model | Write availability | Conflict handling | Complexity |
|---|---|---|---|
| Single-leader | Requires leader available | None (total order) | Low |
| Multi-leader | Writes succeed per-DC | Required | High |
| Leaderless | Very high | Required (quorum) | Medium |
