"use client";
import React, { useEffect, useState, CSSProperties } from 'react';
// The problematic type import is removed. We will derive the type internally.
import { motion, useAnimation, Variants } from 'framer-motion';

// --- Type Definitions ---

// 1. Define a type alias for the controls returned by useAnimation()
type ControlsType = ReturnType<typeof useAnimation>;

// Define types for styles passed to the animated text helper
interface AnimatedTextStyle extends CSSProperties {
  fontSize: string;
  fontWeight: string | number;
  lineHeight: number;
  marginBottom: string;
  color: string;
}

// Define the type for the animated text helper's arguments
interface RenderAnimatedTextProps {
  text: string;
  // 2. Using the derived type name
  controls: ControlsType;
  style: AnimatedTextStyle;
}

// --- Navbar Component (Internal) ---
const Navbar: React.FC = () => {
  // Styles are using Tailwind-inspired colors and sizes
  const linkStyle: CSSProperties = {
    color: 'white',
    textDecoration: 'none',
    fontSize: '18px',
    padding: '8px 16px',
    transition: 'color 0.2s',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  };

  const buttonStyle: CSSProperties = {
    backgroundColor: '#8B5CF6', /* Tailwind: Purlple-500 */
    color: 'white',
    padding: '10px 20px',
    borderRadius: '6px',
    fontWeight: '600',
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  };

  const buttonVariants: Variants = {
    hover: { scale: 1.05, boxShadow: '0px 0px 8px rgba(167, 139, 250, 0.6)' },
    tap: { scale: 0.95 },
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.2 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', fontSize: '24px', fontWeight: 'bold', fontFamily: 'Inter, sans-serif' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ height: '24px', width: '24px', marginRight: '8px' }}>
          <path d="M9 3v2m6-2v2m-6 14v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
        InsightOut
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <motion.a
          href="./login"
          style={{ ...linkStyle, marginRight: '10px' }}
          whileHover={{ color: '#A78BFA' }}
          whileTap={{ scale: 0.95 }}
        >
          Log In
        </motion.a>
        <motion.a
          href=".signup"
          style={buttonStyle}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          SIGN UP
        </motion.a>
      </div>
    </motion.nav>
  );
};

// --- Hero Component (Internal) ---
const Hero: React.FC = () => {
  // 3. Type inference is used here, which is cleaner, but if explicit typing is needed, 
  //    we use ControlsType. Since we use the hook, inference is sufficient and safer.
  const mainControls = useAnimation();
  const subControls = useAnimation();
  const buttonControls = useAnimation();

  const mainText: string = "Artificial  Intelligence  Empower  Innovation.";
  const subText: string = "the community where your insight do global change.";

  // Variants for staggered word animation (typing effect)
  const sentence: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.8,
        staggerChildren: 0.04, // Typing speed control
      },
    },
  };

  const word: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  useEffect(() => {
    // Defines the sequence of animations using the Controls
    const animateSequence = async () => {
      // Start main text animation
      await mainControls.start("visible");
      // Start sub text animation
      await subControls.start("visible");
      // Animate button fade in
      await buttonControls.start({
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 100, damping: 10, delay: 0.5 }
      });
    };
    animateSequence();
  }, [mainControls, subControls, buttonControls]); // Dependencies include the controls

  const buttonVariants: Variants = {
    hover: { scale: 1.05, boxShadow: '0px 0px 15px rgba(109, 40, 217, 0.9)' },
    tap: { scale: 0.95 },
  };

  const buttonStyle: CSSProperties = {
    marginTop: '32px',
    backgroundColor: '#8B5CF6', /* Purple */
    color: 'white',
    fontSize: '20px',
    padding: '16px 40px',
    borderRadius: '50px',
    fontWeight: 'bold',
    border: '3px solid white', /* White border for emphasis */
    cursor: 'pointer',
    textDecoration: 'none',
    fontFamily: 'Inter, sans-serif',
  };


  // Helper function to render animated text, crucial for the word-by-word effect
  const renderAnimatedText = ({ text, controls, style }: RenderAnimatedTextProps) => (
    <motion.div
      variants={sentence}
      initial="hidden"
      animate={controls}
      style={{ ...style, display: 'block', margin: '0 auto' }} // Ensure block behavior
    >
      {text.split(" ").map((wordText: string, index: number) => (
        <motion.span
          key={wordText + index}
          style={{ display: 'inline-block', marginRight: '0.5rem' }}
          variants={word}
        >
          {wordText}
        </motion.span>
      ))}
    </motion.div>
  );

  const mainTitleStyle: AnimatedTextStyle = {
    // Adjusted font size for better visual impact on various screens
    fontSize: 'clamp(3rem, 8vw, 4.5rem)', /* Responsive font size */
    fontWeight: 900,
    lineHeight: 1.1,
    marginBottom: '10px',
    color: 'white',
    fontFamily: 'Inter, sans-serif',
  };

  const subTitleStyle: AnimatedTextStyle = {
    fontSize: 'clamp(1rem, 3vw, 1.25rem)', // Responsive font size
    color: '#9CA3AF', // Gray-400
    marginBottom: '40px',
    maxWidth: '600px',
    fontWeight: 'normal',
    lineHeight: 1.5,
    fontFamily: 'Inter, sans-serif',
  };


  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '120px 20px 40px',
      maxWidth: '900px',
      margin: '0 auto',
      zIndex: 1, // Ensure text is above lines
    }}>

      {/* Main Title - Animated using mainControls */}
      {renderAnimatedText({ text: mainText, controls: mainControls, style: mainTitleStyle })}

      {/* Subtitle - Animated using subControls */}
      {renderAnimatedText({ text: subText, controls: subControls, style: subTitleStyle })}

      {/* Action Button - Animated using buttonControls */}
      <motion.a
        href="./signup"
        style={buttonStyle}
        initial={{ opacity: 0, y: 50 }}
        animate={buttonControls}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        JOIN NOW
      </motion.a>
    </div>
  );
};


