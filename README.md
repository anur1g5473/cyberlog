<div align="center">

# ⚡ CYBERLOG // v1.0 ⚡

**Personal Cybersecurity Portfolio & Research Log**

[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Security](https://img.shields.io/badge/Security-Hardened-ff3b3b?style=for-the-badge&logo=cisco&logoColor=white)]()

> _"Security is a process, not a product." — Bruce Schneier_

</div>

---

## 📡 OVERVIEW

**CyberLog** is a bespoke, self-hosted cybersecurity portfolio and blog engineered from the ground up for performance, aesthetics, and defense. 

Ditching off-the-shelf CMS solutions and standard authentication providers, this platform features a custom-built, highly-secured single-admin architecture wrapped in a stunning, interactive hacker-themed terminal UI.

<br>

## 🛡️ SECURITY ARCHITECTURE (THE VAULT)

Because a security researcher's blog should be secure by default, this platform implements defense-in-depth for its admin portal `/admin/login`:

*   **Timing-Safe Authentication:** Constant-time string and hash comparisons (`bcryptjs`) to eliminate timing side-channel attacks during passphrase verification.
*   **Cryptographic CAPTCHA:** Stateless, server-validated math challenges utilizing HMAC-signed JWTs to filter automated bot traffic globally.
*   **Progressive Lockout Engine:** Server-side escalating rate-limits tied to request origins to thwart automated credential stuffing and brute-force campaigns.
*   **Strict Session Management:** Ephemeral JWT session tokens stored exclusively in strictly isolated, `HttpOnly`, `Secure`, `SameSite=Strict` cookies.

<br>

## 🖥️ UI / UX HIGHLIGHTS (THE TERMINAL)

*   **Custom Glassmorphism:** Blurred, transparent overlays mimicking modern macOS/Linux terminal environments.
*   `<CommandPalette />`: Hit `Cmd + K` anywhere on the site for an instant, fuzzy-search navigation overlay.
*   `<DotTrailProgress />`: A dynamic, glowing trajectory line that tracks reading progress down the page.
*   **Boot Sequence:** A one-time simulated OS boot animation for new sessions.

<br>

## ⚙️ SYSTEM BOOT (LOCAL INSTALLATION)

To spin up a local instance of CyberLog, follow the initialization sequence below:

### 1. Clone the Repository
```bash
git clone https://github.com/anur1g5473/cyberlog.git
cd cyberlog
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory and populate it with your Supabase credentials and cryptographic keys:
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

JWT_SECRET="generate-a-long-random-string-at-least-32-chars"
TELEMETRY_SALT="custom-secret-telemetry-salt-for-ip-hashing"

# Admin Authentication (Choose either plaintext or pre-hashed)
ADMIN_PASSPHRASE="your_secure_passphrase"
# Or Bcrypt Hash: ADMIN_PASSPHRASE_HASH="\$2a\$10\$YourGeneratedBcryptHashHere..."

# Optional: Google Authenticator TOTP Secret (Base32)
# ADMIN_TOTP_SECRET="JBSWY3DPEHPK3PXP..."
```

### 4. Initialize Database Pipeline
Navigate to your Supabase SQL Editor and execute the schema creation script found in the setup documentation to spin up your `posts` and `projects` tables. (See below).

### 5. Launch Development Server
```bash
npm run dev
```
> Access terminal at `http://localhost:3000`

<br>

## 🗄️ DATABASE SCHEMA

Executing the following in Supabase will provision your data layer instantly:

<details>
<summary><b>[ CLICK TO EXPAND SQL SCRIPT ]</b></summary>

```sql
-- Create the Posts Table
CREATE TABLE public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    tags TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    "readingTime" INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the Projects Table
CREATE TABLE public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    "techStack" TEXT NOT NULL,
    "githubUrl" TEXT NOT NULL,
    "demoUrl" TEXT,
    category TEXT NOT NULL,
    featured BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the Contact & Identity Endpoints Table
CREATE TABLE public.contact_details (
    id TEXT PRIMARY KEY DEFAULT 'default',
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    "vitEmail" TEXT NOT NULL,
    "officialEmail" TEXT NOT NULL,
    "linkedinUrl" TEXT NOT NULL,
    "githubUrl" TEXT NOT NULL,
    location TEXT,
    bio TEXT,
    "availableFor" TEXT,
    "pgpKey" TEXT,
    "pgpKeyFingerprint" TEXT,
    "twitterUrl" TEXT,
    "discordUsername" TEXT,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the Login Attempts Table (Security Lockout Engine)
CREATE TABLE public.login_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    identifier TEXT NOT NULL UNIQUE,
    "failedCount" INTEGER DEFAULT 0,
    "lockedUntil" TIMESTAMP WITH TIME ZONE,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the Now Settings Table (/now Directives)
CREATE TABLE public.now_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    headline TEXT NOT NULL,
    "currentFocus" TEXT NOT NULL,
    location TEXT NOT NULL,
    availability TEXT NOT NULL,
    "lastUpdated" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the Now Items Table (/now Activities)
CREATE TABLE public.now_items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Active',
    progress INTEGER DEFAULT 50,
    link TEXT DEFAULT '',
    "linkText" TEXT DEFAULT '',
    tags TEXT DEFAULT '[]',
    "startDate" TEXT DEFAULT '',
    "targetDate" TEXT DEFAULT '',
    "order" INTEGER DEFAULT 1,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- Insert Default Contact Row
INSERT INTO public.contact_details (id, name, title, "vitEmail", "officialEmail", "linkedinUrl", "githubUrl", location, "availableFor")
VALUES (
    'default',
    'Anurag Soni',
    'Cybersecurity Engineer & Full-Stack Developer',
    'anurag.soni2025@vitstudent.ac.in',
    'anuragsoni5473@gmail.com',
    'https://www.linkedin.com/in/anur1gsoni/',
    'https://github.com/anur1g5473',
    'Vellore / India',
    'Security Audits, Vulnerability Research & Development Collaborations'
)
ON CONFLICT (id) DO NOTHING;
```

</details>

<br>

## 📜 LICENSE

[MIT License](LICENSE). Built for the community. Use it, break it, secure it. 

---
<div align="center">
    <p><code>sys@cybersec:~$ exit</code></p>
</div>