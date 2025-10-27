"use client";
import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';

// --- TYPE DEFINITIONS ---
interface Repo {
  id: number;
  name: string;
  isPrivate: boolean;
}

type Currency = 'USD' | 'PESO' | 'EUR' | 'JPY'; // Added more currencies for flexibility

interface AITask {
  id: number;
  title: string;
  repo: string;
  reward: number; // Reward is mandatory, can be 0
  currency: Currency; // New currency field
  status: 'Open' | 'InProgress' | 'Review';
}

// --- CURRENCY FORMATTER HELPER ---
const formatCurrency = (amount: number, currency: Currency) => {
  // Map internal codes to standard ISO 4217 codes
  let currencyCode: string;
  let locale: string;

  switch (currency) {
    case 'PESO':
      currencyCode = 'PHP';
      locale = 'en-PH';
      break;
    case 'EUR':
      currencyCode = 'EUR';
      locale = 'en-EU';
      break;
    case 'JPY':
      currencyCode = 'JPY';
      locale = 'en-JP';
      break;
    case 'USD':
    default:
      currencyCode = 'USD';
      locale = 'en-US';
      break;
  }

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(amount);
};


// --- MOCK DATA (Updated with Currency) ---

const mockRepos: Repo[] = [
  { id: 1, name: 'Thesis Chapter 1', isPrivate: false },
  { id: 2, name: 'Agentic AI Capabilities', isPrivate: true },
  { id: 3, name: 'Platform Functionality', isPrivate: false },
];

const mockPrivateAccess: Repo[] = [
  { id: 4, name: 'Team Project Alpha', isPrivate: true },
  { id: 5, name: 'Funding Proposal 2025', isPrivate: true },
];

const mockTasks: AITask[] = [
  { id: 101, title: 'Refine Data Collection Module', repo: 'Thesis Chapter 1', status: 'Open', reward: 50, currency: 'USD' },
  { id: 102, title: 'Review Literature: MSME Context', repo: 'Agentic AI Capabilities', status: 'Review', reward: 0, currency: 'USD' },
  { id: 103, title: 'Implement Signal R for Realtime Updates', repo: 'Platform Functionality', status: 'InProgress', reward: 15000, currency: 'PESO' },
  { id: 104, title: 'Draft Conclusion Summary (AI Suggestion)', repo: 'Thesis Chapter 1', status: 'Open', reward: 20, currency: 'EUR' },
  { id: 105, title: 'Fix CSS Bug in Desktop View', repo: 'Team Project Alpha', status: 'Open', reward: 5000, currency: 'JPY' },
];


// --- ICONS (Inline SVG) ---

const MenuIcon = (props: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);

const UserIcon = (props: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);

