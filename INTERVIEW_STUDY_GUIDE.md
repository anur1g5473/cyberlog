# CYBERLOG: COMPLETE PROJECT ERRORS, SECURITY ARCHITECTURE & INTERVIEW GUIDE

This document details every real-world bug, architectural decision, security vulnerability, and interview concept encountered while building **CyberLog**. Use this guide to master the exact technical details of your codebase for technical interviews.

---

## TABLE OF CONTENTS
1. [PROBLEM 1: Passphrase Exposure & Timing Attack Vulnerabilities](#problem-1-passphrase-exposure--timing-attack-vulnerabilities)
2. [PROBLEM 2: Brute-Force Rate-Limiting & Supabase `.single()` Exception Loop](#problem-2-brute-force-rate-limiting--supabase-single-exception-loop)
3. [PROBLEM 3: Localhost Cookie Rejection & Login Redirection Loop](#problem-3-localhost-cookie-rejection--login-redirection-loop)
4. [PROBLEM 4: Vercel CDN Caching of Math CAPTCHA Tokens](#problem-4-vercel-cdn-caching-of-math-captcha-tokens)
5. [PROBLEM 5: Published Content Not Displaying (Next.js Data Caching)](#problem-5-published-content-not-displaying-nextjs-data-caching)
6. [PROBLEM 6: Database Migration (SQLite/Prisma vs Supabase SDK)](#problem-6-database-migration-sqliteprisma-vs-supabase-sdk)

---

## PROBLEM 1: Passphrase Exposure & Timing Attack Vulnerabilities

### 1. What was the Problem?
Initially, administrative passphrase checking risked exposing cleartext passwords in code or `.env` files. Furthermore, naive string comparison (`inputPassword === expectedPassword`) allows attackers to execute **Side-Channel Timing Attacks** by measuring execution time differences in milliseconds down to the microsecond level to determine which characters matched.

### 2. Technical Interview Questions & Answers

#### Q1: What is a Salted Hash, and why is standard SHA-256 or MD5 inadequate for passwords?
- **Answer:** MD5 and standard SHA-256 are fast hashing algorithms designed for checksums, not security. Attackers can compute billions of MD5/SHA-256 hashes per second using GPUs or pre-computed lookup tables called **Rainbow Tables**. 
- **Salting** injects a unique random byte sequence into each password prior to hashing. This ensures two identical passwords generate completely distinct hashes, destroying Rainbow Table attacks.
- **Bcrypt** uses a key-derivation function based on the Blowfish cipher with an adjustable **Work Factor (Cost Factor)**, forcing the CPU to spend deliberate computational cycles per hash (e.g., cost factor 10), slowing down brute-force attacks by orders of magnitude.

#### Q2: What is a Side-Channel Timing Attack in Authentication?
- **Answer:** When code compares strings character-by-character (e.g., using `===`), the engine returns `false` as soon as it finds the first mismatched character. An attacker measures the round-trip response time: a response taking 12ms means character 1 was wrong, while a response taking 15ms means character 1 was right and it failed on character 2. By iterating through character sets, an attacker reconstructs the password without brute-forcing the whole string.

#### Q3: How was this solved in our codebase?
- **Answer:** We generated a salted bcrypt hash (`$2a$10$...`) for the admin passphrase `#wg4psxtvyQ` and stored *only* the hash string in `.env`. During authentication in `src/lib/auth/passphrase.ts`, we process comparisons through `bcrypt.compare()`, which utilizes constant-time comparison under the hood so response latency remains identical regardless of where a character mismatch occurs.

---

## PROBLEM 2: Brute-Force Rate-Limiting & Supabase `.single()` Exception Loop

### 1. What was the Problem?
When testing lockout penalties, failing an authentication attempt repeatedly kept displaying `"2 attempt(s) remaining"` without triggering an actual lockout penalty.

### 2. Technical Interview Questions & Answers

#### Q1: What caused the lockout counter to reset on every request?
- **Answer:** In Supabase's JS SDK, calling `.single()` on a table query enforces that *exactly one row* must exist. If 0 rows match (e.g., when an IP attempts logging in for the very first time), Supabase throws a fatal database exception code `PGRST116`. 
- Because the exception was caught by a generic `try/catch` block, `failedCount` kept defaulting back to `1` on every single attempt, creating an infinite loop where the user was always told they had 2 attempts left.

#### Q2: What is the difference between `.single()` and `.maybeSingle()` in Supabase / PostgREST?
- **Answer:**
  - `.single()` expects 1 row. Returns `{ data: row, error: null }` if found. If 0 rows or >1 rows match, it returns `{ data: null, error: PGRST116 }`.
  - `.maybeSingle()` expects 0 or 1 row. If 0 rows match, it gracefully returns `{ data: null, error: null }` without throwing an exception.

#### Q3: What is Progressive Rate-Limiting (Exponential Backoff)?
- **Answer:** Rather than banning an IP permanently on 3 mistakes, progressive rate-limiting scales penalties based on failure frequency:
  - Tries 1–2: Warning counter.
  - Try 3: 10-second cooldown penalty.
  - Try 6: 30-second cooldown penalty.
  - Try 9: 60-second cooldown penalty.

#### Q4: How was this solved in our codebase?
- **Answer:** In `src/lib/auth/lockout.ts`, we replaced `.single()` with `.maybeSingle()`. We also configured `upsert(..., { onConflict: 'identifier' })` so Supabase updates existing IP records cleanly. On the frontend (`src/app/admin/login/page.tsx`), we implemented a live `setInterval` countdown timer that disables input controls and ticks down seconds in real-time.


---

## PROBLEM 3: Localhost Cookie Rejection & Login Redirection Loop

### 1. What was the Problem?
After entering the correct admin passphrase, the user was authenticated, but immediately bounced back to `/admin/login` when attempting to access `/admin/dashboard`.

### 2. Technical Interview Questions & Answers

#### Q1: What is the `Secure` attribute on an HTTP Cookie, and why did it break on local development?
- **Answer:** The `Secure` cookie directive instructs web browsers to submit the cookie *only* over encrypted HTTPS connections. If a server issues a cookie marked `Secure: true` over unencrypted HTTP (such as `http://localhost:3000`), modern browser security engines reject the cookie and discard it immediately.

#### Q2: What are `HttpOnly` and `SameSite` cookie flags?
- **Answer:**
  - `HttpOnly`: Prevents client-side JavaScript (`document.cookie`) from reading or modifying the cookie, protecting against Cross-Site Scripting (XSS) session hijacking.
  - `SameSite=Lax`: Prevents cross-site request forgery (CSRF) by refusing to send the cookie on cross-site subrequests (e.g. `<img>` tags or cross-site POSTs) while permitting normal top-level navigation.

#### Q3: What is the `x-forwarded-proto` header?
- **Answer:** When deployed behind reverse proxies or load balancers (like Vercel or AWS ALB), internal traffic between the proxy and Next.js runs over HTTP. The proxy appends `x-forwarded-proto: https` to notify backend servers that the original client connection was secure.

#### Q4: How was this solved in our codebase?
- **Answer:** In `src/lib/auth/session.ts`, we made the cookie's `secure` property dynamic:
```typescript
const isHttps = req.headers.get('x-forwarded-proto') === 'https';
cookieStore.set('admin_session', token, {
  httpOnly: true,
  secure: isHttps, // false on http://localhost, true on production HTTPS
  sameSite: 'lax',
  path: '/',
});
```

---

## PROBLEM 4: Vercel CDN Caching of Math CAPTCHA Tokens

### 1. What was the Problem?
On local development, the math CAPTCHA generated a new equation every time. On Vercel, the equation never changed, and submitting any answer returned `"Math challenge session expired or invalid. Please refresh"`. Refreshing the page did not fix it.

### 2. Technical Interview Questions & Answers

#### Q1: What is CDN (Content Delivery Network) Caching in Next.js?
- **Answer:** Modern deployment platforms like Vercel automatically cache `GET` API endpoints at Edge CDN locations during production build time (`next build`) to maximize speed, unless explicitly told not to. 

#### Q2: Why did CDN caching ruin our Math CAPTCHA security?
- **Answer:** Because `/api/auth/challenge/route.ts` was a static `GET` handler, Vercel executed `createMathChallenge()` *once during the build process*. The signed HMAC token generated had a 5-minute expiration time (`5m`). 
- Every single visitor on Vercel was served the pre-rendered, 5-minute-old cached JSON response. Because the token was already expired relative to real-time, validation always failed. When users clicked refresh, the CDN intercepted the request and returned the exact same cached JSON.

#### Q3: What is HMAC-SHA256 and how does Stateless Token Verification work?
- **Answer:**
  - **HMAC (Hash-based Message Authentication Code):** Uses a secret key (`JWT_SECRET`) combined with cryptographic SHA-256 hashing to sign payload data (`{ expectedResult: 45 }`).
  - **Stateless Verification:** The server does not store active challenges in a database. When the client submits `{ answer: 45, token: "eyJhbG..." }`, the server decrypts and verifies the JWT signature using `jose`. If the signature matches and time < 5m, the answer is valid.

#### Q4: How was this solved in our codebase?
- **Answer:**
  1. In `src/app/api/auth/challenge/route.ts`, we added route segment configurations:
     `export const dynamic = 'force-dynamic';`
     `export const revalidate = 0;`

---

## PROBLEM 5: Published Content Not Displaying (Next.js Data Caching)

### 1. What was the Problem?
After writing and publishing a new blog post in the `/admin` portal, the post appeared in Supabase and the Admin Dashboard, but visitors on `/blog` or `/` (home page) could not see it.

### 2. Technical Interview Questions & Answers

#### Q1: Why doesn't Next.js immediately show new database entries on production pages?
- **Answer:** Next.js App Router utilizes an aggressive multi-tiered caching architecture (Client Router Cache, Full Route Cache, and Data Cache). Even when pages fetch data from a database, Next.js caches the rendered HTML outputs to serve static HTML instantly. Creating a new row in an external database does not automatically notify Next.js to discard its rendered HTML cache.

#### Q2: What is `revalidatePath()` in Next.js?
- **Answer:** `revalidatePath(path)` is a built-in Next.js server function that manually purges the cached static HTML and data cache for a specific route path, forcing Next.js to re-render that page with fresh database data on the next incoming request.

#### Q3: Why is SQL `.ilike` preferable to `.eq` for status column checks?
- **Answer:** PostgreSQL string equality `.eq('status', 'PUBLISHED')` is strictly case-sensitive. If an admin form submits `'published'`, `'Published'`, or `'PUBLISHED'`, `.eq` will fail to match. `.ilike('status', 'published')` performs a case-insensitive match, preventing missing-data bugs.

#### Q4: How was this solved in our codebase?
- **Answer:** In `src/app/api/posts/route.ts` and `src/app/api/posts/[id]/route.ts`, we imported `revalidatePath` and executed cache purges inside `POST`, `PUT`, and `DELETE` handlers:
```typescript
revalidatePath('/blog');
revalidatePath('/');
revalidatePath('/admin/dashboard');
```

---

## PROBLEM 6: Database Migration (SQLite/Prisma vs Supabase SDK)

### 1. What was the Problem?
We started with Prisma ORM configured for SQLite. When migrating to Supabase for production, we needed to decide between Prisma over PostgreSQL vs the official `@supabase/supabase-js` SDK.

### 2. Technical Interview Questions & Answers

#### Q1: Why does Prisma specify `provider = "postgresql"` when connecting to Supabase?
- **Answer:** Supabase is built directly on top of a standard PostgreSQL database engine. Prisma is a database ORM that communicates with database engines (Postgres, MySQL, SQLite). Because Supabase exposes a standard Postgres connection string (`postgresql://postgres:...`), Prisma treats Supabase as a PostgreSQL database.

#### Q2: Why did we switch from Prisma ORM to `@supabase/supabase-js` SDK?
- **Answer:** For serverless Next.js deployments on Vercel, traditional ORMs like Prisma require maintaining database connection pools (`pgbouncer`). The native `@supabase/supabase-js` client communicates via HTTPS REST requests through Supabase PostgREST endpoints, eliminating connection exhaustion issues in serverless lambdas while eliminating complex build-step binaries.

---

### SUMMARY OF THE COMPLETE SECURITY ARCHITECTURE

- **Authentication:** Salted Bcrypt (Cost Factor 10) + Constant-Time Verification.
- **Session Layer:** `HttpOnly`, `SameSite=Lax`, Dynamic `Secure` JWT Cookies.
- **Brute-Force Defense:** Progressive IP Cooldowns (10s ➔ 30s ➔ 60s) + Live Client Countdown UI.
- **Bot CAPTCHA:** Stateless HMAC-SHA256 Signed Math Tokens (`jose` JWT, 5-minute TTL).
- **Database:** Supabase PostgreSQL with REST Client SDK.
- **Cache Management:** Dynamic Route Segments + On-Demand Cache Invalidation via `revalidatePath`.

     And explicitly set response headers: `'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'`
  2. In `src/components/ui/MathChallenge.tsx`, we appended a cache-busting timestamp parameter: `fetch('/api/auth/challenge?t=' + Date.now(), { cache: 'no-store' })`.
