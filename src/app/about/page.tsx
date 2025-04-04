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
    <div className="bg-white dark:bg-gray-900">
      {/* Thematic banner image */}
      <div className="relative h-48 sm:h-64 lg:h-80 w-full overflow-hidden mb-16 sm:mb-20 rounded-lg shadow-inner">
        <img 
          src="https://images.unsplash.com/photo-1492496913980-501348b61469?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80" 
          alt="Hands holding a small growing plant" 
          className="w-full h-full object-cover object-center rounded-lg filter brightness-75"
        />
      </div>

      <div className="pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold sm:text-5xl mb-12 text-center bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            About Us
          </h1>

          <div className="space-y-16">
            <section>
              <h2 className="text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-5">
                Our Mission
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                Bless teachers at Christian schools with the resources they need to provide enriching classrooms for student learning.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-5">
                Our Vision
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                We envision a future in which private Christian schools thrive with abundant resources that enable educators to focus on inspiring students and nurturing future leaders.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-5">
                Our Story
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-10">
                Since deciding to send their kids to a private school, John-Paul & Ingrid Lake have seen the needs of the schools they have attended from several different perspectives. Getting to know the teachers at the schools quickly showed them that most teachers who work in private schools do so as a form of ministry. In getting to know the administrators, they saw that while operating in modest facilities and managing a staff that earns less than their public school counterparts, there was always a desire to provide the best education. As with any ministry, there is sacrifice involved as well as a need for a good base of support, so they had an idea to provide an online platform that would help alleviate the sacrifice, increase support, and augment the private school experience.
              </p>

              <div className="mt-12 text-center">
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-8">
                  Our Founders
                </h3>
                <div className="flex flex-col sm:flex-row justify-center items-center sm:space-x-24 md:space-x-36 lg:space-x-48 space-y-8 sm:space-y-0" style={{WebkitJustifyContent: 'space-evenly', justifyContent: 'space-evenly', WebkitBoxPack: 'justify'}}>
                  <div className="text-center" style={{WebkitBoxFlex: '0', WebkitFlex: '0 1 auto', flex: '0 1 auto'}}>
                    <div className="relative w-32 h-32 mx-auto mb-3">
                      <img 
                        src="https://images.squarespace-cdn.com/content/v1/5cc89378c2ff6148357ca547/fa1bdb2d-aff6-4bc8-9e0f-e09319fbdad6/_DSC1201.jpg" 
                        alt="John-Paul Lake Headshot" 
                        className="w-full h-full object-cover rounded-full shadow-lg border-2 border-white dark:border-gray-700 filter brightness-75"
                      />
                    </div>
                    <p className="text-md font-medium text-gray-700 dark:text-gray-300">John-Paul Lake</p>
                  </div>
                  <div className="text-center" style={{WebkitBoxFlex: '0', WebkitFlex: '0 1 auto', flex: '0 1 auto'}}>
                    <div className="relative w-32 h-32 mx-auto mb-3">
                      <img 
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTS6Wj8NNrzyoMmkS-xHwxFkn58ApQfGNHiBQ&s" 
                        alt="Ingrid Lake Headshot" 
                        className="w-full h-full object-cover rounded-full shadow-lg border-2 border-white dark:border-gray-700 filter brightness-75"
                      />
                    </div>
                    <p className="text-md font-medium text-gray-700 dark:text-gray-300">Ingrid Lake</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 