This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB database (local or cloud)

### Environment Setup

1. **Create a `.env.local` file** in the root directory:

```bash
cp .env.local.example .env.local
```

2. **Configure your environment variables** in `.env.local`:

The most important variable is `MONGO_URI`. Update it with your MongoDB connection string:

```env
MONGO_URI=mongodb://localhost:27017/too-bikes
# or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/too-bikes
```

For other variables, see `.env.local.example` for reference. Minimum required:
- `MONGO_URI` - MongoDB connection string (required)
- `JWT_ACCESS_SECRET` - Random secret string for JWT tokens
- `JWT_REFRESH_SECRET` - Random secret string for refresh tokens

### Installation

```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

The server will start on [http://localhost:3001](http://localhost:3001)

**Note:** If you see MongoDB connection errors, make sure:
1. MongoDB is running (if using local MongoDB)
2. `MONGO_URI` is correctly set in `.env.local`
3. The connection string is valid

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
