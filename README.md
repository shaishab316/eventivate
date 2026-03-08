<div align="center">

<img width="1469" height="846" alt="image" src="https://github.com/user-attachments/assets/28a2a7a4-8dfe-4ba7-a14a-0925776bcb59" />

**Comprehensive Event Management Platform**

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io)

*From booking request to payout — fully automated.*

</div>

---

## Overview

**Eventivate** is a production-grade event management platform that connects artists, agents, venues, and organizers in one unified system. It handles the full event lifecycle — booking negotiations, ticket sales, real-time messaging, and automated Stripe payouts — across four distinct user roles.

---

## Architecture

```
src/
├── modules/<feature>/
│   ├── <feature>.validation.ts     # Zod input schemas
│   ├── <feature>.interface.ts      # TypeScript types
│   ├── <feature>.service.ts        # Business logic & DB queries
│   ├── <feature>.controller.ts     # catchAsync request handlers
│   └── <feature>.route.ts          # Express router + middleware chain
│
├── middlewares/
│   ├── auth.middleware.ts           # JWT verification + RBAC
│   ├── capture.ts                   # Multer file upload handler
│   └── purifyRequest.ts            # Input sanitization
│
├── jobs/
│   ├── email.queue.ts               # OTP and password reset emails
│   ├── fileDelete.queue.ts          # Async media cleanup
│   ├── stripeConnect.queue.ts       # Stripe Connect onboarding
│   ├── withdrawal.queue.ts          # Payout processing
│   └── ticketExpiry.queue.ts        # Unpaid reservation cleanup
│
└── utils/
    ├── catchAsync.ts
    ├── ServerError.ts
    └── redis.client.ts
```

> Every module follows a strict 5-layer pattern: `validation → interface → service → controller → route`

---

## Features

**Core**
- 👥 Multi-role system — Artist, Agent, Venue, Organizer with scoped permissions
- 🎭 Full event lifecycle — `Draft → Published → Completed → Timeout`
- 💼 Offer-based booking system with date conflict detection
- 💳 Stripe Checkout + Stripe Connect with automated commission splits
- 🎟️ Concurrency-safe ticket reservation with 5-minute hold and QR code generation
- 💬 Real-time private messaging via Socket.IO
- 📊 Per-role analytics dashboards — revenue, bookings, and monthly trends

**Technical**
- ⚡ Bull queue for async jobs — emails, payouts, file cleanup, ticket expiry
- 🔒 JWT access + refresh token rotation
- 🛡️ Zod validation on all inputs
- 🔐 bcrypt password hashing + OTP account verification
- 🐳 Fully containerized with Docker Compose
- 🚀 GitHub Actions CI/CD pipeline

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js 20+, TypeScript (strict) |
| **Framework** | Express.js |
| **Database** | PostgreSQL + Prisma ORM |
| **Cache** | Redis |
| **Real-time** | Socket.IO |
| **Queue** | Bull |
| **Payments** | Stripe Checkout, Stripe Connect |
| **Validation** | Zod |
| **Auth** | JWT (access + refresh rotation), bcrypt |
| **Containerization** | Docker + Docker Compose |
| **CI/CD** | GitHub Actions |

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/shaishab316/eventivate.git
cd eventivate

# Install dependencies
npm install

# Configure environment
npm run seed-env

# Run migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Docker

```bash
docker-compose up --build
```

Services: API `3000`, PostgreSQL `5432`, Redis `6379`.

---

## Author

**Shaishab Chandra Shil**  
Self-taught Backend Developer · Dhaka, Bangladesh

[![GitHub](https://img.shields.io/badge/GitHub-shaishab316-181717?style=flat-square&logo=github)](https://github.com/shaishab316)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-shaishab316-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/shaishab316)

---

<div align="center">

*Built with persistence, raw documentation, and zero tutorials.* 🔥

</div>
