"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

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
  className?: string;
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

interface CanvasViewProps {
  blocks: BlockInstance[];
  setBlocks: React.Dispatch<React.SetStateAction<BlockInstance[]>>;
  userId: string | null;
  db: any; // Firestore object
  authReady: boolean;
}


// --- CONFIGURATION AND SETUP ---
const appId: string = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
// NOTE: We wrap __firebase_config in a try/catch in case it's not a valid JSON string
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

const BlockIcon: React.FC<BlockIconProps> = ({ icon, className = '' }) => (
    <div className={`p-2 rounded-full bg-gray-700 text-white flex items-center justify-center ${className}`}>
        <span className="text-xl">{icon}</span>
    </div>
);

const IconButton: React.FC<IconButtonProps> = ({ icon, label, onClick, isActive = false }) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-2 p-2 rounded-lg transition-all duration-200 
            ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
    >
        {icon}
        <span className="text-sm font-medium">{label}</span>
    </button>
);

const SidebarBlock: React.FC<SidebarBlockProps> = ({ block, onDragStart }) => (
    <div
        draggable
        onDragStart={(e) => onDragStart(e, block)}
        className="flex items-center space-x-3 p-3 my-2 bg-gray-800 rounded-xl shadow-lg cursor-grab hover:bg-gray-700 transition duration-150"
    >
        <BlockIcon icon={block.icon} className="text-lg bg-indigo-500" />
        <div>
            <div className="font-semibold text-white">{block.name}</div>
            <div className="text-xs text-indigo-300">{block.type}</div>
        </div>
    </div>
);

const BlockRenderer: React.FC<BlockRendererProps> = ({ block, position }) => {
    const isSystem: boolean = block.id === 'system';
    const bgColor: string = isSystem ? 'bg-indigo-600' : (block.type.includes('Logic') ? 'bg-orange-500' : 'bg-green-500');
    const shadow: string = isSystem ? 'shadow-indigo-glow' : 'shadow-lg';

    // Mocking the real-life block effect
    const style: React.CSSProperties = {
        left: `${position.x}px`,
        top: `${position.y}px`,
        transition: 'transform 0.1s ease', // for subtle hover/active effects
    };

    return (
        <div
            className={`absolute w-32 h-16 flex flex-col items-center justify-center rounded-lg ${bgColor} text-white ${shadow} p-2 border-2 border-white/20`}
            style={style}
            data-block-id={block.instanceId}
        >
            <div className="text-xl">{block.icon}</div>
            <div className="text-xs font-bold truncate w-full text-center">{block.name}</div>
            <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-yellow-300 transform translate-x-1 -translate-y-1 animate-pulse" title="Connected"></div>
        </div>
    );
};


// --- VIEWS ---