// --- Background Animation (Internal) ---
const BackgroundLines: React.FC = () => {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      zIndex: 0, // Behind all content
      opacity: 0.5,
      filter: 'blur(1px)', // Soften the lines
    }}>
      <svg style={{ width: '100%', height: '100%' }} viewBox="0 0 1000 700" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Line 1 */}
        <motion.line
          x1="50" y1="50" x2="950" y2="100" stroke="#3B82F6" strokeWidth="2" strokeDasharray="10 10"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, delay: 0.5, ease: "easeInOut" }}
        />
        {/* Line 2 */}
        <motion.line
          x1="100" y1="650" x2="800" y2="250" stroke="#3B82F6" strokeWidth="2" strokeDasharray="10 10"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, delay: 1, ease: "easeInOut" }}
        />
        {/* Line 3 (Longer line) */}
        <motion.line
          x1="500" y1="50" x2="900" y2="600" stroke="#3B82F6" strokeWidth="2" strokeDasharray="10 10"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, delay: 1.5, ease: "easeInOut" }}
        />
        {/* Connection Points */}
        <motion.circle
            cx="900" cy="50" r="10" fill="#3B82F6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 3.5 }}
        />
        <motion.circle
            cx="100" cy="650" r="10" fill="#3B82F6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 3.8 }}
        />
      </svg>
    </div>
  );
};


// --- Main App Component ---
const App: React.FC = () => {
  return (
    <>
      <div style={{
        backgroundColor: '#000000', /* Solid black background */
        color: 'white',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        fontFamily: 'Inter, sans-serif',
        overflowX: 'hidden', // Prevent horizontal scroll on mobile
      }}>
        {/* Background Animation Layer */}
        <BackgroundLines />

        {/* Navbar Layer (Positioned absolutely) */}
        <Navbar />

        {/* Main Content Layer (Flex-grow centers content) */}
        <main style={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: '60px', /* Offset for navbar */
          width: '100%',
        }}>
          <Hero />
        </main>
      </div>

      {/* Global CSS for responsiveness and font loading */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
        
        html, body, #__next {
          height: 100%;
          margin: 0;
          padding: 0;
          scroll-behavior: smooth;
        }
        * {
          box-sizing: border-box;
          font-family: 'Inter', sans-serif;
        }

        /* Essential Viewport Meta Tag Emulation */
        head title {
            display: none;
        }
        head:before {
            content: "InsightOut - Where ideas connect, innovation begins";
            display: none;
        }
        head:after {
            content: "width=device-width, initial-scale=1.0";
            display: none;
        }
      `}</style>
    </>
  );
}

export default App;
