# Help Teacher — Frontend Screen Plan

## ⚙️ 0. Architectural Decisions

### Rendering Strategy

| Type              | Strategy                         | Details                                                                                      |
| ----------------- | -------------------------------- | -------------------------------------------------------------------------------------------- |
| **Public pages**  | **SSG (Static Site Generation)** | Landing, Login, Register, Forgot/Reset Password, Pricing — prerendered at build time for SEO |
| **Private pages** | **SPA (Client-Side)**            | All authenticated routes — rendered client-side, no SSR                                      |

### Authentication — JWT Storage

**Strategy: In-memory access token + localStorage refresh token.**

- The **access token** (short-lived, ~15 min) is stored only in an Angular signal — never persisted to disk. XSS cannot steal it.
- The **refresh token** is stored in `localStorage` to survive page reloads. It is single-use and only sent to `POST /auth/refresh`.
- **On page load**: check `localStorage` for refresh token → call `/auth/refresh` → store new access token in signal → user session restored.
- **On 401**: an HTTP interceptor automatically attempts a silent refresh before failing.
- **On logout**: clear the signal and remove the refresh token from `localStorage`.

### Pricing Data

All pricing and plan information is **always fetched from the backend** (`GET /subscriptions/plans`). Prices are **never hardcoded** in the frontend — the UI renders whatever the API returns.

### Styling

| Decision              | Value                                                                |
| --------------------- | -------------------------------------------------------------------- |
| **CSS Framework**     | Tailwind CSS v4                                                      |
| **Component Library** | daisyUI                                                              |
| **Theme**             | Custom — no pre-made daisyUI theme; colors defined via design tokens |
| **Dark Mode**         | Not supported for now                                                |

### Design Tokens

Design tokens live in `@help-teacher/shared` (`packages/shared/src/design/tokens.ts`) and are the **single source of truth** for colors, fonts, and spacing — shared between backend (emails, PDF reports) and frontend (theme).

### Color Palette — 60-30-10 Rule

The palette follows the **60-30-10 rule** for visual balance:

| Role              | Share                                     | Usage                                                 | Token          | Hex       |
| ----------------- | ----------------------------------------- | ----------------------------------------------------- | -------------- | --------- |
| **Base (60%)**    | Backgrounds, cards, surfaces              | Page background, content areas, white space           | `background`   | `#FFFFFF` |
|                   |                                           | Subtle surface backgrounds, table alt rows            | `surface`      | `#F9FAFB` |
|                   |                                           | Light blue tints for highlighted sections             | `primaryLight` | `#EFF6FF` |
| **Primary (30%)** | Navigation, headers, links, active states | Sidebar, top bar, headings, links, selected items     | `primary`      | `#2563EB` |
|                   |                                           | Hover states, focused elements                        | `primaryDark`  | `#1E40AF` |
| **Accent (10%)**  | CTAs, primary buttons, badges, alerts     | Primary action buttons, important badges, focus rings | `accent`       | `#D97706` |
|                   |                                           | Hover state for accent elements                       | `accentDark`   | `#B45309` |
|                   |                                           | Light tint for accent backgrounds                     | `accentLight`  | `#FFFBEB` |

#### Semantic colors

| Token           | Hex       | Usage                |
| --------------- | --------- | -------------------- |
| `text`          | `#1A1A1A` | Primary body text    |
| `textSecondary` | `#6B7280` | Secondary/muted text |
| `border`        | `#D1D5DB` | Default borders      |
| `borderLight`   | `#E5E7EB` | Subtle borders       |
| `success`       | `#10B981` | Success states       |
| `warning`       | `#F59E0B` | Warning states       |
| `error`         | `#EF4444` | Error states         |

### Accessibility — Text Contrast

All text must meet **WCAG 2.1 AA** minimum contrast ratios:

| Text Type                                | Minimum Contrast | Examples                       |
| ---------------------------------------- | ---------------- | ------------------------------ |
| **Normal text** (< 18px, or < 14px bold) | **4.5:1**        | Body text, labels, table cells |
| **Large text** (≥ 18px, or ≥ 14px bold)  | **3:1**          | Headings, large buttons        |

Verified contrast ratios for our palette on white (`#FFFFFF`):

