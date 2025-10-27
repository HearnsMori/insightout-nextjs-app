"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// --- TYPE DECLARATIONS FOR GLOBAL INJECTED VARIABLES ---
declare const __app_id: string;
declare const __firebase_config: string;
declare const __initial_auth_token: string;

// --- TYPE DEFINITIONS ---

interface BlockDefinition {
  id: 'esp32' | 'camera' | 'and' | 'or' | 'system' | 'user';
  type: 'IoT Device' | 'Logic Gate' | 'System Block' | 'User Block';
  name: string;
  icon: string;
}

interface BlockInstance extends BlockDefinition {
  instanceId: string;
  position: { x: number; y: number };
  properties: Record<string, any>;
}

interface File {
    name: string;
    type: 'text' | 'document' | 'data';
    size: string;
}

interface RepoData {
    name: string;
    description: string;
    author: string;
    files: File[];
}

// Interfaces for component props
interface BlockIconProps {
  icon: string;
  style?: React.CSSProperties; // Added to allow external style override/extension
}

interface IconButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
}

interface SidebarBlockProps {
  block: BlockDefinition;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, blockDef: BlockDefinition) => void;
}

interface BlockRendererProps {
  block: BlockInstance;
  position: { x: number; y: number };
}

interface RepoDocsViewProps {
    data: RepoData;
}

interface CanvasViewProps {
  blocks: BlockInstance[];
  setBlocks: React.Dispatch<React.SetStateAction<BlockInstance[]>>;
  userId: string | null;
  db: any; // Firestore object
  authReady: boolean;
}


// --- CONFIGURATION AND SETUP ---
const appId: string = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig: object = JSON.parse(typeof __firebase_config !== 'undefined' && __firebase_config !== '' ? __firebase_config : '{}');
const initialAuthToken: string | null = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Mock Block Definitions
const BLOCK_DEFINITIONS: BlockDefinition[] = [
  { id: 'esp32', type: 'IoT Device', name: 'ESP32', icon: '⚡' },
  { id: 'camera', type: 'IoT Device', name: 'Camera', icon: '📷' },
  { id: 'and', type: 'Logic Gate', name: 'AND Gate', icon: '∧' },
  { id: 'or', type: 'Logic Gate', name: 'OR Gate', icon: '∨' },
  { id: 'system', type: 'System Block', name: 'Process Code', icon: '💻' },
  { id: 'user', type: 'User Block', name: 'Human Input', icon: '👤' },
];

// Mock Repository Data
const REPO_DATA: RepoData = {
    name: "InsightOut - Smart Home Hub",
    description: "A collaborative project for building visual IoT automation flows.",
    author: "user-XYZ-42",
    files: [
        { name: "README.md", type: "text", size: "3 KB" },
        { name: "Task_List.md", type: "text", size: "1 KB" },
        { name: "Thesis_Draft.pdf", type: "document", size: "5.2 MB" },
        { name: "schema.json", type: "data", size: "500 B" },
    ],
};

// --- UTILITY COMPONENTS ---

const BlockIcon: React.FC<BlockIconProps> = ({ icon, style = {} }) => (
    <div 
        style={{
            padding: '8px', 
            borderRadius: '9999px', // rounded-full
            backgroundColor: '#4B5563', // bg-gray-700
            color: 'white', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            ...style
        }}
    >
        <span style={{ fontSize: '1.25rem' }}>{icon}</span> {/* text-xl */}
    </div>
);

const IconButton: React.FC<IconButtonProps> = ({ icon, label, onClick, isActive = false }) => {
    // Note: Inline styles cannot handle hover/active states easily. 
    // This provides only the base and active styles.
    const baseStyle: React.CSSProperties = {
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', // space-x-2
        padding: '8px', 
        borderRadius: '8px', // rounded-lg
        transition: 'all 200ms ease', // transition-all duration-200
        cursor: 'pointer',
    };

    const activeStyle: React.CSSProperties = {
        backgroundColor: '#4F46E5', // bg-indigo-600
        color: 'white',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // shadow-lg (approximated)
    };

    const inactiveStyle: React.CSSProperties = {
        color: '#D1D5DB', // text-gray-300
    };

    return (
        <button
            onClick={onClick}
            style={{
                ...baseStyle,
                ...(isActive ? activeStyle : inactiveStyle),
            }}
        >
            {icon}
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{label}</span> {/* text-sm font-medium */}
        </button>
    );
};

