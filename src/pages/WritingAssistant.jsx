// pages/WritingAssistant.jsx
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  CheckCircle, RefreshCw, Target, GitCompare,
  BriefcaseIcon, MessageCircle, BookOpen, Zap,
  AlertCircle, AlertTriangle, Info, Copy, ArrowRight,
  PenLine, CheckCheck, Sparkles, ChevronRight
} from "lucide-react";
import Navbar from "../components/Navbar";

const ANTHROPIC_API = "/api/chat";

const toneOptions = [
  { id: "formal",     label: "Formal",     Icon: BriefcaseIcon,  desc: "Professional & polished" },
  { id: "casual",     label: "Casual",     Icon: MessageCircle,  desc: "Relaxed & friendly" },
  { id: "academic",   label: "Academic",   Icon: BookOpen,       desc: "Scholarly & precise" },
  { id: "persuasive", label: "Persuasive", Icon: Zap,            desc: "Compelling & bold" },
];

const featureTabs = [
  { id: "grammar",    label: "Grammar & Spelling", Icon: CheckCircle },
  { id: "paraphrase", label: "Paraphrase",         Icon: RefreshCw   },
  { id: "clarity",    label: "Clarity Score",      Icon: Target      },
  { id: "compare",    label: "Compare Versions",   Icon: GitCompare  },
];

// Helper: always returns an array
function toArray(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === "string" && val.trim()) return val.split("\n").filter(Boolean);
  return [];
}

// LCS-based word diff
function lcs(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1].toLowerCase() === b[j-1].toLowerCase()
        ? dp[i-1][j-1] + 1
        : Math.max(dp[i-1][j], dp[i][j-1]);
  return dp;
}

function diffWords(original, corrected) {
  // Split on whitespace but keep punctuation attached — then tokenize punctuation separately
  const tokenize = (str) => str.split(/\s+/).filter(Boolean).flatMap(w => {
    // Separate trailing punctuation so "me." -> ["me", "."]
    const m = w.match(/^([a-zA-Z0-9''-]+)([.,!?;:)]+)?$/);
    if (m && m[2]) return [m[1], m[2]];
    return [w];
  });
  const aWords = tokenize(original);
  const bWords = tokenize(corrected);
  const dp = lcs(aWords, bWords);
  let i = aWords.length, j = bWords.length;
  const ops = [];
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && aWords[i-1].toLowerCase() === bWords[j-1].toLowerCase()) {
      ops.unshift({ type: "equal", a: aWords[i-1], b: bWords[j-1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j-1] >= dp[i-1][j])) {
      ops.unshift({ type: "insert", b: bWords[j-1] });
      j--;
    } else {
      ops.unshift({ type: "delete", a: aWords[i-1] });
      i--;
    }
  }
  const merged = [];
  let k = 0;
  while (k < ops.length) {
    if (ops[k].type === "delete" && k+1 < ops.length && ops[k+1].type === "insert") {
      merged.push({ type: "sub", a: ops[k].a, b: ops[k+1].b });
      k += 2;
    } else {
      merged.push(ops[k]);
      k++;
    }
  }
  const aParts = [], bParts = [];
  merged.forEach(op => {
    if (op.type === "equal") {
      aParts.push({ word: op.a, changed: false });
      bParts.push({ word: op.b, changed: false });
    } else if (op.type === "sub") {
      aParts.push({ word: op.a, changed: true });
      bParts.push({ word: op.b, changed: true });
    } else if (op.type === "delete") {
      aParts.push({ word: op.a, changed: true });
      bParts.push({ word: "", changed: true, ghost: true });
    } else if (op.type === "insert") {
      aParts.push({ word: "", changed: true, ghost: true });
      bParts.push({ word: op.b, changed: true });
    }
  });
  return { aParts, bParts };
}

