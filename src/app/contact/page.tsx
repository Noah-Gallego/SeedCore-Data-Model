import type { Metadata } from 'next';

// Export metadata from the server component (this file)
export const metadata: Metadata = {
  title: 'Contact Us | Beyond Measure',
  description: 'Get in touch with Beyond Measure. Send us a message using our contact form.',
};

// Import the client component that handles the form
import ContactForm from './ContactForm';

export default function ContactPage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Thematic banner image - People chatting over coffee */}
      <div className="relative h-48 sm:h-64 lg:h-80 w-full overflow-hidden mb-16 sm:mb-20 rounded-lg shadow-inner">
        <img
          src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80"
          alt="People chatting over coffee"
          className="w-full h-full object-cover object-center rounded-lg filter brightness-75"
        />
      </div>

      <div className="pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold sm:text-5xl mb-12 text-center bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            Contact Us
          </h1>

          {/* Use the client component for the form */}
          <ContactForm />
        </div>
      </div>
    </div>
  );
} 