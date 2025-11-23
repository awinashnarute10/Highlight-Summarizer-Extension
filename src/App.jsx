
import './App.css'

import { useEffect, useState } from "react";

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleString();
}

function App() {
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState(false);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");

  // Load highlights on popup open
  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(["highlights"], (result) => {
        setHighlights(result.highlights || []);
        setLoading(false);
      });
    } else {
      // Fallback for local dev
      console.warn("Chrome storage not available, using mock data");
      setHighlights([
        { id: 1, text: "This is a mock highlight for development purposes.", url: "http://localhost", title: "Local Dev", createdAt: Date.now() }
      ]);
      setLoading(false);
    }
  }, []);

  // Delete highlight
  const handleDelete = (id) => {
    const updated = highlights.filter((h) => h.id !== id);
    setHighlights(updated);
    
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ highlights: updated });
    }
  };

  // OPTIONAL: Summarize using OpenAI
  const handleSummarize = async () => {
    setError("");
    setSummary("");
    setSummarizing(true);
    
    const apiKey = import.meta.env.VITE_CEREBRAS_API_KEY;
    console.log("Debug - API Key loaded:", apiKey ? "Yes (starts with " + apiKey.substring(0, 3) + ")" : "No");

    try {
      if (highlights.length === 0) {
        setError("No highlights to summarize.");
        setSummarizing(false);
        return;
      }

      const combinedText = highlights
        .map((h, idx) => `${idx + 1}. ${h.text}`)
        .join("\n");
        
      if (!apiKey) {
        setError("No Cerebras API key set. Add VITE_CEREBRAS_API_KEY in .env.");
        setSummarizing(false);
        return;
      }

      const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama3.1-8b",
          messages: [
            {
              role: "system",
              content: "You summarize user highlights into short bullet points.",
            },
            {
              role: "user",
              content: `Summarize these highlights concisely:\n\n${combinedText}`,
            },
          ],
          temperature: 0.2,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Cerebras API Error:", response.status, data);
        throw new Error(data.error?.message || `Error ${response.status}: ${JSON.stringify(data)}`);
      }

      const resultText = data.choices?.[0]?.message?.content?.trim() || "";
      setSummary(resultText);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <div className="w-[380px] h-[480px] bg-black text-white flex flex-col font-sans">
      <header className="relative px-5 py-4 border-b border-zinc-900 flex items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-sm font-semibold tracking-tight text-white">
            Highlight Saver
          </h1>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Your personal knowledge base
          </p>
        </div>
        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-800">
          {highlights.length} saved
        </span>
      </header>

      <main className="flex-1 flex flex-col bg-black">
        {/* Summarize section */}
        <div className="px-5 py-3 border-b border-zinc-900 flex items-center gap-3">
          <button
            onClick={handleSummarize}
            disabled={summarizing || highlights.length === 0}
            className="text-[11px] font-medium px-4 py-1.5 rounded-full bg-white text-black hover:bg-green-500 hover:text-black disabled:bg-zinc-800 disabled:text-zinc-500 transition-all duration-200 ease-out"
          >
            {summarizing ? "Summarizing..." : "Summarize"}
          </button>
          <span className="text-[10px] text-zinc-500">
            Generate AI summary
          </span>
        </div>

        {/* Summary output */}
        {summary && (
          <div className="px-5 py-4 text-xs text-zinc-300 border-b border-zinc-900 max-h-36 overflow-auto whitespace-pre-wrap bg-zinc-900/30 leading-relaxed">
            {summary}
          </div>
        )}

        {error && (
          <div className="px-5 py-3 text-xs text-red-400 border-b border-zinc-900 bg-red-500/5">
            {error}
          </div>
        )}

        {/* Highlights list */}
        <div className="flex-1 overflow-auto px-4 py-3 space-y-2.5 custom-scrollbar">
          {loading ? (
            <p className="text-xs text-zinc-500 px-1">Loading highlights...</p>
          ) : highlights.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center px-6">
              <p className="text-sm text-zinc-400 font-medium">No highlights yet</p>
              <p className="text-[11px] text-zinc-600 mt-1">
                Select text on any page and click the popup to save it here.
              </p>
            </div>
          ) : (
            highlights.map((h) => (
              <div
                key={h.id}
                className="group relative border border-zinc-800 rounded-xl p-3.5 text-xs bg-zinc-950 hover:border-green-500/50 transition-colors duration-200"
              >
                <p className="text-zinc-200 whitespace-pre-wrap leading-relaxed mb-3">
                  {h.text}
                </p>
                <div className="flex justify-between items-end gap-3">
                  <div className="flex flex-col min-w-0 gap-0.5">
                    <a
                      href={h.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] font-medium text-zinc-500 hover:text-green-400 truncate max-w-[220px] transition-colors"
                      title={h.title || h.url}
                    >
                      {h.title || h.url}
                    </a>
                    <span className="text-[9px] text-zinc-600">
                      {formatDate(h.createdAt)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(h.id)}
                    className="text-[10px] px-3 py-1 rounded-full bg-red-600 text-white border border-red-600 hover:bg-black hover:text-red-500 transition-colors duration-200 font-medium shadow-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <footer className="px-5 py-3 border-t border-zinc-900 bg-black text-[10px] text-zinc-600 flex justify-between items-center">
        <span>v1.0</span>
        <span className="opacity-50">Powered by Cerebras</span>
      </footer>
    </div>
  );
}

export default App;

