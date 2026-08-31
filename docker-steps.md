# Docker Compose — Simple Reference

Each concept below = definition + options (if any) + a tiny example.

---

## Services

**Definition:** the containers you want to run.

```yaml
services:
  redis:
    image: redis:latest
```

---

## Image

**Definition:** what your container is built from.

```yaml
image: redis:latest
```

---

## Container Name

**Definition:** the fixed name Docker gives to the NEW container it creates.

```yaml
container_name: cache-redis
```

---

## Ports

**Definition:** forward a port on your machine (`host`) into the container's port.

```yaml
ports:
  - "6379:6379"   # "host:container"  (always quote it)
```

---

## Environment

**Definition:** env variables passed into the container.

Options: as a list or a map.

```yaml
environment:                   # map style
  POSTGRES_USER: admin

environment:                   # list style
  - POSTGRES_USER=admin
```

---

## Volumes

**Definition:** persistent storage so data survives container restarts.

**Options / path:** left = volume name, right = path inside container.
- Redis data path: `/data`
- Postgres data path: the image's declared volume, e.g. `/var/lib/postgresql`

```yaml
volumes:
  - redis-data:/data

volumes:
  redis-data:    # must be declared here too
```

> **Notice:** the `volumes:` at the bottom is a **declaration**, not creation.
> It just tells Docker "this is a real named volume." The actual disk is created
> automatically when you run `docker compose up`. It is **required** — without it
> Docker doesn't know `redis-data` is a managed volume and may error out
> (*"refers to undefined volume"*).

---

## Restart

**Definition:** auto-restart policy.

**Options:**
- `no` — never restart
- `always` — always restart
- `on-failure` — restart only on crash
- `unless-stopped` — restart unless you stopped it manually

```yaml
restart: unless-stopped
```

---

## Pull Policy

**Definition:** when Docker downloads the image vs uses the local one.

**Options:**
- `always` — always download, even if you have it
- `never` — never download; error if not local
- `missing` — download only if not local
- `if_not_present` — use local, download only if missing

```yaml
pull_policy: if_not_present
```

---

## Depends On

**Definition:** start this service only after another one.

```yaml
depends_on:
  - redis
```

---

## Command

**Definition:** override the image's default start command.

```yaml
command: redis-server --appendonly yes
```

---

## Full Example

```yaml
services:
  redis:
    image: redis:latest
    container_name: cache-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped

  postgres:
    image: postgres:latest
    container_name: cache-postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: mydb
    volumes:
      - pgdata:/var/lib/postgresql
    restart: unless-stopped

volumes:
  redis-data:
  pgdata:
```
