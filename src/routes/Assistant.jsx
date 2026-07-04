// src/routes/Assistant.jsx
import { useRef, useState, useEffect } from "react";
import { useData } from "../context/DataContext";
import { FaPaperPlane, FaRobot } from "react-icons/fa";

const SUGGESTIONS = [
  "How much did I spend on Dining last month?",
  "Which category has grown the most in the last few months?",
  "What was my biggest single purchase recently?",
  "Am I spending more than I earn?",
];

// Must match CHAT_MAX_MESSAGE_LENGTH in server/controllers/aiController.cjs
const CHAT_MAX_MESSAGE_LENGTH = 1000;

export default function Assistant() {
  const { askAssistant, getAiUsage } = useData();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  // Daily message quota — fetched once so the user can see how many messages
  // they have left before they hit the limit, rather than finding out only
  // after a surprise 429.
  const [chatUsage, setChatUsage] = useState(null);
  useEffect(() => {
    getAiUsage().then(u => setChatUsage(u.chat)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const chatExhausted = chatUsage && chatUsage.used >= chatUsage.limit;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const send = async (text) => {
    const question = (text ?? input).trim();
    if (!question || sending || chatExhausted) return;

    const history = messages.map(({ role, content }) => ({ role, content }));
    const nextMessages = [...messages, { role: "user", content: question }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setSending(true);
    try {
      const reply = await askAssistant(question, history);
      setMessages(m => [...m, { role: "assistant", content: reply }]);
      // Mirrors the backend: a successful call consumed one of today's
      // attempts, a failed one doesn't (it's refunded server-side).
      setChatUsage(prev => prev && { ...prev, used: Math.min(prev.used + 1, prev.limit) });
    } catch (err) {
      const serverMessage = err?.response?.data?.message;
      setError(serverMessage || "Couldn't get a response right now. Please try again.");
      // Drop the optimistically-added message so a failed turn doesn't leave a
      // dangling unanswered question in state (or in history sent next request).
      setMessages(prev => prev.slice(0, -1));
      if (text === undefined) setInput(question);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-8 flex flex-col h-[calc(100vh-4rem)]">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-800">Assistant</h1>
        <p className="text-gray-600 mt-1">Ask questions about your spending from the last 6 months.</p>
        {chatUsage && (
          <p className="text-gray-400 text-xs mt-1">
            {chatExhausted
              ? `You've used all ${chatUsage.limit} messages for today — resets tomorrow.`
              : `${chatUsage.limit - chatUsage.used} of ${chatUsage.limit} messages left today`}
          </p>
        )}
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-lg overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4">
            <FaRobot className="text-4xl text-indigo-300" />
            <p className="text-gray-500">Try asking one of these:</p>
            <div className="flex flex-col gap-2 w-full max-w-md">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  disabled={chatExhausted}
                  className="text-left text-sm bg-indigo-50 hover:bg-indigo-100 disabled:opacity-40 disabled:hover:bg-indigo-50 text-indigo-700 rounded-lg px-4 py-2 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-line ${
                m.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-500 rounded-2xl rounded-bl-sm px-4 py-2 text-sm">
              Thinking...
            </div>
          </div>
        )}

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="mt-4 flex items-center gap-2 bg-white rounded-xl shadow-lg p-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={chatExhausted ? "Daily message limit reached" : "Ask about your spending..."}
          className="flex-1 px-3 py-2 bg-transparent focus:outline-none text-gray-800"
          disabled={sending || chatExhausted}
          maxLength={CHAT_MAX_MESSAGE_LENGTH}
        />
        <button
          type="submit"
          disabled={sending || chatExhausted || !input.trim()}
          className="shrink-0 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white p-3 rounded-lg transition-colors"
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
}
