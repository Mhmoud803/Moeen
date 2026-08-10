-- Moeen is currently a single-user application. Earlier versions generated an
-- owner key in browser localStorage, making persisted rows appear to disappear
-- when the browser origin/storage changed. Consolidate those rows under the
-- stable owner used by the frontend.

INSERT INTO study_preferences (
    owner_key,
    focus_minutes,
    short_break_minutes,
    long_break_minutes,
    sessions_until_long_break,
    created_at,
    updated_at,
    created_by,
    updated_by
)
SELECT
    'moeen-default-owner',
    focus_minutes,
    short_break_minutes,
    long_break_minutes,
    sessions_until_long_break,
    created_at,
    updated_at,
    created_by,
    updated_by
FROM study_preferences
WHERE owner_key <> 'moeen-default-owner'
ORDER BY updated_at DESC NULLS LAST, created_at DESC
LIMIT 1
ON CONFLICT (owner_key) DO NOTHING;

DELETE FROM study_preferences
WHERE owner_key <> 'moeen-default-owner';

UPDATE study_sessions
SET owner_key = 'moeen-default-owner'
WHERE owner_key <> 'moeen-default-owner';
