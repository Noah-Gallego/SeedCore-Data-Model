'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMatchError, setPasswordMatchError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState('donor');
  
  // Teacher-specific fields
  const [schoolName, setSchoolName] = useState('');
  const [schoolAddress, setSchoolAddress] = useState('');
  const [schoolCity, setSchoolCity] = useState('');
  const [schoolState, setSchoolState] = useState('');
  const [schoolPostalCode, setSchoolPostalCode] = useState('');
  const [positionTitle, setPositionTitle] = useState('');

  const [passwordStrength, setPasswordStrength] = useState(0);
  
  // Check if passwords match and update error state
  const checkPasswordsMatch = (pass: string, confirmPass: string) => {
    if (confirmPass && pass !== confirmPass) {
      setPasswordMatchError('Passwords do not match');
    } else {
      setPasswordMatchError('');
    }
  };
  
  // Password strength checker
  const checkPasswordStrength = (pass: string) => {
    let score = 0;
    
    // If password is empty, return 0
    if (!pass) {
      setPasswordStrength(0);
      return;
    }
    
    // Length check
    if (pass.length >= 8) score += 1;
    if (pass.length >= 12) score += 1;
    
    // Complexity checks
    if (/[A-Z]/.test(pass)) score += 1; // Has uppercase
    if (/[a-z]/.test(pass)) score += 1; // Has lowercase
    if (/[0-9]/.test(pass)) score += 1; // Has number
    if (/[^A-Za-z0-9]/.test(pass)) score += 1; // Has special char
    
    // Normalize to 0-100
    const normalizedScore = Math.min(Math.floor((score / 6) * 100), 100);
    setPasswordStrength(normalizedScore);
  };
  
  // Update the password onChange handler to validate in real-time
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordStrength(newPassword);
    if (confirmPassword) {
      checkPasswordsMatch(newPassword, confirmPassword);
    }
  };
  
  // Update the confirmPassword onChange handler to validate in real-time
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    checkPasswordsMatch(password, newConfirmPassword);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password match
    if (password !== confirmPassword) {
      setPasswordMatchError('Passwords do not match');
      return;
    }
    
    // Clear any previous error
    setPasswordMatchError('');
    
    // Validate teacher-specific fields if user is signing up as a teacher
    if (role === 'teacher') {
      if (!schoolName || !schoolAddress || !schoolCity || !schoolState || !schoolPostalCode || !positionTitle) {
        alert('Please complete all required school information.');
        return;
      }
    }
    
    try {
      setLoading(true);
      console.log('Starting sign-up process');
      
      // Sign up the user with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: role
          }
        }
      });

      console.log('Auth response:', authData);
      console.log('Selected role:', role);
      
      if (signUpError) {
        console.error('Sign-up error:', signUpError);
        throw signUpError;
      }

      if (!authData.user) {
        console.log('Auth data returned but no user object');
        throw new Error('Something went wrong during signup. Please try again.');
      }
      
      console.log('Auth user created successfully:', authData.user.id);
      
      // Try using the API route which will handle both user and profile creation
      try {
        console.log('Calling API route with role:', role);
        
        const userData = {
          authId: authData.user.id,
          email,
          firstName,
          lastName,
          role,
        };
        
        // Add teacher-specific fields if role is teacher
        if (role === 'teacher') {
          Object.assign(userData, {
            schoolName,
            schoolAddress,
            schoolCity,
            schoolState,
            schoolPostalCode,
            positionTitle
          });
        }
        
        const response = await fetch('/api/auth/create-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          console.error('API error:', result.error);
          throw new Error(result.error);
        }
        
        console.log('User profile created:', result.user);
        alert('Account created successfully! Please check your email to confirm your account.');
      } catch (apiError: any) {
        console.error('API call exception:', apiError);
        alert(`Error creating profile: ${apiError.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Caught error:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Add the toggle password functions
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Get color and label for password strength
  const getPasswordStrengthInfo = () => {
    if (passwordStrength === 0) return { color: 'bg-gray-200', label: '' };
    if (passwordStrength < 33) return { color: 'bg-red-500', label: 'Weak' };
    if (passwordStrength < 67) return { color: 'bg-yellow-500', label: 'Medium' };
    return { color: 'bg-green-500', label: 'Strong' };
  };

  return (
    <div className="bg-white dark:bg-gray-900 shadow-xl rounded-xl border border-gray-200 dark:border-gray-800 p-8 w-full max-w-md mx-auto overflow-hidden">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          {isSignUp ? 'Create account' : 'Welcome back'}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {isSignUp ? 'Join our community to support education' : 'Sign in to your account'}
        </p>
      </div>
      
      <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-5">
        {isSignUp && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="block w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Jane"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="block w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                <div 
                  className={`flex items-center justify-center p-3 rounded-lg cursor-pointer border transition-colors ${
                    role === 'donor' 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' 
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => setRole('donor')}
                >
                  <div className="text-center">
                    <svg className={`h-6 w-6 mx-auto mb-1 ${role === 'donor' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className={`text-sm font-medium ${role === 'donor' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                      Donor
                    </span>
                  </div>
                </div>
                <div 
                  className={`flex items-center justify-center p-3 rounded-lg cursor-pointer border transition-colors ${
                    role === 'teacher' 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' 
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => setRole('teacher')}
                >
                  <div className="text-center">
                    <svg className={`h-6 w-6 mx-auto mb-1 ${role === 'teacher' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className={`text-sm font-medium ${role === 'teacher' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                      Teacher
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Teacher-specific fields */}
            {role === 'teacher' && (
              <div className="mt-6 space-y-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">School Information</h3>
                
                <div className="space-y-2">
                  <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">School Name</label>
                  <input
                    id="schoolName"
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="block w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Lincoln High School"
                    required={role === 'teacher'}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="schoolAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">School Address</label>
                  <input
                    id="schoolAddress"
                    type="text"
                    value={schoolAddress}
                    onChange={(e) => setSchoolAddress(e.target.value)}
                    className="block w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="123 Education St"
                    required={role === 'teacher'}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="schoolCity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                    <input
                      id="schoolCity"
                      type="text"
                      value={schoolCity}
                      onChange={(e) => setSchoolCity(e.target.value)}
                      className="block w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Anytown"
                      required={role === 'teacher'}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="schoolState" className="block text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
                    <input
                      id="schoolState"
                      type="text"
                      value={schoolState}
                      onChange={(e) => setSchoolState(e.target.value)}
                      className="block w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="CA"
                      required={role === 'teacher'}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="schoolPostalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Postal Code</label>
                  <input
                    id="schoolPostalCode"
                    type="text"
                    value={schoolPostalCode}
                    onChange={(e) => setSchoolPostalCode(e.target.value)}
                    className="block w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="12345"
                    required={role === 'teacher'}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="positionTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Position/Title</label>
                  <input
                    id="positionTitle"
                    type="text"
                    value={positionTitle}
                    onChange={(e) => setPositionTitle(e.target.value)}
                    className="block w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="5th Grade Teacher"
                    required={role === 'teacher'}
                  />
                </div>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Note: Teacher accounts require verification before you can create projects.
                </p>
              </div>
            )}
          </>
        )}
        
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="your@email.com"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={handlePasswordChange}
              className="block w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
          
          {isSignUp && password && (
            <>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div 
                  className={`h-1.5 rounded-full ${getPasswordStrengthInfo().color}`} 
                  style={{ width: `${passwordStrength}%` }}
                ></div>
              </div>
              {getPasswordStrengthInfo().label && (
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Password strength: <span className={`font-medium ${
                    passwordStrength < 33 ? 'text-red-600' : 
                    passwordStrength < 67 ? 'text-yellow-600' : 
                    'text-green-600'
                  }`}>{getPasswordStrengthInfo().label}</span>
                </p>
              )}
              <ul className="text-xs text-gray-600 dark:text-gray-400 mt-1 space-y-1 list-disc list-inside">
                <li className={password.length >= 8 ? "text-green-600" : "text-gray-500"}>
                  At least 8 characters
                </li>
                <li className={/[A-Z]/.test(password) ? "text-green-600" : "text-gray-500"}>
                  At least one uppercase letter
                </li>
                <li className={/[0-9]/.test(password) ? "text-green-600" : "text-gray-500"}>
                  At least one number
                </li>
                <li className={/[^A-Za-z0-9]/.test(password) ? "text-green-600" : "text-gray-500"}>
                  At least one special character
                </li>
              </ul>
            </>
          )}
        </div>
        
        {isSignUp && (
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className={`block w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border ${passwordMatchError ? 'border-red-500' : confirmPassword && !passwordMatchError ? 'border-green-500' : 'border-gray-200 dark:border-gray-700'} text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 ${passwordMatchError ? 'focus:ring-red-500' : confirmPassword && !passwordMatchError ? 'focus:ring-green-500' : 'focus:ring-blue-500'} focus:border-transparent transition-colors`}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
            {passwordMatchError ? (
              <p className="mt-1 text-sm text-red-600">{passwordMatchError}</p>
            ) : confirmPassword && (
              <p className="mt-1 text-sm text-green-600">Passwords match</p>
            )}
          </div>
        )}
        
        <button
          type="submit"
          className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            loading 
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={loading || (isSignUp && passwordMatchError !== '')}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </div>
          ) : (
            isSignUp ? 'Create Account' : 'Sign In'
          )}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">or</span>
          </div>
        </div>
        
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 focus:outline-none focus:underline transition-colors"
        >
          {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Create one'}
        </button>
      </div>
    </div>
  );
}