function HighlightedText({ parts, side }) {
  const highlightBg  = side === "original" ? "rgba(240,74,110,0.25)" : "rgba(200,240,74,0.2)";
  const highlightBdr = side === "original" ? "#f04a6e" : "#c8f04a";
  return (
    <p style={{ fontSize: 14, lineHeight: 2, margin: 0, color: "rgba(255,255,255,0.85)" }}>
      {parts.map((p, i) => {
        if (p.ghost) return null;
        if (!p.changed) return <span key={i}>{p.word} </span>;
        return (
          <span key={i} style={{
            background: highlightBg, border: `1px solid ${highlightBdr}`,
            borderRadius: 4, padding: "1px 4px", marginRight: 3, fontWeight: 600,
            color: side === "original" ? "#f07090" : "#c8f04a",
            textDecoration: side === "original" ? "line-through" : "none",
            textDecorationColor: "#f04a6e",
            fontFamily: "'DM Mono', monospace", fontSize: 13,
          }}>{p.word}</span>
        );
      })}
    </p>
  );
}

function Spinner() {
  return <div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.15)", borderTopColor: "#c8f04a", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block", flexShrink: 0 }} />;
}

function ClarityMeter({ score }) {
  const color = score >= 80 ? "#c8f04a" : score >= 55 ? "#f0c44a" : "#f04a6e";
  const label = score >= 80 ? "Excellent" : score >= 55 ? "Good" : "Needs Work";
  const r = 68, circ = 2 * Math.PI * r;
  return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <div style={{ position: "relative", display: "inline-block", width: 160, height: 160 }}>
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="12" />
          <circle cx="80" cy="80" r={r} fill="none" stroke={color} strokeWidth="12"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)}
            strokeLinecap="round" transform="rotate(-90 80 80)"
            style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1), stroke 0.5s" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 38, fontWeight: 800, color, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 2, textTransform: "uppercase", marginTop: 4 }}>/ 100</span>
        </div>
      </div>
      <div style={{ marginTop: 10, fontSize: 14, fontWeight: 600, color }}>{label}</div>
    </div>
  );
}

const severityMeta = {
  error:   { color: "#f04a6e", Icon: AlertCircle   },
  warning: { color: "#f0c44a", Icon: AlertTriangle },
  info:    { color: "#4ac8f0", Icon: Info          },
};

