# Moeen

Moeen (Arabic for Helper/Supporter) is a specialized job tracking application built specifically for software engineers navigating the post-graduate job market.

## Run the complete project

From the repository root, run:

```bash
docker compose up
```

The frontend and backend images are rebuilt from the current source on every `up`, then PostgreSQL, Spring Boot, and Nginx start in dependency order.

- Website: http://localhost:3001
- Backend: http://localhost:8080
- PostgreSQL: `localhost:5433`

Stop the stack with `docker compose down`. Study sessions and timer preferences remain in the named `backend_postgres_data` Docker volume, even if the PostgreSQL container is removed and recreated.

Do not use `docker compose down --volumes` (or delete `backend_postgres_data`) unless you intentionally want to erase all saved history. You can confirm that the volume exists with:

```bash
docker volume inspect backend_postgres_data
```
