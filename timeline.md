# Timeline — Problems & Fixes

A running log of the issues we hit in this project and how we solved them.

---

## Fix 1 — Hard-coded database password in `docker-compose.yml`

### Problem
The `docker-compose.yml` had the PostgreSQL **username and password written directly in the file** (hard-coded). When pushed to GitHub, anyone could see the password in the commit history.

### What we did
1. **Fixed the file** — replaced the hard-coded values with environment-variable references so no secrets live in the file:

   ```yaml
   environment:
     POSTGRES_USER: ${POSTGRES_USER}
     POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
     POSTGRES_DB: ${POSTGRES_DB}
   ```

2. **Created `.env`** (local, gitignored) holding the real values:

   ```env
   POSTGRES_USER=cach-layers-lab-user
   POSTGRES_PASSWORD=cachlayerslabuserpass
   POSTGRES_DB=cach-layers-db
   ```

3. **Created `.env.example`** (committed, placeholders) so others know what to fill in.

4. **Also fixed a typo** in the volume mount path: `/var/lib/postgresqlh` → `/var/lib/postgresql`.

### How we removed it from GitHub history (git commands)
The password still existed in **older commits** already pushed to GitHub. To wipe it from history:

```bash
# 1. Safety backup of current history
git branch backup

# 2. Undo the commits' history, keep files as-is
git reset --soft f4d9c43

# 3. Create ONE clean commit (password gone)
git add -A
git commit -m "Initial commit"

# 4. Overwrite GitHub history so old commits with the password are gone
git push --force origin master
```

**Result:** GitHub now shows a single clean commit with no password anywhere in the history.

---

> More entries will be added here as we continue (Prisma integration, caching layers, etc.)