const RepoDocsView: React.FC<RepoDocsViewProps> = ({ data }) => (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white border-b border-gray-700 pb-2">{data.name}</h2>
        <p className="text-gray-400 italic">{data.description}</p>

        <section className="bg-gray-800 p-6 rounded-xl shadow-inner">
            <h3 className="text-xl font-semibold text-indigo-400 mb-4">README.md</h3>
            <div className="text-gray-300 space-y-4 font-mono text-sm leading-relaxed">
                <p># Project Overview: Visual IoT Automation</p>
                <p>This repository outlines the architecture for a drag-and-drop visual programming interface dedicated to IoT device orchestration. The core goal is to abstract complex code into simple, interconnected blocks.</p>
                <p>---</p>
                <h4 className="text-lg text-white">Setup Instructions:</h4>
                <ol className="list-decimal list-inside pl-4 space-y-1">
                    <li>Initialize Firebase and Firestore.</li>
                    <li>Load the initial diagram from the 'main_flow' document.</li>
                    <li>Start the local simulation engine.</li>
                </ol>
                <p>---</p>
                <h4 className="text-lg text-white">Block Customization (System Block):</h4>
                <p>System blocks accept Python or JavaScript. Input variables are mapped automatically based on incoming wire data. The output is always a JSON object.</p>
            </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-6 rounded-xl shadow-inner">
                <h3 className="text-xl font-semibold text-indigo-400 mb-4">Documentation Files</h3>
                <ul className="space-y-3">
                    {data.files.map((file: File) => (
                        <li key={file.name} className="flex justify-between items-center text-gray-300 border-b border-gray-700 pb-2 last:border-b-0 hover:text-white transition">
                            <span className="flex items-center space-x-2">
                                {file.type === 'document' && <span className="text-red-400">📄</span>}
                                {file.type === 'text' && <span className="text-blue-400">📝</span>}
                                {file.type === 'data' && <span className="text-yellow-400">💾</span>}
                                <span className="font-medium">{file.name}</span>
                            </span>
                            <span className="text-xs text-gray-500">{file.size}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl shadow-inner">
                <h3 className="text-xl font-semibold text-indigo-400 mb-4">Tasks & Progress</h3>
                <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center space-x-2">✅ <span className="line-through text-gray-500">Implement Drag-and-Drop</span></li>
                    <li className="flex items-center space-x-2">🔄 <span>Setup Firestore persistence (In Progress)</span></li>
                    <li className="flex items-center space-x-2">⭕ <span>Develop Real-Time Data Preview</span></li>
                    <li className="flex items-center space-x-2">⭕ <span>Add Multi-User Collaboration Layer</span></li>
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
        // Store the definition of the block being dragged from the sidebar
        setDraggingBlock(blockDef);
        e.dataTransfer.setData('blockType', blockDef.id);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); // Allows dropping
        if (!canvasRef.current) return;
        // Update mouse position for potential drop calculation
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
            instanceId: Date.now().toString(), // Unique ID for instance
            position: { x: snappedX, y: snappedY },
            properties: {} // Initial empty properties
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
            // Use the public path for collaborative data
            const diagramDocRef = doc(db, collectionPath, docPath);
            await setDoc(diagramDocRef, {
                blocks: JSON.stringify(blocks), // Serialize blocks array
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
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
            {/* Left Sidebar - Block Selection */}
            <div className="w-64 bg-gray-900 p-4 border-r border-gray-700 flex flex-col">
                <h3 className="text-xl font-bold text-white mb-4">Block Library</h3>
                <div className="overflow-y-auto flex-grow space-y-2">
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
                    className="mt-4 p-3 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-700 transition duration-150 disabled:bg-gray-600"
                >
                    {message.includes('Saving') ? 'Saving...' : 'Save Diagram'}
                </button>
                {message && !message.includes('Saving') && (
                    <p className={`text-center text-sm mt-2 ${message.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>{message}</p>
                )}
            </div>
            
            {/* Main Canvas Area */}
            <div 
                ref={canvasRef}
                className="flex-grow bg-gray-900 relative overflow-auto"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                {/* Grid Visual (Based on uploaded image) */}
                <div 
                    className="absolute inset-0 z-0 opacity-10 pointer-events-none"
                    style={{
                        backgroundImage: `linear-gradient(to right, #ffffff08 1px, transparent 1px), linear-gradient(to bottom, #ffffff08 1px, transparent 1px)`,
                        backgroundSize: `${gridSize}px ${gridSize}px`,
                        minWidth: '2000px', // Ensure it scrolls horizontally
                        minHeight: '2000px', // Ensure it scrolls vertically
                    }}
                ></div>

                <div className="relative w-[2000px] h-[2000px] p-8">
                    <h2 className="text-3xl font-extrabold text-white mb-6 p-4 bg-black/50 rounded-lg backdrop-blur-sm">
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
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-600 text-xl pointer-events-none">
                            Drag blocks from the sidebar to start building your flow.
                        </div>
                    )}
                </div>
            </div>

            {/* Right Sidebar - Properties/Console */}
            <div className="w-80 bg-gray-900 p-4 border-l border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">Properties / Console</h3>
                <div className="bg-gray-800 p-4 rounded-xl shadow-inner h-1/2 overflow-y-auto mb-4">
                    <p className="text-indigo-400 font-mono text-sm">-- Console Output --</p>
                    <p className="text-gray-400 text-xs mt-2">[10:01:23] System Block: Waiting for trigger...</p>
                    <p className="text-gray-400 text-xs">[10:01:25] ESP32-1: Motion detected (Input: true)</p>
                    <p className="text-green-400 text-xs">[10:01:25] System Block: Processing code...</p>
                    {/* The fix from earlier is preserved */}
                    <p className="text-gray-400 text-xs">[10:01:26] System Block: Output: {'{"light": "on"}'}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-xl shadow-inner h-1/2 overflow-y-auto">
                    <p className="text-yellow-400 font-mono text-sm">-- Selected Block Properties --</p>
                    <div className="mt-2 space-y-3 text-gray-300 text-sm">
                        <p>No block selected.</p>
                        <p className='text-xs text-gray-500'>Click a block on the canvas to edit its properties, code (for system blocks), or user role (for user blocks).</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
    const [view, setView] = useState<'canvas' | 'docs'>('canvas'); // Default to the 2D Canvas view
    const [blocks, setBlocks] = useState<BlockInstance[]>([]);
    const [db, setDb] = useState<any>(null); // Use 'any' for Firestore instance
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
                    // Sign in with custom token if available, otherwise sign in anonymously
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
            setAuthReady(true); // Allow running without database if initialization fails
        }
    }, []);

    // 2. Firestore Listener for Block Diagrams
    useEffect(() => {
        if (!db || !authReady) return;

        const collectionPath: string = `artifacts/${appId}/public/data/block_diagrams`;
        const docPath: string = 'main_flow';

        // Listen for real-time updates to the 'main_flow' diagram
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

        // Cleanup function
        return () => unsubscribe();
    }, [db, authReady]);


    if (!authReady) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
                <p className="text-lg animate-pulse">{loadingMessage}</p>
            </div>
        );
    }

    // Component Rendering
    return (
        <div className="min-h-screen bg-gray-900 font-sans antialiased text-gray-100">
            {/* Header */}
            <header className="flex justify-between items-center p-4 bg-gray-800 shadow-md h-16">
                <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-extrabold text-indigo-400">
                        {REPO_DATA.name}
                    </h1>
                    <span className="text-sm text-gray-500">Repo ID: {appId} | User: {userId}</span>
                </div>
                <nav className="flex space-x-4">
                    <IconButton 
                        icon={<span className="text-xl">📚</span>} 
                        label="Docs & Files" 
                        onClick={() => setView('docs')}
                        isActive={view === 'docs'}
                    />
                    <IconButton 
                        icon={<span className="text-xl">⚙️</span>} 
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
