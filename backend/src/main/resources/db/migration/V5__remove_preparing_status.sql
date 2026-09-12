-- ============================================================
-- Remove PREPARING from application_status lifecycle
-- Applications start directly at APPLIED.
-- ============================================================

-- 1. Drop the old check constraint that allowed NULL applied_at only when PREPARING
ALTER TABLE job_applications
    DROP CONSTRAINT IF EXISTS ck_job_applications_applied_at;

-- 2. Migrate any existing records from PREPARING to APPLIED
UPDATE job_applications
SET current_status = 'APPLIED'
WHERE current_status::text = 'PREPARING';

UPDATE job_applications
SET applied_at = created_at
WHERE applied_at IS NULL;

ALTER TABLE job_applications
    ALTER COLUMN applied_at SET NOT NULL,
    ALTER COLUMN applied_at SET DEFAULT CURRENT_TIMESTAMP;

UPDATE application_status_history
SET previous_status = 'APPLIED'
WHERE previous_status::text = 'PREPARING';

UPDATE application_status_history
SET new_status = 'APPLIED'
WHERE new_status::text = 'PREPARING';

-- 3. Recreate enum type without 'PREPARING'
ALTER TYPE application_status RENAME TO application_status_old;

CREATE TYPE application_status AS ENUM (
    'APPLIED',
    'UNDER_REVIEW',
    'ASSESSMENT',
    'PHONE_SCREEN',
    'INTERVIEW',
    'FINAL_INTERVIEW',
    'OFFER',
    'ACCEPTED',
    'REJECTED',
    'WITHDRAWN',
    'GHOSTED',
    'ARCHIVED'
);

ALTER TABLE job_applications
    ALTER COLUMN current_status TYPE application_status
        USING current_status::text::application_status,
    ALTER COLUMN current_status SET DEFAULT 'APPLIED';

ALTER TABLE application_status_history
    ALTER COLUMN previous_status TYPE application_status
        USING previous_status::text::application_status,
    ALTER COLUMN new_status TYPE application_status
        USING new_status::text::application_status;

DROP TYPE application_status_old;

