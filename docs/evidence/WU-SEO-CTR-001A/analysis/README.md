# Analysis scripts — 2026-10-04 second-opinion reconciliation

Python 3, standard library only. Scripts expect to run from a directory containing `docs/evidence/WU-SEO-CTR-001A/gsc/` and, for script 03, a decompressed Planner file saved as `kw.csv`:

```bash
xz -dc "docs/evidence/WU-SEO-CTR-001A/Keyword Stats 2026-10-04 at 11_49_18.csv.xz" > kw.csv   # UTF-16 TSV
python3 docs/evidence/WU-SEO-CTR-001A/analysis/01-top-queries.py
python3 docs/evidence/WU-SEO-CTR-001A/analysis/02-clusters-and-position-curve.py
python3 docs/evidence/WU-SEO-CTR-001A/analysis/03-planner-vs-gsc.py
```

- `01` top queries by impressions and clicks.
- `02` regex query clusters, CTR by position bucket, and the `english to urdu` family.
- `03` Planner bucket sums per cluster, and the overlap check (785 of 786 Planner keywords are GSC queries).

Cluster boundaries are regex heuristics; treat cluster totals as approximate. Window/host/page aggregates in the amendment were computed ad hoc from `Chart.csv` and `Pages.csv` with the same approach.
