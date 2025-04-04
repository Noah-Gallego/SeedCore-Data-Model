'use client';

import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import CheckDatabase from '../components/CheckDatabase';

// Dynamic import to avoid SSR issues
const ProjectsList = dynamic(() => import('../components/ProjectsList'), { ssr: false });

export default function Home() {
  return (
    <div className="space-y-12 py-8">
      {/* Database Status (hidden in production) */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <CheckDatabase />
      </div>
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
          <svg className="h-full w-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="relative px-6 py-16 sm:py-24 sm:px-12 flex flex-col items-center text-center">
          <div className="text-amber-300 font-medium mb-4 bg-blue-800 bg-opacity-40 py-2 px-6 rounded-full text-sm flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            ANNOUNCING A NEW MATCH CAMPAIGN FOR MONTANA-BASED TEACHERS
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            Give without bounds. <span className="block">Give with purpose.</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto mb-10">
            A crowdsourcing platform where passionate donors support private school teachers and students, creating a ripple effect of positive change.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/projects" 
              className="btn btn-lg bg-white text-blue-700 hover:bg-blue-50 transition shadow-md rounded-full flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              SEE ALL PROJECTS
            </Link>
            <Link 
              href="/auth" 
              className="btn btn-lg !text-white bg-blue-800 bg-opacity-40 hover:bg-opacity-60 transition border border-white border-opacity-30 rounded-full flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              CREATE ACCOUNT
            </Link>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-800 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
          <div className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">SUPPORT PROJECTS CLOSE TO YOUR HEART</div>
          <div className="text-gray-600 dark:text-gray-400">Explore projects aligned with your interests and subjects that inspire you.</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-800 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
          </div>
          <div className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">CREATE A PROJECT YOUR CLASSROOM DESERVES</div>
          <div className="text-gray-600 dark:text-gray-400">Teachers can easily share their classroom needs and connect with passionate donors.</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-800 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">FUNDS GO ENTIRELY TO TEACHERS WITHOUT FEES</div>
          <div className="text-gray-600 dark:text-gray-400">100% of your donation directly impacts ministry-led teachers and students.</div>
        </div>
      </section>

      {/* Subject Categories */}
      <section className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <h2 className="text-2xl md:text-3xl font-bold text-center">Explore Projects By Subject</h2>
          <p className="text-center text-blue-100 mt-2 max-w-2xl mx-auto">Find educational initiatives that align with your passion and interests</p>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: "Family Enrichment", emoji: "👪" },
              { name: "Foreign Language", emoji: "🌎" },
              { name: "History & Geography", emoji: "🗿" },
              { name: "Information Technology", emoji: "💻" },
              { name: "Language Arts", emoji: "📚" },
              { name: "Community Service", emoji: "🤝" },
              { name: "Math", emoji: "🔢" },
              { name: "Physical Education", emoji: "🏅" },
              { name: "Religious Education", emoji: "✝️" },
              { name: "Science", emoji: "🔬" },
              { name: "Art & Music", emoji: "🎨" },
              { name: "College Prep", emoji: "🎓" },
            ].map((subject, index) => (
              <Link
                key={index}
                href={`/projects?subject=${encodeURIComponent(subject.name)}`}
                className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:shadow-md hover:-translate-y-1"
              >
                <div className="flex justify-center items-center mb-3 text-6xl sm:text-7xl">
                  {subject.emoji}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">{subject.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-850 rounded-xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white text-center sm:text-left">Featured Projects to Support</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl text-center sm:text-left">
              Give with purpose: support projects and subjects that share your values, making a lasting impact for children.
            </p>
          </div>
          <Link 
            href="/projects" 
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center group bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm"
          >
            View All
            <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
        <ProjectsList />
      </section>

      {/* How It Works Section */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-950 dark:from-gray-900 dark:to-gray-950 text-white rounded-xl overflow-hidden border border-gray-700 dark:border-gray-800 shadow-md relative">
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="smallGridHow" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
              <pattern id="gridHow" width="100" height="100" patternUnits="userSpaceOnUse">
                <rect width="100" height="100" fill="url(#smallGridHow)" />
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gridHow)" />
          </svg>
        </div>
        <div className="relative">
          <div className="absolute top-0 right-0 w-2/5 h-full hidden lg:block">
            <div className="h-full w-full relative">
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: 'url(/teacher-classroom.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.6
              }} />
            </div>
          </div>
          <div className="p-8 py-16 relative z-10 lg:w-3/5">
            <div className="max-w-3xl">
              <div className="inline-block bg-blue-600 px-4 py-1 rounded-full text-sm font-medium mb-4">FOR EDUCATORS</div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">CALLING ALL PRIVATE SCHOOL</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-blue-400 mb-4">Teachers!</h3>
              <p className="text-gray-300 mt-4 mb-12 text-lg">
                Teach without limits and connect to a thriving community of donors that are eager to fund your classroom projects.
              </p>
            
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md transform transition-transform hover:scale-105">
                    <svg className="h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-white text-center">CONNECT WITH DONORS</h3>
                  <p className="text-gray-300 text-sm">
                    Build relationships with donors who share your passion for quality education.
                  </p>
                </div>
                
                <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md transform transition-transform hover:scale-105">
                    <svg className="h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-white text-center">CREATE IN MINUTES</h3>
                  <p className="text-gray-300 text-sm">
                    Our easy-to-use platform makes it simple to share your classroom vision.
                  </p>
                </div>
                
                <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md transform transition-transform hover:scale-105">
                    <svg className="h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-white text-center">100% TO TEACHERS</h3>
                  <p className="text-gray-300 text-sm">
                    Every dollar goes straight to your classroom with no platform fees.
                  </p>
                </div>
              </div>
              
              <div className="mt-10">
                <Link 
                  href="/auth" 
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm !text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  CREATE YOUR ACCOUNT IN MINUTES
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative h-64 md:h-auto">
            <div style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              minHeight: '320px',
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: 'url(/faith-based-education.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }} />
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(to right, rgba(37, 99, 235, 0.7), rgba(79, 70, 229, 0.7))',
                mixBlendMode: 'multiply',
              }} />
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div className="text-white text-4xl md:text-5xl font-bold p-6 text-center">
                  Beyond<br/>MEASURE
                </div>
              </div>
            </div>
          </div>
          <div className="p-8 md:p-12">
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="ml-3 text-gray-700 dark:text-gray-300">
                  Welcome to Beyond Measure, where we're rewriting the narrative for private Christian education, one classroom at a time.
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="ml-3 text-gray-700 dark:text-gray-300">
                  As a donor or teacher, you play a crucial role in shaping the future of faith-based learning.
                </p>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <p className="ml-3 text-gray-700 dark:text-gray-300">
                  Join our community, where compassion meets action, and together, let's build a brighter future for Christian education.
                </p>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
              <p className="text-gray-700 dark:text-gray-300 italic">
                "Great is our lord, and abundant in power; his understanding is beyond measure."
              </p>
              <p className="text-right text-gray-500 dark:text-gray-400 mt-2">Psalm 147:5</p>
            </div>
            
            <div className="mt-8">
              <Link 
                href="/about" 
                className="inline-flex items-center font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-white dark:bg-gray-800 px-5 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
              >
                READ MORE ABOUT US
                <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="smallGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
              <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                <rect width="100" height="100" fill="url(#smallGrid)" />
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="relative px-6 py-12 sm:py-16 text-center text-white">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-white bg-opacity-20 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Join our community of educators and donors who are transforming education one project at a time.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/projects" 
              className="btn btn-lg bg-white text-blue-700 hover:bg-blue-50 transition shadow-md rounded-lg flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Browse Projects
            </Link>
            <Link 
              href="/auth" 
              className="btn btn-lg bg-blue-800 bg-opacity-40 hover:bg-opacity-60 !text-white transition border border-white border-opacity-30 rounded-lg flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
