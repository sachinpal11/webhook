import axios from "axios";
import React, { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion"; // Import Framer Motion

function App() {
  const inputRef = useRef();
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Function to handle sending messages to the original webhook
  const handleSubmit = async (message) => {
    const userMessage =
      typeof message === "string" ? message : inputRef.current.value.trim();
    if (!userMessage) return;

    // Add user message to chat history
    setChatHistory((prev) => [
      ...prev,
      { sender: "user", message: userMessage },
    ]);
    // Clear input field
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setLoading(true); // Show loading indicator

    try {
      // Make API call to webhook
      const res = await axios.post(
        "https://sainmedia12.app.n8n.cloud/webhook/webhook-testing",
        {
          data: userMessage,
        }
      );

      // Add bot response to chat history
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "bot",
          message: res.data.Output || "No response.",
        },
      ]);
    } catch (error) {
      console.error("Webhook Error:", error);
      // Display error message if API call fails
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "bot",
          message: "❌ Error fetching response. Please try again.",
        },
      ]);
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  // Function to handle clicks on suggestion buttons
  const handleSuggestionClick = (suggestion) => {
    handleSubmit(suggestion);
  };

  // Function to clear chat history
  const ClearChat = () => {
    setChatHistory([]);
  };

  // Function to summarize chat history using Gemini API
  const handleSummarizeChat = async () => {
    setLoading(true);
    try {
      // Construct prompt for summarization
      const conversationText = chatHistory
        .map((chat) => `${chat.sender}: ${chat.message}`)
        .join("\n");
      const prompt = `Please summarize the following conversation concisely:\n\n${conversationText}`;

      let chatHistoryForLLM = [{ role: "user", parts: [{ text: prompt }] }];
      const payload = { contents: chatHistoryForLLM };
      const apiKey = ""; // Canvas will provide this
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        const summary = result.candidates[0].content.parts[0].text;
        setChatHistory((prev) => [
          ...prev,
          { sender: "bot", message: `✨ **Chat Summary:**\n\n${summary}` },
        ]);
      } else {
        setChatHistory((prev) => [
          ...prev,
          {
            sender: "bot",
            message: "❌ Could not generate summary. Please try again.",
          },
        ]);
      }
    } catch (error) {
      console.error("Gemini API Error (Summarize):", error);
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "bot",
          message: "❌ Error summarizing chat. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Function to generate creative ideas using Gemini API
  const handleGenerateIdea = async () => {
    setLoading(true);
    try {
      const userPrompt = inputRef.current.value.trim();
      const prompt = userPrompt
        ? `Generate a creative idea based on the following topic: "${userPrompt}"`
        : "Generate a general creative idea.";

      let chatHistoryForLLM = [{ role: "user", parts: [{ text: prompt }] }];
      const payload = { contents: chatHistoryForLLM };
      const apiKey = ""; // Canvas will provide this
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        const idea = result.candidates[0].content.parts[0].text;
        setChatHistory((prev) => [
          ...prev,
          { sender: "bot", message: `✨ **Creative Idea:**\n\n${idea}` },
        ]);
        if (inputRef.current) {
          inputRef.current.value = ""; // Clear input after generating idea
        }
      } else {
        setChatHistory((prev) => [
          ...prev,
          {
            sender: "bot",
            message: "❌ Could not generate idea. Please try again.",
          },
        ]);
      }
    } catch (error) {
      console.error("Gemini API Error (Generate Idea):", error);
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "bot",
          message: "❌ Error generating idea. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-black text-gray-100 flex flex-col items-center font-sans">
      {/* Header */}
      <div className="w-full max-w-5xl p-5 bg-black/30 backdrop-blur-md sticky top-0 z-10 border-b border-amber-800 shadow-lg rounded-b-xl">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <h1 className=" tsm:text-3xl font-extrabold text-amber-400 tracking-wide">
              ⚡ Sain Media AI
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Powered by Sain Media & Developers
            </p>
          </div>
          <div className="flex space-x-3">
            {/* Summarize Chat Button */}

            {/* New Chat Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-amber-600 bg-opacity-40 text-white px-6 py-2 rounded-lg font-medium shadow-md hover:bg-amber-500 hover:bg-opacity-50 transition-colors duration-200 border border-amber-700"
              onClick={ClearChat}
            >
              New Chat
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content - Chat Window or Initial Suggestions */}
      <div className="w-full max-w-5xl flex-1 overflow-y-auto px-4 py-8 space-y-6 flex flex-col items-center">
        {chatHistory.length === 0 ? (
          <>
            {/* Initial greeting and suggestions with animations */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl font-bold text-yellow-400 mb-10 mt-20 text-center"
            >
              How can Sain Media AI help you today?
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 w-full max-w-5xl px-4">
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(255, 255, 0, 0.05)",
                }}
                whileTap={{ scale: 0.98 }}
                className="bg-black text-yellow-400 p-5 rounded-xl border border-yellow-600 shadow-md flex flex-col items-start text-left backdrop-blur-md"
                onClick={() =>
                  handleSuggestionClick("Create a reel script for Instagram")
                }
              >
                <div className="font-semibold text-lg">
                  🎬 Reels Script Generator
                </div>
                <div className="text-sm text-yellow-200 mt-1">
                  Get engaging short-form content tailored for your audience.
                </div>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(255, 255, 0, 0.05)",
                }}
                whileTap={{ scale: 0.98 }}
                className="bg-black text-yellow-400 p-5 rounded-xl border border-yellow-600 shadow-md flex flex-col items-start text-left backdrop-blur-md"
                onClick={() =>
                  handleSuggestionClick(
                    "Suggest viral video ideas for my niche"
                  )
                }
              >
                <div className="font-semibold text-lg">
                  🚀 Viral Video Ideas
                </div>
                <div className="text-sm text-yellow-200 mt-1">
                  Brainstorm high-engagement content ideas based on trends.
                </div>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                whileHover={{
                  scale: 1.05,
                  backgroundColor: "rgba(255, 255, 0, 0.05)",
                }}
                whileTap={{ scale: 0.98 }}
                className="bg-black text-yellow-400 p-5 rounded-xl border border-yellow-600 shadow-md flex flex-col items-start text-left backdrop-blur-md"
                onClick={() =>
                  handleSuggestionClick("Write a client DM message")
                }
              >
                <div className="font-semibold text-lg">
                  💬 Client Message Helper
                </div>
                <div className="text-sm text-yellow-200 mt-1">
                  Craft professional DMs or replies to leads & collaborators.
                </div>
              </motion.button>
            </div>
          </>
        ) : (
          <div className="w-full">
            {/* Chat history display with message animations */}
            {chatHistory.map((chat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`flex ${
                  chat.sender === "user" ? "justify-end" : "justify-start"
                } mb-4`}
              >
                <div className="flex items-start max-w-xl gap-3">
                  {chat.sender === "bot" && (
                    <div className="text-amber-400 pt-1">
                      {/* Robot SVG Icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 1.5a.75.75 0 01.75.75V4.5a.75.75 0 01-1.5 0V2.25A.75.75 0 0112 1.5zM12 19.5a.75.75 0 01.75.75V22.5a.75.75 0 01-1.5 0v-2.25a.75.75 0 01.75-.75zM2.25 12a.75.75 0 01.75-.75H4.5a.75.75 0 010 1.5H3a.75.75 0 01-.75-.75zM19.5 12a.75.75 0 01.75-.75H21a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM12 6a6 6 0 100 12 6 6 0 000-12zM7.757 7.757a.75.75 0 011.06 0l1.25 1.25a.75.75 0 11-1.06 1.06l-1.25-1.25a.75.75 0 010-1.06zM15.121 8.879a.75.75 0 010 1.06l-1.25 1.25a.75.75 0 11-1.06-1.06l1.25-1.25a.75.75 0 011.06 0zM7.757 15.121a.75.75 0 010 1.06l1.25 1.25a.75.75 0 11-1.06 1.06l-1.25-1.25a.75.75 0 011.06-1.06zM15.121 15.121a.75.75 0 011.06 0l1.25 1.25a.75.75 0 01-1.06 1.06l-1.25-1.25a.75.75 0 010-1.06z"
                        />
                      </svg>
                    </div>
                  )}

                  <div
                    className={`p-4 rounded-2xl whitespace-pre-wrap leading-relaxed text-sm shadow-lg border ${
                      chat.sender === "user"
                        ? "bg-amber-800 bg-opacity-40 text-white rounded-br-none border-amber-700 backdrop-blur-sm"
                        : "bg-gray-900 bg-opacity-40 text-gray-200 border-gray-700 rounded-bl-none backdrop-blur-sm"
                    }`}
                  >
                    <ReactMarkdown>{chat.message}</ReactMarkdown>
                  </div>

                  {chat.sender === "user" && (
                    <div className="text-amber-400 pt-1">
                      {/* User SVG Icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Typing Loader */}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-300 mt-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-amber-400"
            >
              <path
                fillRule="evenodd"
                d="M12 1.5a.75.75 0 01.75.75V4.5a.75.75 0 01-1.5 0V2.25A.75.75 0 0112 1.5zM12 19.5a.75.75 0 01.75.75V22.5a.75.75 0 01-1.5 0v-2.25a.75.75 0 01.75-.75zM2.25 12a.75.75 0 01.75-.75H4.5a.75.75 0 010 1.5H3a.75.75 0 01-.75-.75zM19.5 12a.75.75 0 01.75-.75H21a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM12 6a6 6 0 100 12 6 6 0 000-12zM7.757 7.757a.75.75 0 011.06 0l1.25 1.25a.75.75 0 11-1.06 1.06l-1.25-1.25a.75.75 0 010-1.06zM15.121 8.879a.75.75 0 010 1.06l-1.25 1.25a.75.75 0 11-1.06-1.06l1.25-1.25a.75.75 0 011.06 0zM7.757 15.121a.75.75 0 010 1.06l1.25 1.25a.75.75 0 11-1.06 1.06l-1.25-1.25a.75.75 0 011.06-1.06zM15.121 15.121a.75.75 0 011.06 0l1.25 1.25a.75.75 0 01-1.06 1.06l-1.25-1.25a.75.75 0 010-1.06z"
              />
            </svg>
            <div className="animate-pulse">Typing...</div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="w-full max-w-5xl p-6 bg-black/30 backdrop-blur-md border-t border-amber-800 shadow-inner flex justify-center rounded-t-xl">
        <div className="flex items-center gap-4 w-full max-w-3xl bg-gray-900 bg-opacity-40 rounded-xl border border-gray-700 px-4 py-3 shadow-lg backdrop-blur-sm">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-gray-500 hover:text-amber-400 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </motion.button>
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask me anything......"
            className="flex-1 bg-transparent text-gray-200 focus:outline-none placeholder-gray-500 text-lg"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />

          {/* Generate Idea Button */}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            className="bg-amber-600 bg-opacity-40 text-white px-5 py-2 rounded-lg font-semibold shadow-md hover:bg-amber-500 hover:bg-opacity-50 transition-colors flex items-center justify-center border border-amber-700"
            disabled={loading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 rotate-90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default App;