export default function WritingAssistant() {
  const location = useLocation();
  const initialTab = location.state?.tab || "grammar";

  const [text, setText]                 = useState("");
  const [activeTab, setActiveTab]       = useState(initialTab);
  const [selectedTone, setSelectedTone] = useState("formal");
  const [loading, setLoading]           = useState(false);
  const [result, setResult]             = useState(null);
  const [error, setError]               = useState(null);
  const [charCount, setCharCount]       = useState(0);
  const [copied, setCopied]             = useState(false);

  useEffect(() => { setCharCount(text.length); }, [text]);

  const copyText = (str) => {
    navigator.clipboard.writeText(str);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const callAPI = useCallback(async (prompt, systemPrompt) => {
    const res = await fetch(ANTHROPIC_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await res.json();
    return data.content?.map(b => b.text || "").join("") || "";
  }, []);

  const handleRun = async () => {
    if (!text.trim()) { setError("Please enter some text first."); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      if (activeTab === "grammar") {
        const raw = await callAPI(
          `Analyze this text for grammar, spelling, and writing improvements. Return ONLY valid JSON with no extra text:
{"grammarIssues":[{"issue":string,"suggestion":string,"severity":"error"|"warning"|"info"}],"spellingErrors":[{"word":string,"suggestion":string}],"improvements":[string],"correctedText":string}
Text: "${text}"`,
          "You are a precise grammar analysis engine. Return only raw JSON, no markdown, no backticks, no explanation."
        );
        const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
        parsed.grammarIssues   = toArray(parsed.grammarIssues);
        parsed.spellingErrors  = toArray(parsed.spellingErrors);
        parsed.improvements    = toArray(parsed.improvements);
        setResult({ type: "grammar", data: parsed });

      } else if (activeTab === "paraphrase") {
        const raw = await callAPI(
          `Paraphrase in a ${selectedTone} tone, reducing plagiarism. Return ONLY valid JSON with no extra text:
{"paraphrased":string,"toneApplied":string,"changes":[string]}
Text: "${text}"`,
          "You are a paraphrasing expert. Return only raw JSON, no markdown, no backticks, no explanation."
        );
        const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
        parsed.changes = toArray(parsed.changes);
        setResult({ type: "paraphrase", data: parsed });

      } else if (activeTab === "clarity") {
        const raw = await callAPI(
          `Analyze the clarity and readability of the following text. Return ONLY a raw JSON object with no extra text, no markdown, no backticks.
Use exactly these keys:
{
  "score": <integer 0-100>,
  "readabilityLevel": <string like "Easy", "Intermediate", "Advanced">,
  "overallFeedback": <string>,
  "sentenceAnalysis": [
    { "sentence": <string>, "clarity": <"clear" or "complex" or "confusing">, "tip": <string> }
  ]
}
Text: "${text}"`,
          "You are a readability expert. Return only a raw JSON object. No markdown. No backticks. No explanation. No extra keys."
        );
        const cleaned = raw.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        // Normalize score to integer
        parsed.score = Math.min(100, Math.max(0, parseInt(parsed.score, 10) || 0));
        // Normalize sentenceAnalysis — handle alternate key names Groq might use
        let sa = toArray(parsed.sentenceAnalysis || parsed.sentence_analysis || parsed.sentences || []);
        parsed.sentenceAnalysis = sa.map(s => ({
          sentence: s.sentence || s.text || s.content || "",
          clarity:  (s.clarity || s.level || s.type || "clear").toLowerCase(),
          tip:      s.tip || s.suggestion || s.feedback || "",
        }));
        setResult({ type: "clarity", data: parsed });

      } else if (activeTab === "compare") {
        const raw = await callAPI(
          `Correct all grammar, spelling and writing issues in this text. Return ONLY valid JSON with no extra text:
{"correctedText":string,"changeCount":number,"summary":string}
Text: "${text}"`,
          "You are a grammar correction engine. Return only raw JSON, no markdown, no backticks, no explanation."
        );
        const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
        const { aParts, bParts } = diffWords(text, parsed.correctedText);
        setResult({ type: "compare", original: text, corrected: parsed.correctedText, aParts, bParts, summary: parsed.summary, changeCount: parsed.changeCount });
      }
    } catch (e) {
      setError("Analysis failed — please try again.");
      console.error(e);
    }
    setLoading(false);
  };

  const runLabel = { grammar: "Check Grammar", paraphrase: "Paraphrase", clarity: "Score Clarity", compare: "Correct & Compare" }[activeTab];
  const RunIcon  = { grammar: CheckCircle, paraphrase: RefreshCw, clarity: Target, compare: GitCompare }[activeTab];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0c", fontFamily: "'DM Sans', sans-serif", color: "#fff", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@400;500;700&display=swap');
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse   { 0%,100%{opacity:0.3} 50%{opacity:0.65} }
        @keyframes gridMove{ from{transform:translateY(0)} to{transform:translateY(60px)} }
        textarea:focus { outline: none; }
        textarea::placeholder { color: rgba(255,255,255,0.18); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(200,240,74,0.25); border-radius: 2px; }
        .tab-btn:hover   { background: rgba(255,255,255,0.06) !important; }
        .run-btn:hover   { transform: translateY(-1px); box-shadow: 0 10px 36px rgba(200,240,74,0.3) !important; }
        .tone-card:hover { border-color: rgba(200,240,74,0.35) !important; background: rgba(200,240,74,0.06) !important; }
        .result-card     { animation: fadeUp 0.35s cubic-bezier(0.4,0,0.2,1); }
        .sec-btn:hover   { border-color: rgba(255,255,255,0.22) !important; color: rgba(255,255,255,0.75) !important; }
        .copy-btn:hover  { background: rgba(200,240,74,0.08) !important; }
      `}</style>

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: `linear-gradient(rgba(200,240,74,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(200,240,74,0.035) 1px, transparent 1px)`, backgroundSize: "60px 60px", animation: "gridMove 10s linear infinite" }} />
      <div style={{ position: "fixed", top: "-15%", right: "-8%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,240,74,0.07) 0%, transparent 68%)", pointerEvents: "none", zIndex: 0 }} />

      <Navbar />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg, #c8f04a, #74e06a)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PenLine size={17} color="#0a0a0c" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#c8f04a", fontFamily: "'DM Mono', monospace" }}>Writing Assistant</span>
          </div>
          <h1 style={{ fontSize: "clamp(26px,5vw,38px)", fontWeight: 800, margin: 0, letterSpacing: -1.5, lineHeight: 1.15, background: "linear-gradient(140deg, #ffffff 55%, rgba(200,240,74,0.75))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Write Better,<br />Communicate Clearly.
          </h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 14, marginTop: 10 }}>Grammar · Paraphrasing · Clarity scoring · Version comparison</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 5, marginBottom: 22, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 5, flexWrap: "wrap" }}>
          {featureTabs.map(({ id, label, Icon }) => (
            <button key={id} className="tab-btn"
              onClick={() => { setActiveTab(id); setResult(null); setError(null); }}
              style={{ flex: 1, minWidth: 110, padding: "9px 12px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", transition: "all 0.18s", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: activeTab === id ? "rgba(200,240,74,0.13)" : "transparent", color: activeTab === id ? "#c8f04a" : "rgba(255,255,255,0.45)", borderBottom: activeTab === id ? "2px solid #c8f04a" : "2px solid transparent" }}>
              <Icon size={14} strokeWidth={2.2} />{label}
            </button>
          ))}
        </div>

        {/* Tone selector */}
        {activeTab === "paraphrase" && (
          <div style={{ marginBottom: 20, animation: "fadeUp 0.28s ease" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Select Tone</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
              {toneOptions.map(({ id, label, Icon, desc }) => (
                <button key={id} className="tone-card" onClick={() => setSelectedTone(id)}
                  style={{ padding: "14px 10px", borderRadius: 12, cursor: "pointer", border: `1px solid ${selectedTone === id ? "#c8f04a" : "rgba(255,255,255,0.08)"}`, background: selectedTone === id ? "rgba(200,240,74,0.1)" : "rgba(255,255,255,0.025)", color: selectedTone === id ? "#c8f04a" : "rgba(255,255,255,0.55)", textAlign: "center", transition: "all 0.18s", fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <Icon size={18} strokeWidth={1.8} />
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{label}</div>
                  <div style={{ fontSize: 10, opacity: 0.55, lineHeight: 1.3 }}>{desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Compare hint */}
        {activeTab === "compare" && !result && (
          <div style={{ marginBottom: 14, padding: "12px 16px", borderRadius: 12, background: "rgba(200,240,74,0.07)", border: "1px solid rgba(200,240,74,0.2)", fontSize: 13, color: "rgba(200,240,74,0.85)", display: "flex", alignItems: "center", gap: 8, animation: "fadeUp 0.28s ease" }}>
            <GitCompare size={14} />
            Paste your text below. The AI will correct it and show both versions side by side with every change highlighted.
          </div>
        )}

        {/* Textarea */}
        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16, overflow: "hidden", marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>
              {activeTab === "compare" ? "Your text (with errors)" : "Your text"}
            </span>
            <span style={{ fontSize: 11, color: charCount > 0 ? "rgba(200,240,74,0.65)" : "rgba(255,255,255,0.18)", fontFamily: "'DM Mono', monospace" }}>{charCount} chars</span>
          </div>
          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder={
              activeTab === "grammar"    ? "Paste or type your text here to check grammar and spelling..." :
              activeTab === "paraphrase" ? "Enter the text you'd like to paraphrase with the selected tone..." :
              activeTab === "clarity"    ? "Enter your text to receive a detailed clarity and readability score..." :
              "Paste your incorrect text here — the AI will correct it and highlight every change side by side..."
            }
            style={{ width: "100%", minHeight: 180, padding: "16px", background: "transparent", border: "none", color: "rgba(255,255,255,0.82)", fontSize: 14, lineHeight: 1.78, resize: "vertical", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" }}
          />
        </div>

        {/* CTA */}
        <div style={{ display: "flex", gap: 10, marginBottom: 32, alignItems: "center" }}>
          <button className="run-btn" onClick={handleRun} disabled={loading}
            style={{ padding: "12px 26px", borderRadius: 12, border: "none", background: loading ? "rgba(200,240,74,0.15)" : "linear-gradient(135deg, #c8f04a, #8ee04a)", color: loading ? "rgba(255,255,255,0.25)" : "#0a0a0c", fontWeight: 700, fontSize: 13, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s", boxShadow: "0 4px 20px rgba(200,240,74,0.18)" }}>
            {loading ? <><Spinner /><span>Analyzing...</span></> : <><RunIcon size={15} strokeWidth={2.5} /><span>{runLabel}</span></>}
          </button>
          {text && (
            <button className="sec-btn" onClick={() => { setText(""); setResult(null); setError(null); }}
              style={{ padding: "12px 18px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.09)", background: "transparent", color: "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif", transition: "all 0.18s" }}>
              Clear
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: "13px 16px", borderRadius: 12, marginBottom: 20, background: "rgba(240,74,110,0.1)", border: "1px solid rgba(240,74,110,0.25)", color: "#f04a6e", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={15} />{error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="result-card">

            {/* GRAMMAR */}
            {result.type === "grammar" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {result.data.correctedText && (
                  <div style={{ background: "rgba(200,240,74,0.07)", border: "1px solid rgba(200,240,74,0.18)", borderRadius: 14, padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, fontWeight: 700, color: "#c8f04a", letterSpacing: 2, textTransform: "uppercase" }}>
                        <CheckCheck size={13} /> Corrected Text
                      </div>
                      <button className="copy-btn" onClick={() => copyText(result.data.correctedText)}
                        style={{ padding: "6px 12px", borderRadius: 7, border: "1px solid rgba(200,240,74,0.3)", background: "transparent", color: "#c8f04a", cursor: "pointer", fontSize: 11, fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 5, transition: "background 0.15s" }}>
                        <Copy size={11} />{copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.8, color: "rgba(255,255,255,0.85)", margin: 0 }}>{result.data.correctedText}</p>
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 18 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Grammar Issues</div>
                    {result.data.grammarIssues.length ? result.data.grammarIssues.map((g, i) => {
                      const meta = severityMeta[g.severity] || severityMeta.warning;
                      return (
                        <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 7, marginBottom: 5 }}>
                            <meta.Icon size={13} color={meta.color} style={{ marginTop: 2, flexShrink: 0 }} />
                            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: 500, lineHeight: 1.4 }}>{g.issue}</span>
                          </div>
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", paddingLeft: 20, display: "flex", alignItems: "center", gap: 5 }}>
                            <ArrowRight size={10} />{g.suggestion}
                          </div>
                        </div>
                      );
                    }) : <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "rgba(200,240,74,0.7)" }}><CheckCircle size={14} /> No grammar issues found</div>}
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 18 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>Spelling Errors</div>
                    {result.data.spellingErrors.length ? result.data.spellingErrors.map((s, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, padding: "8px 12px", background: "rgba(240,74,110,0.07)", borderRadius: 8 }}>
                        <span style={{ fontSize: 13, color: "#f04a6e", fontFamily: "'DM Mono', monospace", textDecoration: "line-through" }}>{s.word}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <ArrowRight size={11} color="rgba(255,255,255,0.22)" />
                          <span style={{ fontSize: 13, color: "#c8f04a", fontFamily: "'DM Mono', monospace" }}>{s.suggestion}</span>
                        </div>
                      </div>
                    )) : <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "rgba(200,240,74,0.7)" }}><CheckCircle size={14} /> No spelling errors</div>}
                  </div>
                </div>
                {result.data.improvements.length > 0 && (
                  <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 18 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Writing Improvements</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                      {result.data.improvements.map((imp, i) => (
                        <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <ChevronRight size={14} color="#c8f04a" style={{ marginTop: 3, flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.68)", lineHeight: 1.6 }}>{imp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PARAPHRASE */}
            {result.type === "paraphrase" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ background: "rgba(200,240,74,0.07)", border: "1px solid rgba(200,240,74,0.18)", borderRadius: 14, padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11, fontWeight: 700, color: "#c8f04a", letterSpacing: 2, textTransform: "uppercase" }}>
                      <Sparkles size={13} /> Paraphrased · {result.data.toneApplied} tone
                    </div>
                    <button className="copy-btn" onClick={() => copyText(result.data.paraphrased)}
                      style={{ padding: "6px 12px", borderRadius: 7, border: "1px solid rgba(200,240,74,0.3)", background: "transparent", color: "#c8f04a", cursor: "pointer", fontSize: 11, fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 5, transition: "background 0.15s" }}>
                      <Copy size={11} />{copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: "rgba(255,255,255,0.85)", margin: 0 }}>{result.data.paraphrased}</p>
                </div>
                {result.data.changes.length > 0 && (
                  <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 18 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>What Changed</div>
                    {result.data.changes.map((c, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                        <ChevronRight size={13} color="#4ac8f0" style={{ marginTop: 3, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.62)", lineHeight: 1.5 }}>{c}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CLARITY */}
            {result.type === "clarity" && (
              <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 14, alignItems: "start" }}>
                <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 10 }}>
                  <ClarityMeter score={isNaN(result.data.score) ? 0 : result.data.score} />
                  <div style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.4)", paddingBottom: 8 }}>
                    Level: <span style={{ color: "#fff", fontWeight: 600 }}>{result.data.readabilityLevel}</span>
                  </div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 18, alignSelf: "stretch" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Overall Feedback</div>
                  <p style={{ fontSize: 14, lineHeight: 1.8, color: "rgba(255,255,255,0.72)", margin: "0 0 18px" }}>{result.data.overallFeedback}</p>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Sentence Breakdown</div>
                  {result.data.sentenceAnalysis.slice(0, 4).map((s, i) => {
                    const col = s.clarity === "clear" ? "#c8f04a" : s.clarity === "complex" ? "#f0c44a" : "#f04a6e";
                    return (
                      <div key={i} style={{ marginBottom: 10, padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 8, borderLeft: `3px solid ${col}` }}>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 5, fontStyle: "italic" }}>"{s.sentence.slice(0, 80)}{s.sentence.length > 80 ? "..." : ""}"</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", display: "flex", alignItems: "center", gap: 5 }}>
                          <ArrowRight size={10} />{s.tip}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* COMPARE */}
            {result.type === "compare" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ padding: "8px 16px", borderRadius: 20, background: "rgba(240,74,110,0.1)", border: "1px solid rgba(240,74,110,0.25)", fontSize: 12, color: "#f07090", display: "flex", alignItems: "center", gap: 6 }}>
                    <AlertCircle size={12} /> {result.changeCount || "Some"} changes detected
                  </div>
                  {result.summary && (
                    <div style={{ padding: "8px 16px", borderRadius: 20, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                      {result.summary}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 3, background: "rgba(240,74,110,0.25)", border: "1px solid #f04a6e" }} /> Incorrect word
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: 3, background: "rgba(200,240,74,0.2)", border: "1px solid #c8f04a" }} /> Corrected word
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(240,74,110,0.2)", borderRadius: 14, overflow: "hidden" }}>
                    <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(240,74,110,0.15)", display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f04a6e", flexShrink: 0 }} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#f07090", letterSpacing: 2, textTransform: "uppercase" }}>Original</span>
                    </div>
                    <div style={{ padding: 18 }}>
                      <HighlightedText parts={result.aParts} side="original" />
                    </div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(200,240,74,0.2)", borderRadius: 14, overflow: "hidden" }}>
                    <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(200,240,74,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#c8f04a", flexShrink: 0 }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#c8f04a", letterSpacing: 2, textTransform: "uppercase" }}>Corrected</span>
                      </div>
                      <button className="copy-btn" onClick={() => copyText(result.corrected)}
                        style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid rgba(200,240,74,0.3)", background: "transparent", color: "#c8f04a", cursor: "pointer", fontSize: 11, fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 4, transition: "background 0.15s" }}>
                        <Copy size={10} />{copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <div style={{ padding: 18 }}>
                      <HighlightedText parts={result.bParts} side="corrected" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && !error && (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "rgba(255,255,255,0.12)" }}>
            <PenLine size={36} style={{ animation: "pulse 3s ease infinite", marginBottom: 12 }} />
            <p style={{ fontSize: 14, margin: 0 }}>Enter your text and select a feature to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}