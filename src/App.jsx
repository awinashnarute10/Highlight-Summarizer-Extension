
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
    <div className="w-[380px] h-[480px] bg-slate-950 text-slate-100 flex flex-col">
      <header className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold">Highlight Saver</h1>
          <p className="text-[11px] text-slate-400">
            Select text on any page, then click “Save highlight?”
          </p>
        </div>
        <span className="text-[10px] text-slate-500">
          {highlights.length} saved
        </span>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Summarize section */}
        <div className="px-4 py-2 border-b border-slate-800 flex items-center gap-2">
          <button
            onClick={handleSummarize}
            disabled={summarizing || highlights.length === 0}
            className="text-xs px-3 py-1 rounded-full bg-indigo-600 disabled:bg-slate-700 disabled:text-slate-400 hover:bg-indigo-500 transition"
          >
            {summarizing ? "Summarizing..." : "Summarize"}
          </button>
          <span className="text-[11px] text-slate-400">
            AI summary of your saved highlights
          </span>
        </div>

        {/* Summary output */}
        {summary && (
          <div className="px-4 py-2 text-xs text-slate-100 border-b border-slate-800 max-h-28 overflow-auto whitespace-pre-wrap">
            {summary}
          </div>
        )}

        {error && (
          <div className="px-4 py-2 text-xs text-red-400 border-b border-slate-800">
            {error}
          </div>
        )}

        {/* Highlights list */}
        <div className="flex-1 overflow-auto px-3 py-2 space-y-2">
          {loading ? (
            <p className="text-xs text-slate-400">Loading highlights...</p>
          ) : highlights.length === 0 ? (
            <p className="text-xs text-slate-400">
              No highlights yet. Select text on any webpage to see the “Save highlight?” bubble.
            </p>
          ) : (
            highlights.map((h) => (
              <div
                key={h.id}
                className="border border-slate-800 rounded-lg p-2 text-xs bg-slate-900/60 flex flex-col gap-1"
              >
                <p className="text-slate-100 whitespace-pre-wrap">
                  “{h.text}”
                </p>
                <div className="flex justify-between items-center gap-2">
                  <div className="flex flex-col">
                    <a
                      href={h.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-indigo-400 truncate max-w-[180px]"
                      title={h.title || h.url}
                    >
                      {h.title || h.url}
                    </a>
                    <span className="text-[10px] text-slate-500">
                      {formatDate(h.createdAt)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(h.id)}
                    className="text-[10px] px-2 py-1 rounded-full border border-red-500 text-red-400 hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <footer className="px-4 py-2 border-t border-slate-800 text-[10px] text-slate-500 text-right">
        Built with React + Tailwind
      </footer>
    </div>
  );
}

export default App;

