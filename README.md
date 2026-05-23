# Allo Engineering Take-Home Exercise - Inventory & Reservation System

This is a Next.js application built for the Allo Engineering take-home exercise. It implements an inventory management system with a robust reservation mechanism to handle race conditions during checkout.

## Features

- **Product Listing**: View products and their available stock across multiple warehouses.
- **Atomic Reservations**: Hold stock for 10 minutes when a customer proceeds to checkout.
- **Concurrency Handling**: Guarantees that stock cannot be oversold even under heavy concurrent load.
- **Checkout Flow**: Live countdown timer, confirm purchase, and cancel reservation.
- **Automatic Expiry**: Expired reservations are automatically released, making stock available again.
- **Idempotency**: `POST /api/reservations` and `POST /api/reservations/:id/confirm` support idempotent retries.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Prisma)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+ 
- A hosted PostgreSQL database (e.g., Supabase, Neon, or Railway)

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd task1
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@host:port/dbname?schema=public"
   ```

4. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. Seed the database:
   ```bash
   npm run prisma:seed
   ```

6. Run the development server:
   ```bash
   npm run dev
   ```

## Design Decisions & Implementation Details

### Concurrency Handling

To ensure correctness under concurrency, the `POST /api/reservations` endpoint uses a **PostgreSQL Atomic Update**. Instead of a "read-then-write" approach which is prone to race conditions, we use a single `UPDATE` query with a `WHERE` clause that checks for available stock:

```sql
UPDATE "Stock"
SET "reserved" = "reserved" + :quantity
WHERE "productId" = :productId
  AND "warehouseId" = :warehouseId
  AND "total" >= "reserved" + :quantity
```

If the update affects 0 rows, it means there was insufficient stock, and we return a `409 Conflict`. This guarantees that exactly one request will succeed for the last unit of a SKU.

### Reservation Expiry

We use a two-pronged approach for expiry:
1. **Lazy Cleanup**: Every time `GET /api/products` is called, the system automatically checks for and releases any expired `PENDING` reservations. This ensures the UI always shows accurate availability.
2. **Cron Endpoint**: A `POST /api/reservations/cleanup` endpoint is available for integration with Vercel Cron or other background workers to ensure regular cleanup even without user traffic.

### Idempotency (Bonus)

- **Reserve**: The endpoint accepts an `Idempotency-Key` header. If a reservation with that key already exists, the server returns the existing record instead of creating a new one.
- **Confirm**: The endpoint checks the status of the reservation. If it's already `CONFIRMED`, it returns the record immediately without re-decrementing stock.

## Trade-offs & Future Improvements

- **Redis for Locking**: While DB-level atomic updates are highly reliable, for extremely high scale, a distributed lock using Redis (e.g., Redlock) could be used to reduce database load.
- **Optimistic UI**: Currently, the UI waits for the API response. For a better UX, optimistic updates could be implemented in the product listing.
- **Soft Deletes**: Currently, products and warehouses are deleted/created in the seed. In a real system, we would use soft deletes or status fields.
- **Scalability of Cleanup**: Lazy cleanup on every product fetch might become a bottleneck if there are thousands of expired reservations. A dedicated background worker is preferred for production.

## License

MIT
