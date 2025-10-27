"use client";
import React, { useState, CSSProperties, FormEvent } from 'react';
import { motion, Variants } from 'framer-motion';

// --- Type Definitions ---
interface SignupFormState {
  username: string;
  email: string;
  password: string;
  country: string;
}

interface SignupErrors {
  username?: string;
  email?: string;
  password?: string;
  country?: string;
  general?: string;
}

// --- Main Signup Component (Default Export) ---
const SignupPage: React.FC = () => {
  const [form, setForm] = useState<SignupFormState>({
    username: '',
    email: '',
    password: '',
    country: 'Select',
  });
  const [errors, setErrors] = useState<SignupErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const countries = ['Select', 'Philippines', 'USA', 'Canada', 'UK', 'Australia', 'Other'];

  const validate = (): SignupErrors => {
    const newErrors: SignupErrors = {};
    
    // Username validation: minimum 4 characters
    if (form.username.length < 4) {
      newErrors.username = 'Username must be at least 4 characters.';
    }

    // Email validation: simple format check
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email address is invalid.';
    }

    // Password validation: minimum 8 characters, needs letters and numbers
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(form.password)) {
      newErrors.password = 'Password must be at least 8 characters and include both letters and numbers.';
    }

    // Country validation
    if (form.country === 'Select') {
      newErrors.country = 'Please select your country/region.';
    }
    
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined, general: undefined });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    
    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      setErrors({}); 
      
      // Simulate API call delay
      setTimeout(() => {
        console.log('Signup successful, redirecting to ../dashboard:', form);
        // Navigate to the dashboard route
        window.location.href = '../dashboard'; // Redirects up one level to /dashboard
      }, 1500);
    } else {
        setErrors({...validationErrors, general: 'Please fix the errors below before continuing.'});
        setIsSubmitting(false);
    }
  };

  // --- Styles (Inline styles for non-responsive properties) ---

  const cardStyle: CSSProperties = {
    padding: '40px', 
    backgroundColor: '#121212', 
    borderRadius: '4px', 
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)', 
    color: '#E0E0E0',
    width: '100%',
    height: 'fit-content',
    margin: '20px 0',
  };

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '12px 10px',
    borderRadius: '2px', 
    border: '1px solid #333333', 
    backgroundColor: '#222222', 
    color: '#F0F0F0',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    marginTop: '6px',
  };

  const errorTextStyle: CSSProperties = {
    color: '#FF7777',
    fontSize: '0.75rem',
    marginTop: '4px',
    fontWeight: 'normal',
  };

  const labelStyle: CSSProperties = {
    display: 'block',
    marginTop: '25px', 
    fontSize: '0.75rem', 
    color: '#AAAAAA', 
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  };

  const submitButtonStyle: CSSProperties = {
    width: '100%',
    padding: '14px',
    backgroundColor: isSubmitting ? '#4F46E5' : '#1E90FF',
    color: 'white',
    borderRadius: '4px',
    fontWeight: 'bold',
    fontSize: '1rem',
    border: 'none',
    cursor: isSubmitting ? 'not-allowed' : 'pointer',
    marginTop: '35px',
    transition: 'background-color 0.2s, transform 0.1s, box-shadow 0.2s',
  };

  const googleButtonStyle: CSSProperties = {
    ...inputStyle,
    backgroundColor: '#222222', 
    border: '1px solid #555555', 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '20px',
    padding: '12px 10px',
  };

  const orSeparatorStyle: CSSProperties = {
    textAlign: 'center', 
    color: '#555555', 
    margin: '20px 0', 
    fontSize: '0.8rem',
  };

  const errorVariants: Variants = {
    hidden: { opacity: 0, y: -5 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  const inputFieldVariants: Variants = {
    initial: { opacity: 1 },
    hover: { 
        boxShadow: '0px 2px 10px rgba(30, 144, 255, 0.2)', 
        transition: { duration: 0.2 }
    },
    tap: { scale: 0.99 },
  };

  // --- JSX Rendering ---
  return (
    <div className="main-container">
        {/* Welcome Section - Hidden on Mobile, aligned right on Desktop */}
        <motion.div
            className="welcome-section"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
        >
            <div style={{ padding: '0 40px', maxWidth: '600px', margin: 'auto' }}>
                <h1 style={{ 
                    fontSize: '3rem', 
                    fontWeight: '800', 
                    color: 'white', 
                    marginBottom: '20px',
                    lineHeight: '1.2'
                }}>
                    Start your journey to better ideas.
                </h1>
                <p style={{ 
                    fontSize: '1.2rem', 
                    color: '#AAAAAA',
                    lineHeight: '1.5'
                }}>
                    Join the community and collaborate on innovative projects that spark global change.
                </p>
            </div>
        </motion.div>

        {/* Form Section (The fixed-width column on desktop) */}
        <motion.div
            className="form-section-wrapper"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
        >
            <motion.div
                style={cardStyle}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
            >
                {/* "Already Have an Account?" link section */}
                <div style={{ color: '#AAAAAA', fontSize: '0.8rem', textAlign: 'right', marginBottom: '20px' }}>
                    Already Have an Account? <a href="../login" style={{ color: '#FFFFFF', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'none', marginLeft: '5px' }}>Sign In</a>
                </div>

                <h2 style={{ fontSize: '1.7rem', fontWeight: 'bold', color: 'white', marginBottom: '30px' }}>
                    Create New Account
                </h2>

                {/* Google Button */}
                <motion.button
                    type="button"
                    style={googleButtonStyle}
                    whileHover={{ scale: 1.01, backgroundColor: '#333333', borderColor: '#1E90FF', boxShadow: '0px 4px 10px rgba(0,0,0,0.4)' }}
                    whileTap={{ scale: 0.98 }}
                >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo-google-g-icon.png" alt="Google logo" style={{ width: '18px', height: '18px', marginRight: '10px' }} />
                    Continue with Google
                </motion.button>

                <div style={orSeparatorStyle}>Or</div>

                {/* General Error Message */}
                {errors.general && (
                    <motion.p 
                        variants={errorVariants}
                        initial="hidden"
                        animate="visible"
                        style={{...errorTextStyle, textAlign: 'center', marginBottom: '10px', fontWeight: 'bold', color: '#FF7777' }}
                    >
                        {errors.general}
                    </motion.p>
                )}
                
                <form onSubmit={handleSubmit}>
                    
                    {/* Username */}
                    <label htmlFor="username" style={labelStyle}>Username</label>
                    <motion.div variants={inputFieldVariants} whileHover="hover" whileTap="tap">
                        <input
                            id="username"
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            style={{ ...inputStyle, borderColor: errors.username ? '#FF7777' : '#333333' }}
                            placeholder="Username" 
                        />
                    </motion.div>
                    {errors.username && (
                        <motion.p variants={errorVariants} initial="hidden" animate="visible" style={errorTextStyle}>{errors.username}</motion.p>
                    )}

                    {/* Email */}
                    <label htmlFor="email" style={labelStyle}>E-MAIL</label>
                    <motion.div variants={inputFieldVariants} whileHover="hover" whileTap="tap">
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            style={{ ...inputStyle, borderColor: errors.email ? '#FF7777' : '#333333' }}
                            placeholder="Email" 
                        />
                    </motion.div>
                    {errors.email && (
                        <motion.p variants={errorVariants} initial="hidden" animate="visible" style={errorTextStyle}>{errors.email}</motion.p>
                    )}

                    {/* Password */}
                    <label htmlFor="password" style={labelStyle}>PASSWORD</label>
                    <motion.div variants={inputFieldVariants} whileHover="hover" whileTap="tap">
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            style={{ ...inputStyle, borderColor: errors.password ? '#FF7777' : '#333333' }}
                            placeholder="••••••••"
                        />
                    </motion.div>
                    <p style={{ color: '#6B7280', fontSize: '0.7rem', marginTop: '8px' }}>
                        Password should be at least 8 characters including number and letters.
                    </p>
                    {errors.password && (
                        <motion.p variants={errorVariants} initial="hidden" animate="visible" style={errorTextStyle}>{errors.password}</motion.p>
                    )}
                    
                    {/* Country */}
                    <label htmlFor="country" style={labelStyle}>YOUR COUNTRY/REGION</label>
                    <motion.div variants={inputFieldVariants} whileHover="hover" whileTap="tap">
                        <select
                            id="country"
                            name="country"
                            value={form.country}
                            onChange={handleChange}
                            style={{ 
                                ...inputStyle, 
                                borderColor: errors.country ? '#FF7777' : '#333333',
                                WebkitAppearance: 'none', 
                                MozAppearance: 'none', 
                                appearance: 'none',
                                backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'white\'%3e%3cpath fill-rule=\'evenodd\' d=\'M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z\' clip-rule=\'evenodd\' /%3e%3c/svg%3e")',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 0.75rem center',
                                backgroundSize: '1.5em 1.5em',
                            }}
                        >
                            {countries.map(c => (
                                <option key={c} value={c} disabled={c === 'Select'}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </motion.div>
                    {errors.country && (
                        <motion.p variants={errorVariants} initial="hidden" animate="visible" style={errorTextStyle}>{errors.country}</motion.p>
                    )}


                    <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        style={submitButtonStyle}
                        whileHover={{ 
                            scale: isSubmitting ? 1 : 1.005, 
                            backgroundColor: isSubmitting ? '#4F46E5' : '#106CC8',
                            boxShadow: isSubmitting ? 'none' : '0px 5px 15px rgba(30, 144, 255, 0.5)' 
                        }}
                        whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
                    >
                        {isSubmitting ? 'CREATING ACCOUNT...' : 'SIGN UP'}
                    </motion.button>
                </form>
            </motion.div>
        </motion.div>

        {/* Global Styles with Media Query for responsiveness */}
        <style jsx global>{`
            /* Load Inter font */
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
            
            :root {
                --form-width: 450px; /* Fixed width for the form card */
                --desktop-breakpoint: 1024px; /* Standard large desktop breakpoint */
            }

            html, body {
                height: 100%;
                margin: 0;
                padding: 0;
                scroll-behavior: smooth;
            }
            body {
                font-family: 'Inter', Arial, sans-serif;
                background-color: #1E1E1E; 
                color: #E0E0E0; 
                overflow-x: hidden; /* Prevent horizontal scrolling */
            }
            * {
                box-sizing: border-box;
            }

            /* --- Mobile/Default (Single Column) Layout --- */
            .main-container {
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 20px;
                width: 100%;
            }
            
            .welcome-section {
                display: none; /* Hide welcome section on mobile */
            }

            .form-section-wrapper {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100%;
                max-width: var(--form-width); /* Restrict form width on mobile */
            }

            /* --- Desktop (Two Column) Layout --- */
            @media (min-width: var(--desktop-breakpoint)) {
                .main-container {
                    /* Switch to grid layout for two columns */
                    display: grid;
                    grid-template-columns: 1fr var(--form-width); /* 1fr for welcome, fixed width for form */
                    padding: 0;
                }
                
                .welcome-section {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end; /* Align content to the right edge of its column */
                    padding-right: 80px; /* Add internal padding */
                    height: 100vh; /* Ensure it takes full viewport height */
                    background-color: #1E1E1E;
                    border-right: 1px solid #333333; /* Subtle divider */
                }
                
                .form-section-wrapper {
                    /* Center the form card vertically and horizontally within its column */
                    height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 20px 0;
                    overflow-y: hidden; /* Prevent this column from scrolling */
                }

                /* Ensure the form card itself can scroll if its content exceeds the viewport height */
                .form-section-wrapper > div {
                    max-height: 95vh;
                    overflow-y: auto; 
                    /* Custom scrollbar for dark theme (optional but nice touch) */
                    scrollbar-width: thin;
                    scrollbar-color: #333 #121212;
                    -webkit-overflow-scrolling: touch;
                }
                .form-section-wrapper > div::-webkit-scrollbar {
                    width: 8px;
                }
                .form-section-wrapper > div::-webkit-scrollbar-thumb {
                    background-color: #333333;
                    border-radius: 10px;
                }
                .form-section-wrapper > div::-webkit-scrollbar-track {
                    background: #121212;
                }
            }
            
            /* Style for select dropdown options */
            select option[disabled] {
                color: #6B7280; 
            }
            select option {
                background-color: #222222; 
                color: #F0F0F0;
            }
        `}</style>
    </div>
  );
};

export default SignupPage;