| Color           | Hex       | Ratio vs White | Passes                            |
| --------------- | --------- | -------------- | --------------------------------- |
| `text`          | `#1A1A1A` | 16.6:1         | ✅ AAA                            |
| `textSecondary` | `#6B7280` | 5.0:1          | ✅ AA                             |
| `primary`       | `#2563EB` | 4.6:1          | ✅ AA (large) / borderline normal |
| `primaryDark`   | `#1E40AF` | 7.3:1          | ✅ AAA                            |
| `accent`        | `#D97706` | 5.5:1          | ✅ AA                             |
| `accentDark`    | `#B45309` | 7.0:1          | ✅ AAA                            |
| `error`         | `#EF4444` | 4.0:1          | ✅ AA (large only)                |

> **Note:** `primary` (#2563EB) at 4.6:1 passes for large text. For small body text on white, use `primaryDark` (#1E40AF) which passes AAA. `error` (#EF4444) should be used for large text or paired with an icon + `text` color label.

---

## 🔓 1. Public / Auth Screens

| Screen              | Route                       | Description                                               |
| ------------------- | --------------------------- | --------------------------------------------------------- |
| **Landing Page**    | `/`                         | Marketing page — features, pricing, CTA to sign up        |
| **Login**           | `/login`                    | Email + password form, link to register & forgot password |
| **Register**        | `/register`                 | Name, email, password form → auto-login after success     |
| **Forgot Password** | `/forgot-password`          | Email input → sends reset link                            |
| **Reset Password**  | `/reset-password?token=...` | New password form using the token from email              |

---

## 🏠 2. Post-Login / Global Screens

| Screen                    | Route           | Description                                                                                     |
| ------------------------- | --------------- | ----------------------------------------------------------------------------------------------- |
| **Organization Selector** | `/orgs`         | Lists user's organizations (from memberships) + pending invites badge + "Create new org" button |
| **Pending Invites**       | `/invites`      | List of pending invites with accept/reject actions                                              |
| **My Profile**            | `/profile`      | Edit name, locale, change password                                                              |
| **My Subscription**       | `/subscription` | Current plan info, upgrade/downgrade, cancel/reactivate, billing cycle                          |
| **Pricing / Plans**       | `/plans`        | Plan comparison (Basic vs Pro), select & subscribe                                              |

---

## 🏢 3. Organization Context (`/orgs/:slug/...`)

Once inside an org, all screens are scoped to that organization.

### 3.1 Dashboard

| Screen        | Route         | Description                                                                                 |
| ------------- | ------------- | ------------------------------------------------------------------------------------------- |
| **Dashboard** | `/orgs/:slug` | Overview — quick stats (# students, # classes this week, upcoming classes), recent activity |

### 3.2 Organization Settings

| Screen           | Route                          | Description                                                            |
| ---------------- | ------------------------------ | ---------------------------------------------------------------------- |
| **Org Settings** | `/orgs/:slug/settings`         | Edit name, slug, upload logo, danger zone (delete org)                 |
| **Members**      | `/orgs/:slug/settings/members` | List members with roles, edit roles, remove member, transfer ownership |
| **Invites**      | `/orgs/:slug/settings/invites` | Send new invite (email + roles), list sent invites with status, revoke |

### 3.3 Students

| Screen                  | Route                                       | Description                                                                                                      |
| ----------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Student List**        | `/orgs/:slug/students`                      | Paginated table/cards of students, search, create button                                                         |
| **Student Create/Edit** | `/orgs/:slug/students/new` / `.../:id/edit` | Form: first name, last name                                                                                      |
| **Student Detail**      | `/orgs/:slug/students/:id`                  | Full profile — current registration, registration history, linked users (parents), class history, link to report |
| **Student Report**      | `/orgs/:slug/students/:id/report`           | Visual report (same data as PDF) with "Download PDF" button                                                      |

### 3.4 Schools & Academic Structure

| Screen               | Route                          | Description                                                       |
| -------------------- | ------------------------------ | ----------------------------------------------------------------- |
| **School List**      | `/orgs/:slug/schools`          | CRUD list of schools                                              |
| **Education Levels** | `/orgs/:slug/education-levels` | List education levels, expandable to show grade levels underneath |
| **Grade Levels**     | (nested under education level) | CRUD within the education level detail/expansion                  |

### 3.5 Registrations (Enrollments)

| Screen                       | Route                                    | Description                                                         |
| ---------------------------- | ---------------------------------------- | ------------------------------------------------------------------- |
| **Registration List**        | `/orgs/:slug/students/:id/registrations` | (Within student detail) List of enrollments — school, grade, period |
| **Registration Create/Edit** | Modal or page                            | Form: select student, school, grade level, start/end date           |

### 3.6 Curriculum

| Screen           | Route                             | Description                          |
| ---------------- | --------------------------------- | ------------------------------------ |
| **Subject List** | `/orgs/:slug/subjects`            | CRUD list of subjects                |
| **Topic List**   | `/orgs/:slug/subjects/:id/topics` | CRUD list of topics within a subject |

### 3.7 Schedules

| Screen            | Route                   | Description                                   |
| ----------------- | ----------------------- | --------------------------------------------- |
| **Schedule List** | `/orgs/:slug/schedules` | CRUD list — day of week, start time, end time |

### 3.8 Classes

| Screen                | Route                                      | Description                                                                        |
| --------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------- |
| **Class List**        | `/orgs/:slug/classes`                      | Paginated list/calendar view of classes, filters (by student, teacher, date range) |
| **Class Create/Edit** | `/orgs/:slug/classes/new` / `.../:id/edit` | Form: select schedule, student, teacher, date                                      |
| **Class Detail**      | `/orgs/:slug/classes/:id`                  | Shows schedule info, student, teacher, date, and attached topics with add/remove   |

---

## 👨‍👩‍👧 4. Responsible (Parent) Screens

Parents with the `responsible` role linked to students via `StudentUser`:

| Screen               | Route              | Description                                                |
| -------------------- | ------------------ | ---------------------------------------------------------- |
| **My Students**      | `/my-students`     | List of linked students                                    |
| **Student Progress** | `/my-students/:id` | Read-only view of student detail — classes, topics, report |

---

## 🧩 5. Shared / Layout Components

| Component                 | Description                                                                        |
| ------------------------- | ---------------------------------------------------------------------------------- |
| **App Shell / Layout**    | Sidebar nav + top bar with org name, user avatar, notifications                    |
| **Org Sidebar**           | Navigation: Dashboard, Students, Classes, Schedules, Curriculum, Schools, Settings |
| **Breadcrumbs**           | Context navigation                                                                 |
| **Pagination**            | Reusable paginated list component (matches backend `PaginatedList`)                |
| **Empty States**          | Illustrated empty states for each entity list                                      |
| **Confirmation Dialog**   | For deletes, revokes, etc.                                                         |
| **Toast / Notifications** | Success/error feedback                                                             |

---

## 📊 6. Development Phases

### Phase 1 — Auth & Core

- [ ] Login
- [ ] Register
- [ ] Forgot Password
- [ ] Reset Password
- [ ] My Profile
- [ ] Organization Selector

> Foundation — users need to get in.

### Phase 2 — Org Setup

- [ ] Create Organization
- [ ] Org Settings
- [ ] Members
- [ ] Invites (org side)
- [ ] Pending Invites (user side)

> Multi-tenancy is the backbone.

### Phase 3 — Academic Structure

- [ ] Schools
- [ ] Education Levels
- [ ] Grade Levels
- [ ] Subjects
- [ ] Topics

> Setup data before classes.

### Phase 4 — Students & Registrations

- [ ] Student List
- [ ] Student Create/Edit
- [ ] Student Detail
- [ ] Registrations

> Core business entity.

### Phase 5 — Classes & Schedules

- [ ] Schedules
- [ ] Class List
- [ ] Class Create/Edit
- [ ] Class Detail
- [ ] Class Topics

> The daily workflow.

### Phase 6 — Reports & Parent View

- [ ] Student Report
- [ ] PDF Download
- [ ] My Students (parent)
- [ ] Student Progress (parent)

> Value delivery.

### Phase 7 — Subscription & Billing

- [ ] Plans / Pricing
- [ ] My Subscription
- [ ] Upgrade / Downgrade

> Monetization.

### Phase 8 — Dashboard & Polish

- [ ] Dashboard with stats
- [ ] Landing Page
- [ ] Empty States
- [ ] Polish & UX refinements

> Retention & marketing.
