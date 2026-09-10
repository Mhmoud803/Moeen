# Moeen

Moeen (Arabic for Helper/Supporter) is a specialized job tracking application built specifically for software engineers navigating the post-graduate job market.

## Run the complete project

From the repository root, run:

```bash
docker compose up
```

Stop the stack with `docker compose down`. Study sessions and timer preferences remain in the named `backend_postgres_data` Docker volume, even if the PostgreSQL container is removed and recreated.

Do not use `docker compose down --volumes` (or delete `backend_postgres_data`) unless you intentionally want to erase all saved history. You can confirm that the volume exists with:

```bash
docker volume inspect backend_postgres_data
```
