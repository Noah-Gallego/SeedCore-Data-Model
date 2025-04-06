# Beyond Measure

Beyond Measure is a platform connecting teachers with donors to fund educational projects that go beyond standard classroom resources. This application allows teachers to create and manage funding projects, and donors to discover and support these initiatives.

## Features

- **User Authentication**: Secure login for teachers, donors, and administrators
- **Teacher Dashboard**: Create, edit, and manage educational funding projects
- **Project Listings**: Browse available projects with filtering options
- **Donation System**: Support projects with monetary contributions
- **Admin Panel**: Verify teachers and approve projects

## Technology Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Supabase (PostgreSQL + Authentication)
- **Deployment**: Vercel

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env.local`
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) to view the application

## Project Structure

- `/src/app/*` - Next.js application routes
- `/src/components/*` - Reusable React components
- `/src/utils/*` - Utility functions including Supabase client

## Deployment

This project is deployed on Vercel. Any push to the main branch triggers an automatic deployment.

## License

[MIT](LICENSE)
