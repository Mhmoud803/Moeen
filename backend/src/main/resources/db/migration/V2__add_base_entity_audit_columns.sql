-- ============================================================
-- Add shared audit columns required by BaseEntity
-- ============================================================

-- Existing tables already had created_at and updated_at.
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(20) NOT NULL DEFAULT 'system',
    ADD COLUMN IF NOT EXISTS updated_by VARCHAR(20);

ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(20) NOT NULL DEFAULT 'system',
    ADD COLUMN IF NOT EXISTS updated_by VARCHAR(20);

ALTER TABLE job_opportunities
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(20) NOT NULL DEFAULT 'system',
    ADD COLUMN IF NOT EXISTS updated_by VARCHAR(20);

ALTER TABLE job_applications
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(20) NOT NULL DEFAULT 'system',
    ADD COLUMN IF NOT EXISTS updated_by VARCHAR(20);

ALTER TABLE interviews
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(20) NOT NULL DEFAULT 'system',
    ADD COLUMN IF NOT EXISTS updated_by VARCHAR(20);

ALTER TABLE reminders
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(20) NOT NULL DEFAULT 'system',
    ADD COLUMN IF NOT EXISTS updated_by VARCHAR(20);

ALTER TABLE contacts
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(20) NOT NULL DEFAULT 'system',
    ADD COLUMN IF NOT EXISTS updated_by VARCHAR(20);

-- application_status_history keeps changed_at as a domain event timestamp,
-- and now also gets the shared BaseEntity audit columns.
ALTER TABLE application_status_history
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(20) NOT NULL DEFAULT 'system',
    ADD COLUMN IF NOT EXISTS updated_by VARCHAR(20);

UPDATE application_status_history
SET created_at = changed_at
WHERE created_at IS NULL;

ALTER TABLE application_status_history
    ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE application_status_history
    ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

-- documents previously only had created_at.
ALTER TABLE documents
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(20) NOT NULL DEFAULT 'system',
    ADD COLUMN IF NOT EXISTS updated_by VARCHAR(20);

-- application_contacts previously had no audit columns.
ALTER TABLE application_contacts
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(20) NOT NULL DEFAULT 'system',
    ADD COLUMN IF NOT EXISTS updated_by VARCHAR(20);
