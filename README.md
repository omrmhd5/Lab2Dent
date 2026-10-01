# 🦷 Lab2Dent — Dental Case Coordination

A dental case coordination platform built for **Lab2Dent** to replace manual campus-to-lab handoffs with a single online flow for Egyptian dental students. Students register their university and work type, pay via Instapay with a receipt upload, and receive a tracking code; desk staff confirm cases, assign them to the lab, and advance status while lab staff work assigned orders from a dedicated view.

The platform **digitized case intake and Instapay proof in one submission**, gave every student **one tracking code instead of fragmented follow-ups**, and centralized **desk-to-lab status, assignment, and category revenue tracking** in role-based dashboards.

---

## 🔧 Features

### 📝 Student Registration & Tracking

- Register a case with no student account — name, phone, and university only
- Multi-step flow: case details, listed pricing with optional add-ons, Instapay transfer, and receipt upload
- Tracking code lookup with live status and order history
- Public service catalog and pricing on the homepage

### 📋 Staff Dashboard

- Role-based access: **admin**, **employee** (desk), and **lab**
- Orders table with search, status filter, and university filter
- Status workflow from pending through delivered or rejected
- Assign cases to lab staff; order detail with payment proof and custom field values
- Excel export for desk records

### 🗂️ Catalog, Team & Settings

- Nested service categories with custom fields (text, number, image, price add-ons)
- Universities management for student selection
- Staff CRUD with role and scope controls
- Instapay link configuration for student payments
- Category analytics: confirmed orders, revenue, cost, and profit totals

### 🌍 Multilingual Experience

- Full English and Arabic UI with RTL / LTR layout
- Language toggle on public pages and in the staff shell
- Localized validation, errors, and status labels

### 🎨 UI / UX

- Dark / light theme with saved preference
- Fully responsive layouts for student and staff flows
- Motion-driven page transitions and step-by-step case registration

---

## 💡 Impact

- Replaced informal case handoffs with a structured register → pay → track workflow and a single case code per submission
- Attached Instapay payment proof to every case so the desk can confirm before sending work to the lab
- Centralized order status, lab assignment, and exports for admin, desk, and lab roles in one dashboard
- Gave the desk category-level order, revenue, cost, and profit totals for confirmed work

---

## 📦 Tech Stack

| Layer      | Tech                                       |
| ---------- | ------------------------------------------ |
| Framework  | Next.js 16, React 19, TypeScript           |
| i18n       | Custom EN/AR message catalogs              |
| Database   | PostgreSQL, Drizzle ORM                    |
| Auth       | iron-session, bcryptjs                     |
| Storage    | Vercel Blob (payment screenshots, uploads) |
| Export     | ExcelJS                                    |
| Styling    | Tailwind CSS 4, Motion                     |
| Deployment | Vercel + PostgreSQL                        |

---

## 🌐 Deployment Notes

- Fully responsive student registration, tracking, and staff dashboard flows
- PostgreSQL with Drizzle ORM; Vercel Blob for payment screenshots and image field uploads
- Role-based session auth for admin, desk, and lab staff
- Serverless-friendly Postgres connection reuse on Vercel

---

## 🎬 Site Demo

<!-- Media capture pending — add after screenshot and video gates -->

**Site tour video coming soon** — `./docs/lab2dent-demo.mp4`

---

## 📸 Screenshots

<!-- Media capture pending — add 2-column table after screenshot gate -->

_Screenshots coming soon — `docs/screenshots/`_

---

## Live Demo 🚀

[**View Live Demo**](https://lab2dent-demo.vercel.app)

| Role     | Email                 | Password    |
| -------- | --------------------- | ----------- |
| Admin    | admin@admin.com       | admin123    |
| Employee | employee@employee.com | employee123 |
| Lab      | lab@lab.com           | lab123      |

Students open **Register a case** from the homepage — no login. Use the tracking code after submission to follow status.

---

## Author

👤 **Omar Mahmoud**
📧 [omrmhd54@gmail.com](mailto:omrmhd54@gmail.com)
💼 [LinkedIn](https://www.linkedin.com/in/omrmhd5/)
🌐 [Portfolio](https://omarmahmoud.dev/)
🔗 [GitHub](https://github.com/omrmhd5)
