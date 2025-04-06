# Beyond Measure

Beyond Measure is a faith-based crowdfunding platform connecting private Christian school teachers with passionate donors to fund educational projects. Our mission is to empower teachers to enhance classroom learning beyond standard resources, creating lasting positive impact in students' lives.

**Website:** [https://seed-core-data-model.vercel.app/](https://seed-core-data-model.vercel.app/)

## Our Mission

At Beyond Measure, we believe that every student deserves access to enriching educational experiences. We provide a space where:

- Teachers can easily share their classroom needs and vision
- Donors can support projects aligned with their values and interests
- 100% of donations go directly to teachers with no platform fees
- Christian education thrives through community support

As reflected in our name, inspired by Psalm 147:5 - *"Great is our lord, and abundant in power; his understanding is beyond measure"*, we strive to facilitate educational opportunities that go beyond conventional limits.

## Platform Features

- **User Authentication**: Secure login for teachers, donors, and administrators
- **Teacher Dashboard**: Create, edit, and manage educational funding projects
- **Project Listings**: Browse available projects with filtering by subject areas
- **Donation System**: Support projects with monetary contributions
- **Admin Panel**: Verify teachers and approve projects

## Technology Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Supabase (PostgreSQL + Authentication)
- **Deployment**: Vercel

## Getting Started (Development)

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
