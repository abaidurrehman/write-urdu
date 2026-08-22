-- WU-I18N-001C: bounded locale measurement using the existing METRICS_DB.
-- Locale is restricted by the API to en|ur. No writing, transcript, filename,
-- identity, request URL, or other free-form user content is stored here.

CREATE TABLE IF NOT EXISTS product_hourly_locale_metrics (
    bucket_hour TEXT NOT NULL,
    locale TEXT NOT NULL,
    tool TEXT NOT NULL,
    visits INTEGER NOT NULL DEFAULT 0,
    engaged_visits INTEGER NOT NULL DEFAULT 0,
    copies INTEGER NOT NULL DEFAULT 0,
    exports INTEGER NOT NULL DEFAULT 0,
    export_pdf INTEGER NOT NULL DEFAULT 0,
    export_png INTEGER NOT NULL DEFAULT 0,
    export_png_transparent INTEGER NOT NULL DEFAULT 0,
    export_jpeg INTEGER NOT NULL DEFAULT 0,
    export_doc INTEGER NOT NULL DEFAULT 0,
    export_txt INTEGER NOT NULL DEFAULT 0,
    export_svg INTEGER NOT NULL DEFAULT 0,
    prints INTEGER NOT NULL DEFAULT 0,
    shares INTEGER NOT NULL DEFAULT 0,
    handoffs INTEGER NOT NULL DEFAULT 0,
    batch_transliterations INTEGER NOT NULL DEFAULT 0,
    canvas_interactions INTEGER NOT NULL DEFAULT 0,
    template_uses INTEGER NOT NULL DEFAULT 0,
    background_image_uses INTEGER NOT NULL DEFAULT 0,
    summary_count INTEGER NOT NULL DEFAULT 0,
    length_0 INTEGER NOT NULL DEFAULT 0,
    length_1_20 INTEGER NOT NULL DEFAULT 0,
    length_21_50 INTEGER NOT NULL DEFAULT 0,
    length_51_100 INTEGER NOT NULL DEFAULT 0,
    length_101_250 INTEGER NOT NULL DEFAULT 0,
    length_251_500 INTEGER NOT NULL DEFAULT 0,
    length_501_1000 INTEGER NOT NULL DEFAULT 0,
    length_1001_2500 INTEGER NOT NULL DEFAULT 0,
    length_2500_plus INTEGER NOT NULL DEFAULT 0,
    active_0_10 INTEGER NOT NULL DEFAULT 0,
    active_11_30 INTEGER NOT NULL DEFAULT 0,
    active_31_60 INTEGER NOT NULL DEFAULT 0,
    active_61_180 INTEGER NOT NULL DEFAULT 0,
    active_181_600 INTEGER NOT NULL DEFAULT 0,
    active_600_plus INTEGER NOT NULL DEFAULT 0,
    input_roman INTEGER NOT NULL DEFAULT 0,
    input_direct INTEGER NOT NULL DEFAULT 0,
    input_unknown INTEGER NOT NULL DEFAULT 0,
    device_mobile INTEGER NOT NULL DEFAULT 0,
    device_tablet INTEGER NOT NULL DEFAULT 0,
    device_desktop INTEGER NOT NULL DEFAULT 0,
    latest_event_at TEXT,
    PRIMARY KEY (bucket_hour, locale, tool)
);

CREATE TABLE IF NOT EXISTS site_hourly_locale_acquisition (
    bucket_hour TEXT NOT NULL,
    locale TEXT NOT NULL,
    acquisition_channel TEXT NOT NULL,
    page_type TEXT NOT NULL,
    visits INTEGER NOT NULL DEFAULT 0,
    latest_event_at TEXT,
    PRIMARY KEY (bucket_hour, locale, acquisition_channel, page_type)
);

CREATE TABLE IF NOT EXISTS site_hourly_locale_entry_routes (
    bucket_hour TEXT NOT NULL,
    locale TEXT NOT NULL,
    acquisition_channel TEXT NOT NULL,
    page_type TEXT NOT NULL,
    route TEXT NOT NULL,
    entries INTEGER NOT NULL DEFAULT 0,
    latest_event_at TEXT,
    PRIMARY KEY (bucket_hour, locale, acquisition_channel, page_type, route)
);
