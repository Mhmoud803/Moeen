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

Stop the stack with `docker compose down`. Database data remains in the `backend_postgres_data` Docker volume.
