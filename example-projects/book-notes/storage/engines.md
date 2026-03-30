# Storage Engines

## B-Trees

A B-tree breaks the database down into fixed-size **pages** (typically 4 KB). Each page contains keys and pointers to child pages, forming a tree with a high branching factor.

**Reads:** Navigate from root to leaf — O(log n). Usually 3–4 levels for a database with millions of rows.

**Writes:** Find the leaf page and update it in place. If the page is full, split it and update the parent pointer. This write-in-place strategy means **a crash during a split can leave the tree inconsistent** — hence the write-ahead log (WAL).

**Write amplification:** One logical write may cause many disk writes (WAL entry + page update + parent updates).

### When to use B-trees
- General-purpose OLTP workloads.
- Range queries (e.g., `WHERE created_at BETWEEN ...`).
- Most relational databases: PostgreSQL, MySQL InnoDB, SQLite.

---

## LSM-Trees (Log-Structured Merge-Trees)

Instead of updating pages in place, LSM-trees **append all writes to a sequential log**. Periodically, sorted runs are merged and compacted.

**Structure:**
1. **Memtable** — in-memory sorted structure (red-black tree or skip list). All writes land here first.
2. **SSTables** — immutable sorted files on disk. When the memtable is full, it's flushed as an SSTable.
3. **Compaction** — background process that merges SSTables and removes obsolete versions.

**Reads:** Check memtable → Level 0 SSTables → Level 1 → ... Bloom filters avoid unnecessary disk reads.

**Write amplification:** Lower than B-trees for write-heavy workloads. A single user write may result in one compaction write later.

### When to use LSM-trees
- Write-heavy workloads (time series, logging, event stores).
- LevelDB, RocksDB, Cassandra, HBase, InfluxDB.

---

## Comparison

| Property | B-Tree | LSM-Tree |
|---|---|---|
| Write speed | Moderate | Fast |
| Read speed | Fast | Moderate |
| Space amplification | Low | Higher (pre-compaction) |
| Compaction pauses | None | Yes (background) |
| Crash recovery | WAL | WAL + memtable replay |
