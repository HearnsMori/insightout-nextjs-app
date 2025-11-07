"use client";
import React, { useState } from "react";

export default function GeminiChatPage() {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    async function sendMessage() {
        if (!input.trim()) return;
        setLoading(true);

        const context =
            "Your response shall start with <div>, code only. Add 100vw and background color inline css. No text, explnation, or other response, just div element. Make it aesthetic and laptop/desktop responsive design, inline css/js only. ";
        const outputInside = document.getElementById("output")?.innerHTML;
        const fullPrompt = `${context}\n ${input} \n Existing Code (when sending send all new updated code): ${outputInside}`;

        try {
            const res = await fetch("https://nursync-backend.onrender.com/api/bot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: fullPrompt }),
            });

            if (!res.ok) {
                throw new Error(`Server returned ${res.status}`);
            }

            const data = await res.json();
            const aiResponse = data?.msg?.trim() || "";
            console.log(aiResponse);
            // Validate response: must start with < and end with >
            if (true) {
                const output = document.getElementById("output");

                if (output) {
                    
                    let aiResponse = data?.msg?.trim() || "";

                    // Remove markdown code block markers if present
                    aiResponse = aiResponse.replace(/^```html?/, '').replace(/```$/, '');

                    console.log(aiResponse);
                    // ...existing code...
                    output.innerHTML = aiResponse;
                }
            }
        } catch (err) {
            console.error("Error:", err);
            alert("Error communicating with backend.");
        } finally {
            setInput("");
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 relative">
            {/* Empty div for inserted Gemini/AI response */}
            <div id="output" className="min-h-screen p-10"></div>

            {/* Fixed chat bar */}
            <div className="fixed bottom-0 left-0 w-full md:w-[400px] bg-white border-t border-gray-200 shadow-lg p-4">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        placeholder="Type your prompt..."
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-md ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                            }`}
                    >
                        {loading ? "..." : "Send"}
                    </button>
                </div>
            </div>
        </div>
    );
}