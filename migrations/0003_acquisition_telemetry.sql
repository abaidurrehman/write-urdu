-- WU-ANALYTICS-003: coarse first-party acquisition rollups.
-- No referrer URL, query string, user identifier, IP or user-agent is stored.

CREATE TABLE IF NOT EXISTS site_hourly_acquisition (
  bucket_hour TEXT NOT NULL,
  acquisition_channel TEXT NOT NULL,
  page_type TEXT NOT NULL,
  visits INTEGER NOT NULL DEFAULT 0,
  latest_event_at TEXT,
  PRIMARY KEY (bucket_hour, acquisition_channel, page_type)
);

CREATE TABLE IF NOT EXISTS site_hourly_entry_routes (
  bucket_hour TEXT NOT NULL,
  acquisition_channel TEXT NOT NULL,
  page_type TEXT NOT NULL,
  route TEXT NOT NULL,
  entries INTEGER NOT NULL DEFAULT 0,
  latest_event_at TEXT,
  PRIMARY KEY (bucket_hour, acquisition_channel, page_type, route)
);
