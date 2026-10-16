import { useState } from "react";
import { Key, CheckCircle2, XCircle, X, ShieldCheck, Zap } from "lucide-react";
import GeminiService from "../services/GeminiService";

export default function ApiKeyModal({ isOpen, onClose, onSave }) {
  const [geminiKey, setGeminiKey] = useState(GeminiService.getApiKey());
  const [groqKey, setGroqKey] = useState(GeminiService.getGroqKey());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // 'success' | 'error' | null
  const [providerConnected, setProviderConnected] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!geminiKey.trim() && !groqKey.trim()) {
      setTestResult("error");
      setErrorMessage("Please enter at least one API key (Gemini or Groq).");
      return;
    }
    setTesting(true);
    setTestResult(null);
    setErrorMessage("");

    GeminiService.setApiKey(geminiKey);
    GeminiService.setGroqKey(groqKey);

    try {
      const res = await GeminiService.testConnection();
      if (res && res.ok) {
        setTestResult("success");
        setProviderConnected(`${res.provider} (${res.model})`);
      } else {
        setTestResult("error");
        setErrorMessage("Connection was established but the model response was unexpected.");
      }
    } catch (err) {
      setTestResult("error");
      setErrorMessage(err.message || "Invalid API key or network error.");
    } finally {
      setTesting(false);
    }
  };

  const handleClose = () => {
    GeminiService.setApiKey(geminiKey);
    GeminiService.setGroqKey(groqKey);
    if (onSave) onSave(geminiKey);
    onClose();
  };

  return (
    <div className="modal modal-open backdrop-blur-xs z-50">
      <div className="modal-box bg-white border border-[#EAE5D9] max-w-lg rounded-3xl p-6 relative shadow-2xl overflow-hidden">
        <div className="naga-weave-strip absolute top-0 left-0 right-0"></div>

        {/* Header */}
        <div className="flex justify-between items-center mb-5 pt-2">
          <div className="flex items-center gap-2">
            <Key className="text-[#DC143C]" size={20} />
            <h2 className="text-xl font-black text-[#1C1917]">Multi-Provider AI Keys</h2>
          </div>
          <button
            className="btn btn-sm btn-circle btn-ghost text-[#57534E] hover:text-[#1C1917]"
            onClick={handleClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4">
          <p className="text-xs text-[#2A3B30] leading-relaxed font-medium">
            NagaQuest supports high-availability dual AI providers with automatic failover between <strong>Google Gemini</strong> and <strong>Groq</strong>.
          </p>

          {/* Gemini Key Input */}
          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text text-xs font-bold text-[#1E3A2B] flex items-center gap-1.5">
                <Key size={13} className="text-[#DC143C]" /> Google Gemini API Key(s)
              </span>
              <span className="text-[10px] text-neutral-400">Comma-separated for auto-rotation</span>
            </label>
            <input
              type="password"
              placeholder="Paste Gemini keys (AQ.Ab8...)"
              value={geminiKey}
              onChange={(e) => {
                setGeminiKey(e.target.value);
                setTestResult(null);
              }}
              className="input input-bordered w-full bg-[#FAF7F2] border-[#EAE5D9] focus:border-[#DC143C] rounded-xl text-xs font-mono text-[#1C1917]"
            />
          </div>

          {/* Groq Key Input */}
          <div className="form-control w-full">
            <label className="label py-1">
              <span className="label-text text-xs font-bold text-[#1E3A2B] flex items-center gap-1.5">
                <Zap size={13} className="text-amber-600" /> Groq API Key (High-Speed Failover)
              </span>
              <span className="text-[10px] text-amber-700 font-medium">qwen/qwen3.8-27b</span>
            </label>
            <input
              type="password"
              placeholder="Paste Groq key (gsk_...)"
              value={groqKey}
              onChange={(e) => {
                setGroqKey(e.target.value);
                setTestResult(null);
              }}
              className="input input-bordered w-full bg-[#FAF7F2] border-[#EAE5D9] focus:border-amber-600 rounded-xl text-xs font-mono text-[#1C1917]"
            />
          </div>

          {/* Test Status Banner */}
          {testResult === "success" && (
            <div className="alert bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl flex items-start gap-3 py-3 shadow-xs">
              <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="font-bold text-xs text-emerald-950">Connection Active & Verified!</p>
                <p className="text-[11px] text-emerald-800">
                  Successfully connected via <strong>{providerConnected}</strong>.
                </p>
              </div>
            </div>
          )}

          {testResult === "error" && (
            <div className="alert bg-red-50 border border-red-300 text-red-900 rounded-2xl flex items-start gap-3 py-3 shadow-xs">
              <XCircle className="text-red-600 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="font-bold text-xs text-red-950">Connection Check Failed</p>
                <p className="text-[11px] text-red-800">{errorMessage}</p>
              </div>
            </div>
          )}

          <div className="alert bg-[#E8F0EC] border border-[#1E3A2B]/20 items-start gap-2.5 rounded-2xl py-2.5">
            <ShieldCheck className="text-[#1E3A2B] shrink-0 mt-0.5" size={16} />
            <span className="text-[11px] text-[#2A3B30] leading-tight font-medium">
              Keys are stored securely in your browser's client-side storage and never redistributed.
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="modal-action justify-between items-center mt-6 pt-3 border-t border-[#EAE5D9]">
          <button className="btn btn-sm bg-[#FAF7F2] border-[#EAE5D9] text-[#57534E] hover:bg-[#EAE5D9] font-bold rounded-xl text-xs" onClick={handleClose}>
            Close
          </button>
          <div className="flex gap-2">
            <button
              className="btn btn-sm bg-[#1E3A2B] hover:bg-[#162E22] text-white border-0 font-bold rounded-xl text-xs gap-1.5"
              onClick={handleTest}
              disabled={testing}
            >
              {testing ? <span className="loading loading-spinner loading-xs text-white"></span> : null}
              {testing ? "Testing Providers..." : "Test Connection"}
            </button>
            <button
              className="btn btn-sm bg-[#DC143C] hover:bg-[#B91C1C] text-white border-0 font-bold rounded-xl text-xs"
              onClick={handleClose}
            >
              Save Keys
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop bg-black/50 cursor-pointer" onClick={handleClose}></div>
    </div>
  );
}