const SidebarBlock: React.FC<SidebarBlockProps> = ({ block, onDragStart }) => (
    <div
        draggable
        onDragStart={(e) => onDragStart(e, block)}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px', // space-x-3
            padding: '12px',
            margin: '8px 0', // my-2
            backgroundColor: '#1F2937', // bg-gray-800
            borderRadius: '12px', // rounded-xl
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)', // shadow-lg
            cursor: 'grab',
            transition: 'background-color 150ms ease', // hover:bg-gray-700 transition duration-150
            // Note: The hover effect is not easily achievable with pure inline style without JS handlers.
        }}
    >
        <BlockIcon 
            icon={block.icon} 
            style={{ fontSize: '1.125rem', backgroundColor: '#6366F1' }} // text-lg bg-indigo-500
        />
        <div>
            <div style={{ fontWeight: '600', color: 'white' }}>{block.name}</div> {/* font-semibold text-white */}
            <div style={{ fontSize: '0.75rem', color: '#A5B4FC' }}>{block.type}</div> {/* text-xs text-indigo-300 */}
        </div>
    </div>
);

const BlockRenderer: React.FC<BlockRendererProps> = ({ block, position }) => {
    const isSystem: boolean = block.id === 'system';
    const bgColor: string = isSystem ? '#4F46E5' : (block.type.includes('Logic') ? '#F97316' : '#10B981'); // bg-indigo-600, bg-orange-500, bg-green-500
    
    // Note: Tailwind's custom glow shadow is not possible with standard inline CSS. 
    // We'll use a standard box-shadow for approximation.
    const shadow: string = isSystem ? `0 0 15px rgba(79, 70, 229, 0.7)` : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'; // shadow-indigo-glow, shadow-lg

    const style: React.CSSProperties = {
        position: 'absolute',
        width: '128px', // w-32
        height: '64px', // h-16
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px', // rounded-lg
        backgroundColor: bgColor,
        color: 'white',
        boxShadow: shadow,
        padding: '8px', // p-2
        border: '2px solid rgba(255, 255, 255, 0.2)', // border-2 border-white/20
        left: `${position.x}px`,
        top: `${position.y}px`,
        transition: 'transform 0.1s ease',
        cursor: 'move', // Added for usability
    };

    const statusDotStyle: React.CSSProperties = {
        position: 'absolute',
        top: '0',
        right: '0',
        width: '8px', // w-2
        height: '8px', // h-2
        borderRadius: '50%', // rounded-full
        backgroundColor: '#FDE047', // bg-yellow-300
        transform: 'translate(4px, -4px)', // translate-x-1 -translate-y-1
        // Note: 'animate-pulse' is not a standard CSS property. 
        // We'll skip the pulse animation in pure inline style.
    };

    return (
        <div
            style={style}
            data-block-id={block.instanceId}
        >
            <div style={{ fontSize: '1.25rem' }}>{block.icon}</div> {/* text-xl */}
            <div 
                style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: '700', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap', // truncate w-full
                    width: '100%', 
                    textAlign: 'center' 
                }}
            >{block.name}</div> {/* text-xs font-bold truncate w-full text-center */}
            <div style={statusDotStyle} title="Connected"></div>
        </div>
    );
};


// --- VIEWS ---

