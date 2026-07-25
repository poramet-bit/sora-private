-- Migration: 0001_init
-- Initial schema for ngernngern_thongthong

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL CHECK(gender IN ('male', 'female', 'other')),
    created_at TEXT NOT NULL
);

-- Health Records table
CREATE TABLE IF NOT EXISTS health_records (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    image_url TEXT,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL,
    weight REAL NOT NULL,
    height REAL NOT NULL,
    bp_systolic INTEGER NOT NULL,
    bp_diastolic INTEGER NOT NULL,
    heart_rate INTEGER NOT NULL,
    body_temp REAL NOT NULL,
    symptoms TEXT NOT NULL,
    medical_history TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Analysis Results table
CREATE TABLE IF NOT EXISTS analysis_results (
    id TEXT PRIMARY KEY,
    health_record_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    risk_level TEXT NOT NULL CHECK(risk_level IN ('low', 'moderate', 'high', 'critical')),
    risk_score INTEGER NOT NULL,
    bmi REAL NOT NULL,
    recommendations TEXT NOT NULL,
    factors TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (health_record_id) REFERENCES health_records(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_health_records_user_id ON health_records (user_id);
CREATE INDEX IF NOT EXISTS idx_health_records_created_at ON health_records (created_at);
CREATE INDEX IF NOT EXISTS idx_analysis_results_user_id ON analysis_results (user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_risk_level ON analysis_results (risk_level);
CREATE INDEX IF NOT EXISTS idx_analysis_results_created_at ON analysis_results (created_at);
