# Smart Farm Render Deployment TODO

## Status: In Progress

### Step 1: Update package.json ✅
- Change main to server.js
- Add engines node 20.x
- Stable dep versions

### Step 2: Refactor server.js for Production ✅
- Prod session config (env secret, secure cookie)
- DB: Use :memory: in prod, file local; no users table drop; demo seed
- Add /health endpoint
- Better error logging & listen 0.0.0.0

### Step 3: Create Procfile and .env.example ✅

### Step 4: Update README.md with Render instructions ✅

### Step 5: Test locally with prod env [READY]
- Run: `$env:NODE_ENV='production'; $env:SESSION_SECRET='test'; npm start`
- Check /health, login demo user

### Step 6: Git commit & push to GitHub [PENDING]

### Step 7: Deploy on Render [PENDING]
- Connect repo
- Set env vars
- Verify persistence

### Step 8: Test full app on Render [PENDING]

Mark steps complete as done.