const SearchIcon = (props: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

const FolderIcon = (props: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
);

const PlusIcon = (props: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const LockIcon = (props: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);

// Dollar icon is removed since we use a formatted string, but we can keep it generic
const RewardIcon = (props: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 12l4 4 4-4"></path><path d="M12 8v8"></path></svg>
);


// --- COMPONENTS ---

const RepoCard: React.FC<{ repo: Repo }> = ({ repo }) => (
  <motion.div 
    className="repo-card"
    whileHover={{ scale: 1.02, backgroundColor: '#282828' }}
    whileTap={{ scale: 0.98 }}
  >
    <FolderIcon className="repo-icon" />
    <span style={{ marginLeft: '10px', fontSize: '1rem', fontWeight: 500, color: '#E0E0E0' }}>
      {repo.name}
    </span>
    {repo.isPrivate && <LockIcon className="lock-icon" />}
  </motion.div>
);

const TaskItem: React.FC<{ task: AITask }> = ({ task }) => {
  const statusColor = task.status === 'Open' ? '#1E90FF' : task.status === 'Review' ? '#FFD700' : '#4F46E5';
  
  // Use the new currency formatter
  const formattedReward = task.reward > 0 ? formatCurrency(task.reward, task.currency) : '';

  return (
    <motion.div 
      className="task-item"
      whileHover={{ backgroundColor: '#282828' }}
      whileTap={{ scale: 0.99 }}
    >
      <div style={{ flexGrow: 1 }}>
        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#E0E0E0', lineHeight: 1.3 }}>
          {task.title}
        </p>
        <p style={{ margin: '3px 0 0 0', fontSize: '0.75rem', color: '#888888' }}>
          {task.repo}
        </p>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {task.reward > 0 && (
          <motion.div 
            className="reward-chip"
            whileHover={{ scale: 1.05 }}
            style={{ 
              backgroundColor: task.currency === 'PESO' ? '#FF6347' : task.currency === 'EUR' ? '#3399FF' : task.currency === 'JPY' ? '#B8860B' : '#387B40', 
              color: '#E0E0E0' 
            }}
          >
            {/* Using a generic Reward Icon */}
            <RewardIcon className="dollar-icon" />
            {formattedReward}
          </motion.div>
        )}
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: statusColor, padding: '3px 8px', borderRadius: '4px', border: `1px solid ${statusColor}` }}>
          {task.status}
        </div>
      </div>
    </motion.div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'owned' | 'private'>('owned');

  // Fix: Move helper functions inside the component or keep outside as pure functions
  const createRepo = () => {
    // In a real Next.js app, you'd use router.push, but for this context, direct navigation is fine.
    console.log('Navigating to create-repo page...');
    window.location.href = '../create-repo';
  };

  const viewRepo = () => {
    window.location.href = '../repo';
  }
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        staggerChildren: 0.05, // Stagger items for a nice effect on switch
      }
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  
  // FIX: This logic was already correct, but we ensure the rendering relies on this state fully.
  const currentRepos = activeTab === 'owned' ? mockRepos : mockPrivateAccess;

  return (
    <div className="dashboard-layout">
      
      {/* 1. TOP NAVBAR */}
      <motion.header 
        className="top-navbar"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="logo-section">
          <MenuIcon className="menu-icon" />
          <span style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 25px', color: '#1E90FF' }}>Dashboard</span>
        </div>
        
        <div className="search-bar-container">
          <SearchIcon className="search-icon" />
          <input type="text" placeholder="Type here to search..." className="search-input" />
        </div>
        
        <div className="user-profile-container">
          <UserIcon className="user-icon" />
        </div>
      </motion.header>
      
      {/* 2. LEFT SIDEBAR (Sticky) */}
      <motion.aside 
        className="left-sidebar"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <nav className="nav-menu">
            <motion.div 
                className={`nav-item ${activeTab === 'owned' ? 'active' : ''}`}
                whileHover={{ backgroundColor: '#1E90FF33', }}
                onClick={() => setActiveTab('owned')}
            >
                <FolderIcon className="nav-icon" />
                <span>My Repositories</span>
            </motion.div>
            <motion.div 
                className={`nav-item ${activeTab === 'private' ? 'active' : ''}`}
                whileHover={{ backgroundColor: '#1E90FF33' }}
                onClick={() => setActiveTab('private')}
            >
                <LockIcon className="nav-icon" />
                <span>Private Access</span>
            </motion.div>
        </nav>

        <div className="user-list">
          <motion.div className="user-avatar" whileHover={{ scale: 1.1 }}><UserIcon className="user-avatar-icon" /></motion.div>
          <motion.div className="user-avatar" whileHover={{ scale: 1.1 }}><UserIcon className="user-avatar-icon" /></motion.div>
          <motion.div className="user-avatar" whileHover={{ scale: 1.1 }}><UserIcon className="user-avatar-icon" /></motion.div>
          <motion.div className="user-avatar" whileHover={{ scale: 1.1 }}><UserIcon className="user-avatar-icon" /></motion.div>
          <motion.div className="user-avatar" whileHover={{ scale: 1.1 }}><UserIcon className="user-avatar-icon" /></motion.div>
        </div>
      </motion.aside>

      {/* 3. MAIN CONTENT AREA */}
      <main className="main-content">
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'white', marginBottom: '15px' }}>
          Home
        </h1>
        
        <div className="search-bar-full">
            <SearchIcon className="search-icon-small" />
            <input type="text" placeholder="Search files..." className="search-input-full" />
        </div>

        {/* Action Buttons */}
        <div className="action-row">
            <motion.button 
                className="action-button create"
                whileHover={{ scale: 1.05, backgroundColor: '#106CC8' }}
                whileTap={{ scale: 0.95 }}
                onClick={createRepo}
            >
                <PlusIcon className="button-icon" />
                Create Repository
            </motion.button>
            <motion.button 
                className="action-button repository"
                whileHover={{ scale: 1.05, backgroundColor: '#333333' }}
                whileTap={{ scale: 0.95 }}
            >
                <FolderIcon className="button-icon" />
                Repository
            </motion.button>
        </div>
        
        {/* Repository List */}
        <motion.div 
            // Key FIX: Changing the key forces Framer Motion to re-mount/re-animate the entire container,
            // which guarantees a visual refresh when the tab switches, resolving the user's perceived bug.
            key={activeTab} 
            className="repo-list-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#AAAAAA', marginTop: '30px' }}>
                {activeTab === 'owned' ? 'Your Owned Repositories' : 'Repositories with Private Access'}
            </h2>
            {currentRepos.map(repo => (
                <motion.button onClick={viewRepo} key={repo.id} variants={itemVariants}>
                    <RepoCard repo={repo} />
                </motion.button>
            ))}
            {currentRepos.length === 0 && (
                <p style={{ color: '#666666', marginTop: '10px' }}>No repositories found in this view.</p>
            )}
        </motion.div>
      </main>

      {/* 4. AI TASK PANEL (Sticky Right) */}
      <motion.section 
        className="ai-task-panel"
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', marginBottom: '20px', padding: '0 20px' }}>
            AI Recommended Tasks
        </h2>
        
        <motion.div 
            className="task-list"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
          {mockTasks.map(task => (
            <motion.div key={task.id} variants={itemVariants}>
                <TaskItem task={task} />
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* --- GLOBAL STYLES (Styled JSX) --- */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
        
        :root {
            --nav-height: 60px;
            --sidebar-width: 200px; /* Adjusted width for better link display */
            --task-panel-width: 350px;
            --bg-color: #1E1E1E;
            --card-color: #222222;
            --blue-accent: #1E90FF;
            --border-color: #333333;
        }

        html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-color);
            color: #E0E0E0;
            overflow-x: hidden;
        }

        /* ---------------------------------------------------- */
        /* --- DESKTOP GRID LAYOUT (Default: 3-Column) --- */
        /* ---------------------------------------------------- */

        .dashboard-layout {
            display: grid;
            /* Adjusted grid columns to accommodate the sidebar width change */
            grid-template-columns: var(--sidebar-width) 1fr var(--task-panel-width);
            grid-template-rows: var(--nav-height) 1fr;
            height: 100vh;
            overflow: hidden; 
        }
        
        .top-navbar {
            grid-column: 1 / 4; 
            grid-row: 1 / 2;
            position: sticky;
            top: 0;
            z-index: 100;
            background-color: var(--card-color);
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 20px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
        }
        
        /* 1. Navbar elements */
        .logo-section { display: flex; align-items: center; }
        .menu-icon { width: 24px; height: 24px; color: #E0E0E0; cursor: pointer; }

        .search-bar-container {
            display: flex;
            align-items: center;
            background-color: #1E1E1E;
            border-radius: 4px;
            padding: 5px 15px;
            width: 350px;
            border: 1px solid var(--border-color);
        }
        .search-icon { width: 18px; height: 18px; color: #888888; margin-right: 10px; }
        .search-input {
            background: none;
            border: none;
            color: #E0E0E0;
            outline: none;
            padding: 5px 0;
            width: 100%;
            font-size: 0.9rem;
        }
        .user-profile-container { margin-left: auto; }
        .user-icon { width: 32px; height: 32px; color: var(--blue-accent); cursor: pointer; }


        /* 2. Left Sidebar (Fixed) */
        .left-sidebar {
            grid-column: 1 / 2;
            grid-row: 2 / 3;
            background-color: var(--card-color);
            border-right: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-top: 20px;
            height: 100%;
        }
        .nav-menu { width: 100%; padding: 0 10px; }
        .nav-item {
            display: flex;
            align-items: center;
            padding: 12px;
            margin-bottom: 10px;
            border-radius: 6px; /* Slightly more rounded */
            color: #AAAAAA;
            cursor: pointer;
            transition: background-color 0.2s, color 0.2s;
            font-size: 0.9rem; /* Increased font size for better readability */
            font-weight: 500;
        }
        .nav-item:hover { color: white; background-color: #333333; } /* Updated hover effect */
        .nav-item.active { background-color: var(--blue-accent); color: white; font-weight: 600; }
        .nav-item.active:hover { background-color: var(--blue-accent); }
        .nav-icon { width: 18px; height: 18px; margin-right: 10px; color: inherit; } /* Color inherits from parent */
        .user-list { 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            gap: 15px; 
            padding: 20px 0;
            margin-top: auto; 
            border-top: 1px solid var(--border-color);
            width: 80%;
        }
        .user-avatar { 
            width: 36px; 
            height: 36px; 
            border-radius: 50%; 
            background-color: #333333;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
        }
        .user-avatar-icon { width: 20px; height: 20px; color: #999999; }
        

        /* 3. Main Content */
        .main-content {
            grid-column: 2 / 3;
            grid-row: 2 / 3;
            overflow-y: auto; 
            padding: 30px;
        }
        .search-bar-full {
            display: flex;
            align-items: center;
            background-color: var(--card-color);
            border-radius: 8px;
            padding: 12px 18px;
            margin-bottom: 30px;
            border: 1px solid var(--border-color);
        }
        .search-icon-small { width: 20px; height: 20px; color: #888888; margin-right: 10px; }
        .search-input-full {
            background: none;
            border: none;
            color: #E0E0E0;
            outline: none;
            width: 100%;
            font-size: 1rem;
        }
        
        .action-row {
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
        }
        .action-button {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 150px;
            height: 120px;
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            border: none; /* Removed border, using shadow for depth */
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
            transition: all 0.2s;
        }
        .button-icon { width: 36px; height: 36px; margin-bottom: 10px; }
        .action-button.create { background-color: var(--blue-accent); color: white; }
        .action-button.create .button-icon { color: white; }
        .action-button.repository { background-color: var(--card-color); color: #E0E0E0; border: 1px solid var(--border-color); }
        .action-button.repository .button-icon { color: #E0E0E0; }


        .repo-list-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); /* Wider cards */
            gap: 20px;
            padding-bottom: 50px;
        }
        .repo-card {
            background-color: var(--card-color);
            padding: 20px;
            border-radius: 8px; /* Consistent rounding */
            display: flex;
            align-items: center;
            cursor: pointer;
            border: 1px solid var(--border-color);
            transition: all 0.2s;
            position: relative;
        }
        .repo-icon { width: 24px; height: 24px; color: var(--blue-accent); }
        .lock-icon { width: 16px; height: 16px; color: #AAAAAA; position: absolute; top: 8px; right: 8px; }


        /* 4. AI Task Panel (Fixed Right) */
        .ai-task-panel {
            grid-column: 3 / 4;
            grid-row: 2 / 3;
            background-color: var(--card-color);
            border-left: 1px solid var(--border-color);
            padding-top: 30px;
            overflow-y: auto; 
            height: 100%;
        }
        .task-list {
            padding: 0;
        }
        .task-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            border-bottom: 1px solid #333333;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        .task-item:last-child { border-bottom: none; }
        .reward-chip {
            display: flex;
            align-items: center;
            padding: 4px 10px;
            border-radius: 9999px; /* Pill shape */
            font-size: 0.8rem;
            font-weight: bold;
            transition: transform 0.2s;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }
        .dollar-icon { width: 14px; height: 14px; margin-right: 4px; }


        /* ---------------------------------------------------- */
        /* --- MOBILE/TABLET RESPONSIVENESS (Single Column) --- */
        /* ---------------------------------------------------- */

        @media (max-width: 1024px) {
            .dashboard-layout {
                /* Switch to a single column layout */
                grid-template-columns: 1fr;
                grid-template-rows: var(--nav-height) auto 1fr auto;
                height: auto;
                min-height: 100vh;
                overflow-y: visible;
            }

            .top-navbar {
                grid-column: 1 / 2;
                position: fixed; 
                width: 100%;
            }
            
            .search-bar-container {
                display: none; /* Hide top search bar on small screens to save space */
            }
            .logo-section span {
                font-size: 1rem !important;
            }

            .left-sidebar {
                grid-column: 1 / 2;
                grid-row: 2 / 3;
                width: 100%;
                padding: 10px 0;
                border-right: none;
                border-bottom: 1px solid var(--border-color);
                flex-direction: row; 
                justify-content: center; /* Center the two tabs */
                align-items: stretch;
            }
            .nav-menu {
                display: flex;
                flex-grow: 0; /* Let tabs define their size */
                justify-content: center;
                gap: 15px;
                width: auto;
            }
            .nav-item {
                flex-direction: row; /* Back to row layout for space */
                justify-content: center;
                min-width: 120px;
            }
            .nav-item span {
                display: inline;
                margin-left: 5px !important;
                margin-top: 0 !important;
            }
            .user-list {
                display: none; /* Hide collaborators list on mobile */
            }


            .main-content {
                grid-column: 1 / 2;
                grid-row: 3 / 4;
                padding-top: 20px; /* Reduced top padding since sidebar is in row 2 */
            }

            .action-row {
                flex-direction: column;
                gap: 15px;
            }
            .action-button {
                width: 100%;
                height: 80px;
                flex-direction: row;
                justify-content: center;
            }
            .button-icon { margin-bottom: 0; margin-right: 10px; }


            .ai-task-panel {
                grid-column: 1 / 2;
                grid-row: 4 / 5;
                padding-top: 20px;
                border-left: none;
                border-top: 1px solid var(--border-color);
            }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
