"use client";
import React, { useState, CSSProperties } from 'react';
import { motion } from 'framer-motion';

// --- MOCK DATA ---
interface RepoConfig {
  name: string;
  description: string;
  visibility: 'private' | 'public';
  insiders: string[];
  accessLevel: 'read' | 'write' | 'admin';
  connectTo: string;
  enable2D: boolean;
  aiAssist2D: boolean;
}

const mockExistingRepos = [
    { id: '1', name: 'Thesis Chapter 1 - Codebase' },
    { id: '2', name: 'AI Capabilities Research' },
    { id: '3', name: 'Platform UI/UX Templates' },
];

// --- ICONS (Inline SVG) ---

const LockIcon = (props: { className?: string; style?: CSSProperties }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={props.className} style={props.style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);
const EyeIcon = (props: { className?: string; style?: CSSProperties }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={props.className} style={props.style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);
const UsersIcon = (props: { className?: string; style?: CSSProperties }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={props.className} style={props.style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 5.74"></path></svg>
);
const LinkIcon = (props: { className?: string; style?: CSSProperties }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={props.className} style={props.style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
);
const GlobeIcon = (props: { className?: string; style?: CSSProperties }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={props.className} style={props.style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
);
const BotIcon = (props: { className?: string; style?: CSSProperties }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={props.className} style={props.style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4"></path><rect x="4" y="8" width="16" height="12" rx="2"></rect><path d="M2 16h20"></path><path d="M10 12h4"></path><path d="M8 20h8"></path></svg>
);

// --- STYLES ---

const style = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#1E1E1E',
        color: '#E0E0E0',
        fontFamily: 'Inter, sans-serif',
        display: 'flex',
        flexDirection: 'column' as 'column',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 40px',
        borderBottom: '1px solid #333333',
        backgroundColor: '#222222',
    },
    titleSection: {
        fontSize: '1.2rem',
        fontWeight: 600,
        color: '#AAAAAA',
    },
    mainContent: {
        maxWidth: '800px',
        width: '100%',
        margin: '60px auto',
        padding: '0 20px',
    },
    heading: {
        fontSize: '2rem',
        fontWeight: 700,
        textAlign: 'center' as 'center',
        marginBottom: '50px',
        color: 'white',
    },
    subHeading: {
        fontSize: '1.4rem',
        fontWeight: 600,
        borderBottom: '1px solid #333333',
        paddingBottom: '10px',
        marginBottom: '30px',
        color: '#AAAAAA',
    },
    formGroup: {
        marginBottom: '30px',
    },
    label: { // Corrected style object
        display: 'flex', 
        alignItems: 'center',
        fontSize: '1rem',
        fontWeight: 500,
        marginBottom: '10px',
        color: '#E0E0E0',
    },
    input: {
        width: '100%',
        padding: '12px 15px',
        borderRadius: '4px',
        border: '1px solid #444444',
        backgroundColor: '#222222',
        color: '#F0F0F0',
        fontSize: '1rem',
        outline: 'none',
        transition: 'border-color 0.2s',
    },
    description: {
        fontSize: '0.85rem',
        color: '#888888',
        marginTop: '5px',
    },
    // Radio/Pill buttons for Visibility
    pillGroup: {
        display: 'flex',
        gap: '20px',
        marginTop: '10px',
    },
    pillButton: (active: boolean): CSSProperties => ({
        padding: '10px 20px',
        borderRadius: '20px',
        border: `1px solid ${active ? '#1E90FF' : '#444444'}`,
        backgroundColor: active ? '#1E90FF33' : '#222222',
        color: active ? '#1E90FF' : '#E0E0E0',
        cursor: 'pointer',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        transition: 'background-color 0.2s, border-color 0.2s',
    }),
    // Action Buttons
    actionContainer: {
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginTop: '60px',
        paddingBottom: '50px',
    },
    submitButton: {
        padding: '12px 30px',
        borderRadius: '6px',
        border: 'none',
        backgroundColor: '#1E90FF',
        color: 'white',
        fontSize: '1rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
        minWidth: '150px',
    },
    cancelButton: {
        padding: '12px 30px',
        borderRadius: '6px',
        border: 'none',
        backgroundColor: '#444444',
        color: '#E0E0E0',
        fontSize: '1rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
        minWidth: '150px',
    },
};

// --- MAIN COMPONENT ---

const CreateRepoPage: React.FC = () => {
  const [config, setConfig] = useState<RepoConfig>({
    name: '',
    description: '',
    visibility: 'private',
    insiders: ['@jdoe', '@team-alpha'], // Mock invited users
    accessLevel: 'write',
    connectTo: '',
    enable2D: true,
    aiAssist2D: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };
  
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const handleCreate = () => {
    if (!config.name) {
      // Custom modal replacement for alert
      console.error("Repository Name is required!");
      return;
    }
    console.log('Creating Repository with configuration:', config);
    // Placeholder for actual creation logic
    // Custom message box replacement for alert
    console.log("Repository created successfully! Redirecting to dashboard...");
    window.location.href = '../dashboard'; 
  };
  
  const handleCancel = () => {
      // Navigate back to the dashboard
      // window.location.href = '/dashboard';
      console.log('Operation cancelled.');
  };

  return (
    <div style={style.container}>
      
      {/* Top Navbar Placeholder */}
      <header style={style.header}>
        <div style={style.titleSection}>New Repository</div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{...style.titleSection, marginRight: '20px'}}>Search here...</div>
            <LockIcon className="icon-sm" style={{ width: '24px', height: '24px', color: '#E0E0E0', cursor: 'pointer' }} />
        </div>
      </header>

      {/* Main Form Content */}
      <motion.div 
        // @ts-ignore
        style={style.mainContent}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 style={style.heading}>Create a new repository</h1>
        
        {/* --- 1. Repository Details --- */}
        <h2 style={style.subHeading}>Configure</h2>
        <div style={style.formGroup}>
          <label htmlFor="name" style={style.label}>Repository name</label>
          <motion.input
            id="name"
            type="text"
            name="name"
            value={config.name}
            onChange={handleChange}
            // @ts-ignore
            style={style.input}
            placeholder="repository-name"
            whileFocus={{ borderColor: '#1E90FF', boxShadow: '0 0 0 1px #1E90FF' }}
          />
        </div>

        <div style={style.formGroup}>
          <label htmlFor="description" style={style.label}>Description</label>
          <motion.textarea
            id="description"
            name="description"
            value={config.description}
            onChange={handleChange}
            // @ts-ignore
            style={{ ...style.input, minHeight: '80px' }}
            placeholder="A short description of the idea, model, or project."
            whileFocus={{ borderColor: '#1E90FF', boxShadow: '0 0 0 1px #1E90FF' }}
          />
        </div>

        {/* --- 2. Visibility --- */}
        <div style={style.formGroup}>
          <label style={style.label}>
             <LockIcon style={{ width: '20px', height: '20px', marginRight: '8px' }} />
             Choose visibility
          </label>
          <div style={style.pillGroup}>
            <motion.div
              // @ts-ignore
              style={style.pillButton(config.visibility === 'private')}
              onClick={() => setConfig({ ...config, visibility: 'private' })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <LockIcon style={{ width: '16px', height: '16px', marginRight: '5px' }} /> Private
            </motion.div>
            <motion.div
              // @ts-ignore
              style={style.pillButton(config.visibility === 'public')}
              onClick={() => setConfig({ ...config, visibility: 'public' })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <EyeIcon style={{ width: '16px', height: '16px', marginRight: '5px' }} /> Public
            </motion.div>
          </div>
          <p style={style.description}>
            Public repos are accessible by everyone. Private repos require explicit user access.
          </p>
        </div>

        {/* --- 3. Insider Collaboration --- */}
        <div style={style.formGroup}>
          <label style={style.label}>
             <UsersIcon style={{ width: '20px', height: '20px', marginRight: '8px' }} />
             People with access (Insiders)
          </label>
          <motion.input
            type="text"
            value={config.insiders.join(', ')}
            onChange={() => {}} // Placeholder for actual multiselect logic
            // @ts-ignore
            style={style.input}
            placeholder="Search people, groups or company..."
            whileFocus={{ borderColor: '#1E90FF', boxShadow: '0 0 0 1px #1E90FF' }}
          />
          <p style={style.description}>
            Invite specific accounts to collaborate, even if the repository is public.
          </p>
        </div>
        
        {/* Access Level (Only relevant for Private/Insiders) */}
        {config.visibility === 'private' && (
            <motion.div 
                style={style.formGroup}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
            >
                <label htmlFor="accessLevel" style={style.label}>Access Level for Insiders</label>
                <motion.select
                    id="accessLevel"
                    name="accessLevel"
                    value={config.accessLevel}
                    onChange={handleSelectChange}
                    // @ts-ignore
                    style={style.input}
                    whileFocus={{ borderColor: '#1E90FF', boxShadow: '0 0 0 1px #1E90FF' }}
                >
                    <option value="read">Read (View only)</option>
                    <option value="write">Write (Contribute and edit)</option>
                    <option value="admin">Admin (Full control)</option>
                </motion.select>
            </motion.div>
        )}

        {/* --- 4. Connection & 2D Environment --- */}
        <h2 style={{ ...style.subHeading, marginTop: '50px' }}>Advanced Configuration</h2>

        <div style={style.formGroup}>
            <label htmlFor="connectTo" style={style.label}>
                <LinkIcon style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                Connect to Existing Repository
            </label>
            <motion.select
                id="connectTo"
                name="connectTo"
                value={config.connectTo}
                onChange={handleSelectChange}
                // @ts-ignore
                style={style.input}
                whileFocus={{ borderColor: '#1E90FF', boxShadow: '0 0 0 1px #1E90FF' }}
            >
                <option value="">-- Do not connect --</option>
                {mockExistingRepos.map(repo => (
                    <option key={repo.id} value={repo.id}>{repo.name}</option>
                ))}
            </motion.select>
            <p style={style.description}>
                Link this idea to a parent or related repository to share tasks and resources.
            </p>
        </div>

        {/* 2D Representation Toggle */}
        <div style={style.formGroup}>
            <label style={{ ...style.label, justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <GlobeIcon style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                    Enable 2D Idea Representation
                </div>
                <motion.label 
                    className="toggle-switch-label"
                    whileHover={{ scale: 1.05 }}
                    style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}
                >
                    <input 
                        type="checkbox" 
                        checked={config.enable2D} 
                        onChange={(e) => setConfig({ ...config, enable2D: e.target.checked })}
                        style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span className="slider round" style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: config.enable2D ? '#1E90FF' : '#555',
                        transition: '.4s',
                        borderRadius: '24px',
                    }}>
                        <motion.span 
                            style={{
                                position: 'absolute',
                                content: '""',
                                height: '18px',
                                width: '18px',
                                left: '3px',
                                bottom: '3px',
                                backgroundColor: 'white',
                                transition: '.4s',
                                borderRadius: '50%',
                                transform: config.enable2D ? 'translateX(26px)' : 'translateX(0)',
                            }}
                        />
                    </span>
                </motion.label>
            </label>
            <p style={style.description}>
                Enable a 2D canvas for visually modeling the idea using blocks (Users, IoTs, Objects).
            </p>
        </div>
        
        {/* AI Assist Toggle (Conditional on 2D being enabled) */}
        {config.enable2D && (
            <motion.div 
                style={style.formGroup}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
            >
                <label style={{ ...style.label, justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <BotIcon style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                        AI Assistance for 2D Creation
                    </div>
                    <motion.label 
                        className="toggle-switch-label"
                        whileHover={{ scale: 1.05 }}
                        style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px' }}
                    >
                        <input 
                            type="checkbox" 
                            checked={config.aiAssist2D} 
                            onChange={(e) => setConfig({ ...config, aiAssist2D: e.target.checked })}
                            style={{ opacity: 0, width: 0, height: 0 }}
                        />
                        <span className="slider round" style={{
                            position: 'absolute',
                            cursor: 'pointer',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: config.aiAssist2D ? '#1E90FF' : '#555',
                            transition: '.4s',
                            borderRadius: '24px',
                        }}>
                            <motion.span 
                                style={{
                                    position: 'absolute',
                                    content: '""',
                                    height: '18px',
                                    width: '18px',
                                    left: '3px',
                                    bottom: '3px',
                                    backgroundColor: 'white',
                                    transition: '.4s',
                                    borderRadius: '50%',
                                    transform: config.aiAssist2D ? 'translateX(26px)' : 'translateX(0)',
                                }}
                            />
                        </span>
                    </motion.label>
                </label>
                <p style={style.description}>
                    Let the AI suggest and place blocks based on your repository description.
                </p>
            </motion.div>
        )}


        {/* Action Buttons */}
        <div style={style.actionContainer}>
            <motion.button 
                onClick={handleCancel} 
                // @ts-ignore
                style={style.cancelButton}
                whileHover={{ scale: 1.05, backgroundColor: '#555555' }}
                whileTap={{ scale: 0.95 }}
            >
                Cancel
            </motion.button>
            <motion.button 
                onClick={handleCreate} 
                // @ts-ignore
                style={style.submitButton}
                whileHover={{ scale: 1.05, backgroundColor: '#106CC8' }}
                whileTap={{ scale: 0.95 }}
            >
                Create Repository
            </motion.button>
        </div>
      </motion.div>
      
      {/* Global CSS for Inter Font and Responsive Padding */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
        
        body {
            background-color: #1E1E1E !important;
        }

        /* Input focus style override */
        input:focus, textarea:focus, select:focus {
          border-color: #1E90FF !important;
          box-shadow: 0 0 0 1px #1E90FF !important;
        }
        
        /* Mobile adjustment for form margin */
        @media (max-width: 768px) {
            .mainContent {
                margin: 30px auto;
                padding: 0 15px;
            }
            .heading {
                font-size: 1.5rem !important;
                margin-bottom: 30px !important;
            }
            .subHeading {
                font-size: 1.2rem !important;
            }
            .pillGroup {
                flex-direction: column;
                gap: 10px !important;
            }
            .pillButton {
                width: 100%;
                justify-content: center;
            }
        }
      `}</style>
    </div>
  );
};

export default CreateRepoPage;
