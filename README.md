# 🧊 3D Generator

> **Free Image-to-3D model converter powered by the TRELLIS 2 AI model.**

Upload any image, watch it transform into a downloadable 3D model — no account required to browse, registration unlocks personal history and asset management.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🖼️ **Image to 3D** | Drag-and-drop (or click-to-select) any image and generate a 3D model via the TRELLIS 2 model |
| 📋 **Generation Queue** | Real-time queue tracking: *Queued → Processing → Ready* |
| 📦 **Asset Gallery** | Browse all publicly generated 3D models on the home page |
| 👤 **User Accounts** | Register/login to keep a personal history of your generated models |
| 🌍 **Internationalization** | Full English 🇬🇧 and Russian 🇷🇺 support with locale-prefixed URLs (`/en/`, `/ru/`) |
| 🔒 **Secure Auth** | JWT sessions stored in HTTP-only cookies; passwords hashed with bcrypt |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | [TypeScript 5](https://www.typescriptlang.org) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) + SCSS modules |
| ORM | [Prisma 6](https://www.prisma.io) |
| Database | SQLite |
| Auth | [jose](https://github.com/panva/jose) (JWT) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |
| i18n | [next-intl](https://next-intl-docs.vercel.app) |
| Testing | [Vitest](https://vitest.dev) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or later
- **npm** v9 or later

### 1. Clone & Install

```bash
git clone https://github.com/vadzimshpak/3dgenerator.git
cd 3dgenerator
npm install
```

### 2. Configure Environment

Create a `.env` file in the project root:

```env
# SQLite database file location
DATABASE_URL="file:./dev.db"

# Secret key used to sign JWT tokens (use a long random string in production)
JWT_SECRET="your-super-secret-key-at-least-32-chars"

# Node environment
NODE_ENV="development"
```

### 3. Set Up the Database

```bash
# Push the Prisma schema to the database (creates tables)
npm run db:push

# (Optional) Open Prisma Studio GUI to inspect data
npm run db:studio
```

### 4. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app auto-reloads on file changes.

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Create an optimized production build |
| `npm start` | Run the production server |
| `npm run lint` | Lint source files with ESLint |
| `npm test` | Run the Vitest test suite once |
| `npm run test:watch` | Run Vitest in interactive watch mode |
| `npm run db:generate` | Regenerate the Prisma client |
| `npm run db:push` | Push Prisma schema changes to the database |
| `npm run db:migrate` | Create and apply a new Prisma migration |
| `npm run db:studio` | Open Prisma Studio (database GUI) |

---

## 📁 Project Structure

```
3dgenerator/
├── src/
│   ├── app/
│   │   ├── [locale]/           # Locale-prefixed pages (en / ru)
│   │   │   ├── page.tsx            # Home page (gallery + upload form)
│   │   │   ├── GenerateForm.tsx    # Image upload & submit form
│   │   │   ├── ImageDropzone.tsx   # Drag-and-drop image picker
│   │   │   ├── generateAction.ts   # Server action: create queue entry
│   │   │   ├── queue/[id]/         # Queue status tracking page
│   │   │   ├── assets/[id]/        # Individual asset detail page
│   │   │   ├── login/              # Login page & action
│   │   │   ├── register/           # Registration page & action
│   │   │   └── profile/            # Authenticated user profile
│   │   ├── api/queue/[id]/image/   # REST API: serve uploaded image
│   │   └── actions.ts              # Global server actions (logout)
│   ├── components/
│   │   ├── Header.tsx              # Top navigation bar
│   │   ├── HeaderLangSwitcher.tsx  # EN / RU language toggle
│   │   └── AssetsSection.tsx       # Responsive asset card grid
│   ├── lib/
│   │   ├── db.ts                   # Prisma client singleton
│   │   ├── session/                # JWT auth helpers (token, cookies)
│   │   └── styles/                 # Shared SCSS variables & mixins
│   └── i18n/                       # next-intl routing & config
├── prisma/
│   └── schema.prisma               # Database schema
├── messages/
│   ├── en.json                     # English translations
│   └── ru.json                     # Russian translations
├── tests/                          # Vitest test suite
└── public/                         # Static assets
```

---

## 🗄️ Database Schema

```prisma
model User {
  id              Int              @id @default(autoincrement())
  login           String           @unique
  password        String
  createdAt       DateTime         @default(now())
  generatedModels GeneratedModel[]
  generateQueue   GenerateQueue[]
}

model GenerateQueue {
  id            Int      @id @default(autoincrement())
  file          Bytes             // raw image binary
  fileType      String
  status        Int      @default(0)  // 0 queued | 1 processing | 2 ready
  resultFileUrl String?
  userId        Int?
  createdAt     DateTime @default(now())
  user          User?    @relation(fields: [userId], references: [id])
}

model GeneratedModel {
  id        Int      @id @default(autoincrement())
  name      String
  fileUrl   String
  imageUrl  String
  userId    Int?
  createdAt DateTime @default(now())
  user      User?    @relation(fields: [userId], references: [id])
}
```

---

## 🔌 API Reference

### `GET /api/queue/[id]/image`

Returns the original image that was uploaded for a queue entry.

| | |
|---|---|
| **Auth** | Required (session cookie) |
| **200** | Image binary with correct `Content-Type` header |
| **401** | No valid session |
| **404** | Queue item not found or belongs to another user |

---

## 🌍 Internationalization

The app uses `next-intl` with locale-prefixed routing:

| Locale | URL prefix | Translation file |
|---|---|---|
| English (default) | `/en/` | `messages/en.json` |
| Russian | `/ru/` | `messages/ru.json` |

A language switcher in the header lets users switch locales while staying on the same page.

---

## 🔐 Authentication

- Passwords are hashed using **bcrypt** (10 salt rounds).
- Sessions are signed **JWT tokens** with a 7-day expiry.
- Tokens are stored in **HTTP-only, SameSite=Lax** cookies — inaccessible to JavaScript, protecting against XSS and CSRF attacks.
- In production the cookie is additionally flagged `Secure` (HTTPS only).

---

## 🧪 Testing

```bash
npm test
```

Tests live in the `tests/` directory and use **Vitest** with an in-memory SQLite database so they run without external services.

```bash
npm run test:watch   # re-runs tests on every file change
```

---

## 📄 License

This project is open-source. See [LICENSE](LICENSE) for details (if present).
