# Transactions & ACID

A **transaction** groups multiple reads and writes into a single logical unit that either fully succeeds or fully fails.

---

## ACID Properties

### Atomicity
All writes in a transaction commit together, or none of them do. If the system crashes mid-transaction, any partial writes are rolled back.

*Implementation:* Write-ahead log (WAL). On recovery, incomplete transactions are rolled back by replaying the log.

### Consistency
A transaction brings the database from one **valid state** to another. "Valid" is defined by application-level invariants (e.g., account balance ≥ 0).

Note: Consistency in ACID is different from consistency in distributed systems — it is an application concern, not a database guarantee.

### Isolation
Concurrently executing transactions are isolated from each other — they appear to execute serially. The degree of isolation is configurable (see Isolation Levels).

### Durability
Once a transaction is committed, the data will not be lost even if the system crashes. Guaranteed by flushing the WAL to durable storage before acknowledging the commit.

---

## Isolation Levels

### Read Uncommitted
A transaction can read data that has been written by a concurrent transaction but not yet committed. **Dirty reads** are possible. Rarely used.

### Read Committed
A transaction only reads committed data. No dirty reads. However, if you read the same row twice in one transaction, the value may change between reads (**non-repeatable read**).

Default in: PostgreSQL, Oracle, SQL Server.

### Repeatable Read
A transaction sees a consistent snapshot of the data as it was at transaction start. No dirty reads, no non-repeatable reads. However, new rows inserted by concurrent transactions may appear (**phantom reads**).

Usually implemented via **MVCC (multi-version concurrency control)**.

Default in: MySQL InnoDB.

### Serialisable
Full isolation. Transactions behave as if they executed one at a time. No dirty reads, no non-repeatable reads, no phantom reads.

*Implementations:*
- **Two-phase locking (2PL):** Acquire all locks before releasing any. Pessimistic. Can deadlock.
- **Serialisable Snapshot Isolation (SSI):** Detect conflicts at commit time. Optimistic. Lower overhead than 2PL.

---

## Weak Isolation in Practice

Most applications run at **Read Committed** because higher isolation levels hurt performance. This makes them vulnerable to **read-write skew** — subtle concurrency bugs where two transactions each read stale data and make decisions based on it.

Example of read-write skew: two doctors both see "at least 2 doctors on call", so both call in sick — leaving zero doctors on call.

Prevention: use `SELECT FOR UPDATE` to lock the rows being read, or use `SERIALIZABLE` isolation.
