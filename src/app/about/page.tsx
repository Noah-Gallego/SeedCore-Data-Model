import type { Metadata } from 'next';
// Note: Using standard <img> tags for external URLs.
// Consider using next/image and configuring remotePatterns if needed:
// https://nextjs.org/docs/pages/api-reference/components/image#remotepatterns

export const metadata: Metadata = {
  title: 'About Us | Beyond Measure',
  description: 'Learn about the mission, vision, and story behind Beyond Measure.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">About Beyond Measure</h1>
      
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Beyond Measure exists to support teachers in private Christian schools by connecting them with donors who share their passion for quality education. We believe that every teacher should have the resources they need to create exceptional learning experiences for their students.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">Our Story</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Beyond Measure was founded in 2022 by a group of educators and philanthropists who recognized the unique funding challenges faced by private Christian schools. We observed that while these schools offer incredible educational experiences, they often lack the financial resources available to public institutions.
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            What started as a small initiative to help a few local schools has grown into a platform that connects teachers and donors across the country, channeling resources directly to classrooms where they can make the biggest impact.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Faith-Based Education</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                We believe in the importance of education that incorporates faith and values.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Transparency</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                We're committed to being open about how funds are used and the impact they create.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Direct Impact</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                100% of donations go directly to classroom projects, with no platform fees.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Community</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                We foster connections between donors, teachers, and students to create a supportive community.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Our Team</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Beyond Measure is powered by a dedicated team of professionals with backgrounds in education, technology, and nonprofit management. We're united by our commitment to supporting Christian educators and enhancing the learning experience for students.
          </p>
          
          <div className="flex justify-center mt-8">
            <a 
              href="/contact" 
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 