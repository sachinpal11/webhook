import axios from "axios";
import React, { useRef, useState } from "react";
import { FaRobot, FaUserCircle } from "react-icons/fa";

function App() {
  const inputRef = useRef();
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const userMessage = inputRef.current.value.trim();
    if (!userMessage) return;

    setChatHistory((prev) => [
      ...prev,
      { sender: "user", message: userMessage },
    ]);
    inputRef.current.value = "";
    setLoading(true);

    try {
      const res = await axios.post(
        "https://sainmedia12.app.n8n.cloud/webhook/webhook-testing",
        {
          data: userMessage,
        }
      );

      setChatHistory((prev) => [
        ...prev,
        {
          sender: "bot",
          message: res.data.Output || "No response.",
        },
      ]);
    } catch (error) {
      console.error("Webhook Error:", error);
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "bot",
          message: "❌ Error fetching response. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center font-sans">
      {/* Header */}
      <div className="w-full max-w-4xl p-5 bg-[#111111] sticky top-0 z-10 border-b border-yellow-400 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-yellow-400">
              ⚡ SAIN Media AI
            </h1>
            <p className="text-sm text-gray-400">
              Sain media & Developers Assistant
            </p>
          </div>
          <button className="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-300 transition font-medium">
            New Chat
          </button>
        </div>
      </div>

      {/* Chat Window */}
      <div className="w-full max-w-4xl flex-1 overflow-y-auto px-4 py-8 space-y-6">
        {chatHistory.map((chat, index) => (
          <div
            key={index}
            className={`flex ${
              chat.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div className="flex items-start max-w-xl gap-3">
              {chat.sender === "bot" && (
                <div className="text-yellow-400 pt-1">
                  <FaRobot size={24} />
                </div>
              )}

              <div
                className={`p-4 rounded-2xl whitespace-pre-wrap leading-relaxed text-sm shadow-md ${
                  chat.sender === "user"
                    ? "bg-yellow-400 text-black rounded-br-none"
                    : "bg-[#1a1a1a] text-yellow-300 border border-yellow-700 rounded-bl-none"
                }`}
              >
                {chat.message}
              </div>

              {chat.sender === "user" && (
                <div className="text-yellow-300 pt-1">
                  <FaUserCircle size={24} />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing Loader */}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-yellow-300">
            <FaRobot className="text-yellow-400" />
            <div className="animate-pulse">Typing...</div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="w-full max-w-4xl p-6 bg-[#111111] border-t border-yellow-400">
        <div className="flex items-center gap-4">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type your message..."
            className="flex-1 bg-[#1a1a1a] text-yellow-300 p-4 rounded-xl border border-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-yellow-600"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <button
            onClick={handleSubmit}
            className="bg-yellow-400 text-black px-5 py-3 rounded-xl font-semibold hover:bg-yellow-300 transition"
          >
            Send
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs text-yellow-500 my-4">Built by Sain Media ⚡</p>
    </div>
  );
}

export default App;