const RepoDocsView: React.FC<RepoDocsViewProps> = ({ data }) => (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '896px', margin: '0 auto' }}> {/* p-8 space-y-8 max-w-4xl mx-auto */}
        <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'white', borderBottom: '1px solid #374151', paddingBottom: '8px' }}>{data.name}</h2> {/* text-3xl font-bold text-white border-b border-gray-700 pb-2 */}
        <p style={{ color: '#9CA3AF', fontStyle: 'italic' }}>{data.description}</p> {/* text-gray-400 italic */}

        <section style={{ backgroundColor: '#1F2937', padding: '24px', borderRadius: '12px', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.6)' }}> {/* bg-gray-800 p-6 rounded-xl shadow-inner */}
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#818CF8', marginBottom: '16px' }}>README.md</h3> {/* text-xl font-semibold text-indigo-400 mb-4 */}
            <div style={{ color: '#D1D5DB', display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: 'monospace', fontSize: '0.875rem', lineHeight: '1.625' }}> {/* text-gray-300 space-y-4 font-mono text-sm leading-relaxed */}
                <p># Project Overview: Visual IoT Automation</p>
                <p>This repository outlines the architecture for a drag-and-drop visual programming interface dedicated to IoT device orchestration. The core goal is to abstract complex code into simple, interconnected blocks.</p>
                <p>---</p>
                <h4 style={{ fontSize: '1.125rem', color: 'white' }}>Setup Instructions:</h4> {/* text-lg text-white */}
                <ol style={{ listStyleType: 'decimal', listStylePosition: 'inside', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}> {/* list-decimal list-inside pl-4 space-y-1 */}
                    <li>Initialize Firebase and Firestore.</li>
                    <li>Load the initial diagram from the 'main_flow' document.</li>
                    <li>Start the local simulation engine.</li>
                </ol>
                <p>---</p>
                <h4 style={{ fontSize: '1.125rem', color: 'white' }}>Block Customization (System Block):</h4>
                <p>System blocks accept Python or JavaScript. Input variables are mapped automatically based on incoming wire data. The output is always a JSON object.</p>
            </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))', gap: '24px' }}> {/* grid grid-cols-1 md:grid-cols-2 gap-6 (simplified grid) */}
            <div style={{ backgroundColor: '#1F2937', padding: '24px', borderRadius: '12px', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.6)' }}> {/* bg-gray-800 p-6 rounded-xl shadow-inner */}
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#818CF8', marginBottom: '16px' }}>Documentation Files</h3>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}> {/* space-y-3 */}
                    {data.files.map((file: File) => (
                        <li key={file.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#D1D5DB', borderBottom: '1px solid #374151', paddingBottom: '8px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}> {/* space-x-2 */}
                                {file.type === 'document' && <span style={{ color: '#F87171' }}>📄</span>}
                                {file.type === 'text' && <span style={{ color: '#60A5FA' }}>📝</span>}
                                {file.type === 'data' && <span style={{ color: '#FACC15' }}>💾</span>}
                                <span style={{ fontWeight: '500' }}>{file.name}</span> {/* font-medium */}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>{file.size}</span> {/* text-xs text-gray-500 */}
                        </li>
                    ))}
                </ul>
            </div>
            <div style={{ backgroundColor: '#1F2937', padding: '24px', borderRadius: '12px', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.6)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#818CF8', marginBottom: '16px' }}>Tasks & Progress</h3>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#D1D5DB' }}> {/* space-y-2 text-gray-300 */}
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>✅ <span style={{ textDecoration: 'line-through', color: '#6B7280' }}>Implement Drag-and-Drop</span></li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>🔄 <span>Setup Firestore persistence (In Progress)</span></li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>⭕ <span>Develop Real-Time Data Preview</span></li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>⭕ <span>Add Multi-User Collaboration Layer</span></li>
                </ul>
            </div>
        </div>
    </div>
);

const CanvasView: React.FC<CanvasViewProps> = ({ blocks, setBlocks, userId, db, authReady }) => {
    const [draggingBlock, setDraggingBlock] = useState<BlockDefinition | null>(null);
    const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [message, setMessage] = useState<string>('');
    
    // Grid settings
    const gridSize: number = 40;
    const canvasRef = React.useRef<HTMLDivElement>(null);

    // --- DRAG HANDLERS ---
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, blockDef: BlockDefinition) => {
        setDraggingBlock(blockDef);
        e.dataTransfer.setData('blockType', blockDef.id);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!canvasRef.current) return;
        const rect: DOMRect = canvasRef.current.getBoundingClientRect();
        setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        
        if (!draggingBlock || !canvasRef.current) return;

        const rect: DOMRect = canvasRef.current.getBoundingClientRect();
        const clientX: number = e.clientX - rect.left;
        const clientY: number = e.clientY - rect.top;

        // Snap to grid
        const snappedX: number = Math.round(clientX / gridSize) * gridSize;
        const snappedY: number = Math.round(clientY / gridSize) * gridSize;

        const newBlock: BlockInstance = {
            ...draggingBlock,
            instanceId: Date.now().toString(),
            position: { x: snappedX, y: snappedY },
            properties: {}
        };
        
        setBlocks((prev: BlockInstance[]) => [...prev, newBlock]);
        setDraggingBlock(null);
    };

    // --- FIRESTORE HANDLERS ---
    const collectionPath: string = `artifacts/${appId}/public/data/block_diagrams`;
    const docPath: string = 'main_flow';

    const saveDiagram = useCallback(async () => {
        if (!db || !authReady || !userId) {
            setMessage('Authentication or database not ready. Cannot save.');
            return;
        }
        setMessage('Saving diagram...');
        try {
            const diagramDocRef = doc(db, collectionPath, docPath);
            await setDoc(diagramDocRef, {
                blocks: JSON.stringify(blocks),
                updatedAt: Date.now(),
                updatedBy: userId,
            });
            setMessage('Diagram saved successfully!');
        } catch (error: any) {
            console.error("Error saving document: ", error);
            setMessage(`Error saving diagram: ${error.message}`);
        }
        setTimeout(() => setMessage(''), 3000);
    }, [db, authReady, userId, blocks]);

    // Draw the mock wire/connection (visual only)
    const Wire: React.FC = () => (
        <div 
            style={{ 
                position: 'absolute', 
                left: '180px', top: '100px', 
                width: '180px', height: '2px', 
                backgroundColor: 'cyan', 
                borderRadius: '1px', 
                boxShadow: '0 0 8px cyan'
            }}
            title="Mock Connection: ESP32 -> System Block"
        ></div>
    );

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}> {/* flex h-[calc(100vh-64px)] overflow-hidden */}
            {/* Left Sidebar - Block Selection */}
            <div style={{ width: '256px', backgroundColor: '#0B0F19', padding: '16px', borderRight: '1px solid #374151', display: 'flex', flexDirection: 'column' }}> {/* w-64 bg-gray-900 p-4 border-r border-gray-700 flex flex-col */}
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', marginBottom: '16px' }}>Block Library</h3> {/* text-xl font-bold text-white mb-4 */}
                <div style={{ overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}> {/* overflow-y-auto flex-grow space-y-2 */}
                    {BLOCK_DEFINITIONS.map((block: BlockDefinition) => (
                        <SidebarBlock 
                            key={block.id} 
                            block={block} 
                            onDragStart={handleDragStart} 
                        />
                    ))}
                </div>
                <button 
                    onClick={saveDiagram}
                    disabled={!authReady}
                    style={{
                        marginTop: '16px', // mt-4
                        padding: '12px', // p-3
                        backgroundColor: '#6366F1', // bg-indigo-500
                        color: 'white',
                        fontWeight: '700', // font-bold
                        borderRadius: '12px', // rounded-xl
                        transition: 'background-color 150ms ease', // hover:bg-indigo-700 transition duration-150
                        cursor: authReady ? 'pointer' : 'not-allowed',
                        opacity: authReady ? 1 : 0.6, // disabled:opacity-60 (approximation)
                    }}
                >
                    {message.includes('Saving') ? 'Saving...' : 'Save Diagram'}
                </button>
                {message && !message.includes('Saving') && (
                    <p style={{ textAlign: 'center', fontSize: '0.875rem', marginTop: '8px', color: message.includes('Error') ? '#F87171' : '#4ADE80' }}>{message}</p>
                )}
            </div>
            
            {/* Main Canvas Area */}
            <div 
                ref={canvasRef}
                style={{ 
                    flexGrow: 1, 
                    backgroundColor: '#0B0F19', 
                    position: 'relative', 
                    overflow: 'auto',
                    minWidth: '0' // For flex-grow to work properly
                }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                {/* Grid Visual */}
                <div 
                    style={{
                        position: 'absolute', 
                        inset: '0', // inset-0
                        zIndex: 0, // z-0
                        opacity: 0.1, // opacity-10
                        pointerEvents: 'none', // pointer-events-none
                        backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`, // #ffffff08 is approx rgba(255, 255, 255, 0.03)
                        backgroundSize: `${gridSize}px ${gridSize}px`,
                        minWidth: '2000px',
                        minHeight: '2000px',
                    }}
                ></div>

                <div style={{ position: 'relative', width: '2000px', height: '2000px', padding: '32px' }}> {/* relative w-[2000px] h-[2000px] p-8 */}
                    <h2 
                        style={{ 
                            fontSize: '1.875rem', 
                            fontWeight: '800', 
                            color: 'white', 
                            marginBottom: '24px', 
                            padding: '16px', 
                            backgroundColor: 'rgba(0, 0, 0, 0.5)', 
                            borderRadius: '8px',
                            backdropFilter: 'blur(5px)', // backdrop-blur-sm (approximation)
                        }}
                    >
                        2D Visual Flow Editor
                    </h2>

                    {blocks.map((block: BlockInstance) => (
                        <BlockRenderer 
                            key={block.instanceId} 
                            block={block} 
                            position={block.position} 
                        />
                    ))}

                    {/* Example of a simulated wire connection */}
                    <Wire />
                    
                    {blocks.length === 0 && (
                        <div style={{
                            position: 'absolute', 
                            top: '50%', left: '50%', 
                            transform: 'translate(-50%, -50%)', 
                            color: '#4B5563', 
                            fontSize: '1.25rem', 
                            pointerEvents: 'none'
                        }}>
                            Drag blocks from the sidebar to start building your flow.
                        </div>
                    )}
                </div>
            </div>

            {/* Right Sidebar - Properties/Console */}
            <div style={{ width: '320px', backgroundColor: '#0B0F19', padding: '16px', borderLeft: '1px solid #374151' }}> {/* w-80 bg-gray-900 p-4 border-l border-gray-700 */}
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', marginBottom: '16px' }}>Properties / Console</h3>
                <div style={{ backgroundColor: '#1F2937', padding: '16px', borderRadius: '12px', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.6)', height: '50%', overflowY: 'auto', marginBottom: '16px' }}>
                    <p style={{ color: '#818CF8', fontFamily: 'monospace', fontSize: '0.875rem' }}>-- Console Output --</p>
                    <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '8px' }}>[10:01:23] System Block: Waiting for trigger...</p>
                    <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>[10:01:25] ESP32-1: Motion detected (Input: true)</p>
                    <p style={{ color: '#4ADE80', fontSize: '0.75rem' }}>[10:01:25] System Block: Processing code...</p>
                    <p style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>[10:01:26] System Block: Output: {'{"light": "on"}'}</p>
                </div>
                <div style={{ backgroundColor: '#1F2937', padding: '16px', borderRadius: '12px', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.6)', height: '50%', overflowY: 'auto' }}>
                    <p style={{ color: '#FACC15', fontFamily: 'monospace', fontSize: '0.875rem' }}>-- Selected Block Properties --</p>
                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '12px', color: '#D1D5DB', fontSize: '0.875rem' }}>
                        <p>No block selected.</p>
                        <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>Click a block on the canvas to edit its properties, code (for system blocks), or user role (for user blocks).</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
    const [view, setView] = useState<'canvas' | 'docs'>('canvas');
    const [blocks, setBlocks] = useState<BlockInstance[]>([]);
    const [db, setDb] = useState<any>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [authReady, setAuthReady] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('Initializing application...');

    // 1. Firebase Initialization and Authentication
    useEffect(() => {
        if (!firebaseConfig || Object.keys(firebaseConfig).length === 0) {
            setLoadingMessage('Firebase config not found. Running in local mode.');
            setAuthReady(true);
            return;
        }

        try {
            const app = initializeApp(firebaseConfig);
            const firestore = getFirestore(app);
            const auth = getAuth(app);

            setDb(firestore);

            onAuthStateChanged(auth, async (user) => {
                if (!user) {
                    if (initialAuthToken) {
                        try {
                            const userCred = await signInWithCustomToken(auth, initialAuthToken);
                            setUserId(userCred.user.uid);
                        } catch (e) {
                            console.error("Error signing in with custom token. Falling back to anonymous.", e);
                            await signInAnonymously(auth);
                        }
                    } else {
                        await signInAnonymously(auth);
                    }
                } else {
                    setUserId(user.uid);
                }
                setAuthReady(true);
                setLoadingMessage('Application Ready.');
                console.log("Firebase Auth State Ready. User ID:", auth.currentUser?.uid);
            });
        } catch (error) {
            console.error("Firebase Initialization Error:", error);
            setLoadingMessage('Error initializing Firebase. Running in local mode.');
            setAuthReady(true);
        }
    }, []);

    // 2. Firestore Listener for Block Diagrams
    useEffect(() => {
        if (!db || !authReady) return;

        const collectionPath: string = `artifacts/${appId}/public/data/block_diagrams`;
        const docPath: string = 'main_flow';

        const diagramDocRef = doc(db, collectionPath, docPath);

        const unsubscribe = onSnapshot(diagramDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data && data.blocks) {
                    try {
                        const loadedBlocks: BlockInstance[] = JSON.parse(data.blocks);
                        setBlocks(loadedBlocks);
                        console.log("Loaded block diagram from Firestore.");
                    } catch (e) {
                        console.error("Error parsing blocks data:", e);
                    }
                }
            } else {
                console.log("No existing block diagram found. Starting with a blank canvas.");
            }
        }, (error) => {
            console.error("Error listening to Firestore snapshot:", error);
        });

        return () => unsubscribe();
    }, [db, authReady]);


    if (!authReady) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#0B0F19', color: 'white' }}> {/* flex items-center justify-center min-h-screen bg-gray-900 text-white */}
                <p style={{ fontSize: '1.125rem', animation: 'pulse 1.5s infinite' }}>{loadingMessage}</p> {/* text-lg animate-pulse */}
                {/* Note: animation: 'pulse' is an approximation of Tailwind's utility, not standard CSS */}
            </div>
        );
    }

    // Component Rendering
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0B0F19', fontFamily: 'sans-serif', WebkitFontSmoothing: 'antialiased', color: '#E5E7EB' }}> {/* min-h-screen bg-gray-900 font-sans antialiased text-gray-100 */}
            {/* Header */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#1F2937', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', height: '64px' }}> {/* flex justify-between items-center p-4 bg-gray-800 shadow-md h-16 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}> {/* flex items-center space-x-4 */}
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#818CF8' }}> {/* text-2xl font-extrabold text-indigo-400 */}
                        {REPO_DATA.name}
                    </h1>
                    <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>Repo ID: {appId} | User: {userId}</span> {/* text-sm text-gray-500 */}
                </div>
                <nav style={{ display: 'flex', gap: '16px' }}> {/* flex space-x-4 */}
                    <IconButton 
                        icon={<span style={{ fontSize: '1.25rem' }}>📚</span>} 
                        label="Docs & Files" 
                        onClick={() => setView('docs')}
                        isActive={view === 'docs'}
                    />
                    <IconButton 
                        icon={<span style={{ fontSize: '1.25rem' }}>⚙️</span>} 
                        label="2D Canvas" 
                        onClick={() => setView('canvas')}
                        isActive={view === 'canvas'}
                    />
                </nav>
            </header>

            {/* Main Content View Switch */}
            <main>
                {view === 'docs' && <RepoDocsView data={REPO_DATA} />}
                {view === 'canvas' && (
                    <CanvasView 
                        blocks={blocks} 
                        setBlocks={setBlocks} 
                        userId={userId} 
                        db={db}
                        authReady={authReady}
                    />
                )}
            </main>
        </div>
    );
};

export default App;