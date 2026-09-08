# CineFlow Monolithic Server

CineFlow backend converted into a clean modular monolith architecture.

## Architecture

- **Runtime**: Node.js (ES Modules), Express.js
- **Database**: Single PostgreSQL database managed with Sequelize ORM
- **Cache & Rate Limiting**: Redis (ioredis)
- **Payments**: Razorpay Gateway Integration
- **Notifications**: Email (Nodemailer) & SMS (Mock/Twilio ready)
- **Analytics**: Kafka Producer/Consumer (optional graceful degradation)

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   ├── db.js                 # Shared Sequelize database connection
│   │   ├── redis.js              # Shared Redis client
│   │   ├── kafka.js              # Kafka client factory
│   │   └── env.js                # Environment variable validation
│   ├── modules/
│   │   ├── auth/                 # Authentication (Register, Login, Me) & User model
│   │   ├── movies/               # Movie catalog & Redis cache
│   │   ├── theatres/             # Theatre & City management
│   │   ├── shows/                # Shows & Seat allocation
│   │   ├── bookings/             # Booking engine & Redis seat locking
│   │   ├── payments/             # Razorpay order creation & signature verification
│   │   ├── notifications/        # Email/SMS notifications & orchestrator
│   │   └── analytics/            # Kafka-based analytics events & tracking
│   ├── middleware/
│   │   ├── auth.middleware.js       # JWT validation
│   │   ├── rate-limit.middleware.js # Redis-based IP rate limiter
│   │   └── error.middleware.js      # Global error handler
│   ├── utils/
│   │   ├── errors.js             # Typed AppError classes
│   │   ├── response.js           # Standardized JSON response utilities
│   │   └── pdf.js                # PDF ticket generation helpers
│   ├── app.js                    # Express app configuration & route mounting
│   └── index.js                  # Database sync & server startup
├── .env                          # Local environment variables
├── .env.example                  # Example template
├── Dockerfile                    # Container configuration
└── package.json                  # Dependencies & scripts
```

## Getting Started

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in your connection strings:
```bash
cp .env.example .env
```

### 3. Run Locally
```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

### 4. Docker Build & Run
```bash
# Build image
docker build -t cineflow-server .

# Run container
docker run -p 3000:3000 --env-file .env cineflow-server
```

## API Endpoints

- `GET /health` - Health check & active module list
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (JWT)
- `GET /api/auth/me` - Authenticated user profile
- `GET /api/movies` - List movies (filters: genre, language, city, status)
- `GET /api/movies/:id` - Movie details
- `GET /api/theatres` - List theatres
- `GET /api/theatres/cities` - List cities
- `GET /api/shows/:id` - Show details and seat status
- `POST /api/bookings` - Create booking (atomic Redis seat lock)
- `GET /api/bookings/me` - User bookings
- `GET /api/bookings/:id/pdf` - Download PDF ticket
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment & confirm booking
