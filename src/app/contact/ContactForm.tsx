'use client';

import { useState, FormEvent, useEffect } from 'react';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(''); // To show success/error messages
  const [isLoading, setIsLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  
  // Track field validity and touched state
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    subject: false,
    message: false
  });

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (status && showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status, showNotification]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(''); // Clear previous status
    setShowNotification(false);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus(data.message || 'Your message has been sent. Check your inbox for a confirmation email.');
        // Clear form
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
        // Reset touched state
        setTouched({
          name: false,
          email: false,
          subject: false,
          message: false
        });
      } else {
        setStatus(`Error: ${data.message || 'Failed to send message.'}`);
      }
      setShowNotification(true);
    } catch (error) {
      console.error('Contact form submission error:', error);
      setStatus('Error: An unexpected error occurred.');
      setShowNotification(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark field as touched on blur
  const handleBlur = (field: 'name' | 'email' | 'subject' | 'message') => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Get input class based on validation state
  const getInputClass = (field: 'name' | 'email' | 'subject' | 'message', value: string) => {
    const baseClass = "block w-full px-4 py-3 rounded-md shadow-sm border focus:outline-none focus:ring-2 transition-all duration-200 dark:bg-gray-800 dark:text-white";
    if (!touched[field]) {
      return `${baseClass} border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500/50 dark:focus:border-indigo-400`;
    }
    return value.trim() !== '' 
      ? `${baseClass} border-green-500 focus:border-green-500 focus:ring-green-500/50 bg-green-50 dark:bg-green-900/10 dark:border-green-500/70`
      : `${baseClass} border-red-300 focus:border-red-500 focus:ring-red-500/50 dark:border-red-500/70`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8 font-sans">
      {showNotification && status && (
        <div 
          className={`mb-6 p-4 rounded-lg ${
            status.startsWith('Error') 
              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30' 
              : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30'
          }`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              {status.startsWith('Error') ? (
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                status.startsWith('Error') 
                  ? 'text-red-800 dark:text-red-200' 
                  : 'text-green-800 dark:text-green-200'
              }`}>
                {status}
              </p>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Get in Touch</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
        Have questions about Beyond Measure? We'd love to hear from you!
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Name
            {touched.name && name.trim() === '' && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
          <div className="relative">
            <input
              type="text"
              name="name"
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => handleBlur('name')}
              className={getInputClass('name', name)}
              placeholder="Your Name"
            />
            {touched.name && name.trim() !== '' && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
            {touched.email && email.trim() === '' && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              className={getInputClass('email', email)}
              placeholder="you@example.com"
            />
            {touched.email && email.trim() !== '' && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Subject
            {touched.subject && subject.trim() === '' && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
          <div className="relative">
            <input
              type="text"
              name="subject"
              id="subject"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              onBlur={() => handleBlur('subject')}
              className={getInputClass('subject', subject)}
              placeholder="Reason for contacting us"
            />
            {touched.subject && subject.trim() !== '' && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Message
            {touched.message && message.trim() === '' && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
          <div className="relative">
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onBlur={() => handleBlur('message')}
              className={getInputClass('message', message)}
              placeholder="Your message here..."
            ></textarea>
            {touched.message && message.trim() !== '' && (
              <div className="absolute top-3 right-0 flex items-start pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-6 border border-transparent rounded-lg shadow-md text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 dark:ring-offset-gray-900 transition-all duration-200 transform hover:-translate-y-0.5"
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Sending...</span>
              </div>
            ) : (
              <span>Send Message</span>
            )}
          </button>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Contact Information</h3>
          <div className="space-y-3">
            <p className="flex items-center text-gray-600 dark:text-gray-300">
              <svg className="h-6 w-6 mr-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-lg">support@gobeyondmeasure.org</span>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
} 