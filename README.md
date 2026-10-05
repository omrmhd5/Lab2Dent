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

**[▶ Watch site walkthrough](./docs/lab2dent-demo.mp4)** (~1½ min)

Arabic glance → home sections → register a case (Instapay upload) → track by code → staff login → confirm payment → categories (subcategory fields) → universities → staff → settings.

---

## 📸 Screenshots

<table>
  <tr>
    <td width="50%" valign="top">
      <strong>Home — hero</strong><br />
      <img width="100%" alt="Home hero" src="./docs/screenshots/01-hero.png" />
    </td>
    <td width="50%" valign="top">
      <strong>For dental students in Egypt</strong><br />
      <img width="100%" alt="For dental students in Egypt" src="./docs/screenshots/02-for-students.png" />
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <strong>What we offer &amp; From campus to the lab</strong><br />
      <img width="100%" alt="What we offer and From campus to the lab" src="./docs/screenshots/03-offer-and-campus.png" />
    </td>
    <td width="50%" valign="top">
      <strong>Register a case — You</strong><br />
      <img width="100%" alt="Register a case step 1" src="./docs/screenshots/04-new-case-you.png" />
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <strong>Register a case — The case</strong><br />
      <img width="100%" alt="Register a case step 2" src="./docs/screenshots/05-new-case-work.png" />
    </td>
    <td width="50%" valign="top">
      <strong>Register a case — Pay</strong><br />
      <img width="100%" alt="Register a case step 3" src="./docs/screenshots/06-new-case-pay.png" />
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <strong>Track a case</strong><br />
      <img width="100%" alt="Track a case" src="./docs/screenshots/07-track.png" />
    </td>
    <td width="50%" valign="top">
      <strong>Track result</strong><br />
      <img width="100%" alt="Track result" src="./docs/screenshots/08-track-result.png" />
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <strong>Staff login</strong><br />
      <img width="100%" alt="Staff login" src="./docs/screenshots/09-login.png" />
    </td>
    <td width="50%" valign="top">
      <strong>Orders</strong><br />
      <img width="100%" alt="Orders dashboard" src="./docs/screenshots/10-orders.png" />
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <strong>Order detail</strong><br />
      <img width="100%" alt="Order detail" src="./docs/screenshots/11-order-detail.png" />
    </td>
    <td width="50%" valign="top">
      <strong>Categories</strong><br />
      <img width="100%" alt="Categories" src="./docs/screenshots/12-categories.png" />
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <strong>Category detail</strong><br />
      <img width="100%" alt="Category detail" src="./docs/screenshots/13-category-detail.png" />
    </td>
    <td width="50%" valign="top">
      <strong>Universities</strong><br />
      <img width="100%" alt="Universities" src="./docs/screenshots/14-universities.png" />
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <strong>Staff</strong><br />
      <img width="100%" alt="Staff" src="./docs/screenshots/15-staff.png" />
    </td>
    <td width="50%" valign="top">
      <strong>Settings</strong><br />
      <img width="100%" alt="Settings" src="./docs/screenshots/16-settings.png" />
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <strong>Arabic home</strong><br />
      <img width="100%" alt="Arabic home" src="./docs/screenshots/17-home-arabic.png" />
    </td>
    <td width="50%" valign="top">
      <strong>Mobile home</strong><br />
      <img width="100%" alt="Mobile home" src="./docs/screenshots/18-mobile-home.png" />
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <strong>Mobile track</strong><br />
      <img width="100%" alt="Mobile track" src="./docs/screenshots/19-mobile-track.png" />
    </td>
    <td width="50%" valign="top"></td>
  </tr>
</table>

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
