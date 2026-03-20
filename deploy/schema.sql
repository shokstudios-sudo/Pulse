-- Pulse Monitor — Database Schema
-- Usage: mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS pulse_monitor
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE pulse_monitor;

CREATE TABLE IF NOT EXISTS monitors (
  id          VARCHAR(64) PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  url         TEXT NOT NULL,
  status      ENUM('up','down','slow') NOT NULL DEFAULT 'up',
  latency     INT NOT NULL DEFAULT 0,
  uptime      DECIMAL(6,2) NOT NULL DEFAULT 100.00,
  last_checked DATETIME NULL,
  check_interval INT NOT NULL DEFAULT 60,
  location    VARCHAR(64) NOT NULL DEFAULT 'Local',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS checks (
  id          VARCHAR(64) PRIMARY KEY,
  monitor_id  VARCHAR(64) NOT NULL,
  timestamp   BIGINT NOT NULL,
  status      ENUM('up','down','slow') NOT NULL,
  latency     INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_monitor_id (monitor_id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_monitor_ts (monitor_id, timestamp),
  FOREIGN KEY (monitor_id) REFERENCES monitors(id) ON DELETE CASCADE
) ENGINE=InnoDB;
