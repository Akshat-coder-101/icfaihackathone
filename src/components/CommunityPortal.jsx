import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  ShieldCheck,
  PlusCircle,
  UserCheck,
  CheckCircle,
  AlertTriangle,
  History,
  RotateCcw,
  Lock,
  Check,
  X,
  BookOpen,
  Languages,
  Compass
} from "lucide-react";
import archiveStore from "../services/archiveStore";
import NagaWeavingDivider from "./NagaWeavingDivider";

export default function CommunityPortal() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || "contribute"); // 'contribute' | 'review' | 'stewardship' | 'audit' | 'principles'
  const [currentRole, setCurrentRole] = useState(() => archiveStore.getCurrentRole());

  // Contribution Form State
  const [contribType, setContribType] = useState(location.state?.preselectType || "story"); // 'story' | 'phrase' | 'object'
  const [tribeName, setTribeName] = useState("Chang");
  const [title, setTitle] = useState("");
  const [contributorName, setContributorName] = useState("");
  const [storytellerBio, setStorytellerBio] = useState("");
  const [originalLanguage, setOriginalLanguage] = useState("Chang");
  const [transcriptOriginal, setTranscriptOriginal] = useState("");
  const [transcriptTranslated, setTranscriptTranslated] = useState("");
  const [culturalContext, setCulturalContext] = useState("");
  const [accessLevel, setAccessLevel] = useState("public"); // 'public' | 'community_only' | 'private'
  const [attributionRequirement, setAttributionRequirement] = useState("");
  const [consentOnRecord, setConsentOnRecord] = useState(false);
  const [consentNotes, setConsentNotes] = useState("");
  const [objectCategory, setObjectCategory] = useState("textile");
  const [objectUsage, setObjectUsage] = useState("");
  const [meaning, setMeaning] = useState("");
  const [pronunciationGuide, setPronunciationGuide] = useState("");

  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");

  // Reviewer Dashboard State
  const [pendingStories, setPendingStories] = useState(() => archiveStore.getAllStories(true));
  const [pendingPhrases, setPendingPhrases] = useState(() => archiveStore.getAllPhrases(true));
  const [pendingObjects, setPendingObjects] = useState(() => archiveStore.getAllHeritageObjects(true));
  const [reviewerName, setReviewerName] = useState("Elder Reviewer (Tuensang / Mon)");
  const [reviewerNotes, setReviewerNotes] = useState("");

  // Stewardship & Withdrawal State
  const [withdrawalId, setWithdrawalId] = useState("");
  const [withdrawalRequester, setWithdrawalRequester] = useState("");
  const [withdrawalReason, setWithdrawalReason] = useState("");
  const [withdrawalSuccess, setWithdrawalSuccess] = useState("");

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState(() => archiveStore.getAuditLog());

  const tribes = [
    "Chang", "Ao", "Angami", "Chakhesang", "Konyak", "Lotha", 
    "Phom", "Pochury", "Rengma", "Sangtam", "Sumi", "Yimkhiung", "Zeliang"
  ];

  const refreshPortalData = () => {
    setCurrentRole(archiveStore.getCurrentRole());
    setPendingStories(archiveStore.getAllStories(true));
    setPendingPhrases(archiveStore.getAllPhrases(true));
    setPendingObjects(archiveStore.getAllHeritageObjects(true));
    setAuditLogs(archiveStore.getAuditLog());
  };

  useEffect(() => {
    const unsub = archiveStore.subscribe(refreshPortalData);
    return () => unsub();
  }, []);

  const handleRoleChange = (newRole) => {
    archiveStore.setCurrentRole(newRole);
    setCurrentRole(newRole);
  };

  const handleContributionSubmit = (e) => {
    e.preventDefault();
    setFormSuccess("");
    setFormError("");

    try {
      if (!consentOnRecord) {
        throw new Error("PRD Mandate: Explicit Contributor/Storyteller Consent is required to proceed.");
      }
      if (!attributionRequirement.trim()) {
        throw new Error("PRD Mandate: Attribution Requirement must be stated.");
      }

      if (contribType === "story") {
        archiveStore.submitStory({
          title,
          tribeName,
          contributedBy: contributorName,
          storytellerName: contributorName,
          storytellerBio,
          originalLanguage,
          transcriptOriginal,
          transcriptTranslated,
          culturalContext,
          accessLevel,
          attributionRequirement,
          consentOnRecord,
          consentNotes
        });
        setFormSuccess(`Oral story "${title}" submitted successfully! Review status is unconditionally set to "pending" per community protocol.`);
      } else if (contribType === "phrase") {
        archiveStore.submitPhrase({
          languageVariety: tribeName,
          originalExpression: title,
          meaning,
          pronunciationGuide,
          context: culturalContext,
          contributedBy: contributorName,
          accessLevel
        });
        setFormSuccess(`Phrase "${title}" submitted successfully for language review.`);
      } else if (contribType === "object") {
        archiveStore.submitHeritageObject({
          title,
          tribeName,
          category: objectCategory,
          usage: objectUsage,
          explanation: culturalContext,
          providedBy: contributorName,
          accessLevel
        });
        setFormSuccess(`Heritage object "${title}" submitted successfully for review.`);
      }

      // Reset form
      setTitle("");
      setTranscriptOriginal("");
      setTranscriptTranslated("");
      setCulturalContext("");
      setMeaning("");
      setConsentOnRecord(false);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleReviewAction = (itemType, itemId, status) => {
    try {
      if (itemType === "story") {
        archiveStore.reviewStory(itemId, {
          status,
          reviewerName,
          reviewerNotes: reviewerNotes || `Status updated to ${status} by community elder.`
        });
      } else if (itemType === "phrase") {
        archiveStore.reviewPhrase(itemId, { status, reviewerName });
      } else if (itemType === "object") {
        archiveStore.reviewHeritageObject(itemId, { status, reviewerName });
      }
      setReviewerNotes("");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleWithdrawalSubmit = (e) => {
    e.preventDefault();
    setWithdrawalSuccess("");
    try {
      if (!withdrawalId || !withdrawalRequester || !withdrawalReason) {
        throw new Error("Item ID, Requester Name, and Reason are mandatory for withdrawal.");
      }
      // Check stories
      const story = archiveStore.getStoryById(withdrawalId);
      if (story) {
        archiveStore.withdrawStory(withdrawalId, withdrawalRequester, withdrawalReason);
        setWithdrawalSuccess(`Story "${story.title}" withdrawn immediately. Access level locked to "private".`);
        setWithdrawalId("");
        setWithdrawalReason("");
        return;
      }

      const obj = archiveStore.getHeritageObjectById(withdrawalId);
      if (obj) {
        archiveStore.withdrawHeritageObject(withdrawalId, withdrawalRequester, withdrawalReason);
        setWithdrawalSuccess(`Object "${obj.title}" withdrawn immediately. Access level locked to "private".`);
        setWithdrawalId("");
        setWithdrawalReason("");
        return;
      }

      throw new Error(`Record with ID "${withdrawalId}" not found in oral stories or heritage objects.`);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header */}
      <div className="bg-[#203E2D] text-white p-6 md:p-8 rounded-xl shadow-sm relative overflow-hidden border border-[#203E2D]">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#A45E45] text-white mb-4 shadow-2xs">
            Community Stewardship
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Community Custodianship & Review Workflow
          </h1>
          <p className="text-white/80 text-sm md:text-base leading-relaxed">
            The core mechanic of NagaQuest: <strong>Contribution → Consent → Documentation → Review → Publication → Stewardship & Withdrawal</strong>. No content is auto-published, and contributors retain full authority to correct or withdraw knowledge.
          </p>

          {/* Interactive Role Switcher Banner */}
          <div className="mt-5 p-3 rounded-lg bg-white/10 border border-white/20 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-medium flex items-center gap-1.5 text-white">
              <UserCheck size={15} className="text-[#C68A36]" /> Current Operating Role:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRoleChange("public")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  currentRole === "public"
                    ? "bg-[#C68A36] text-white shadow-xs"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                Learner / Public
              </button>
              <button
                onClick={() => handleRoleChange("contributor")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  currentRole === "contributor"
                    ? "bg-[#A45E45] text-white shadow-xs"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                Community Contributor
              </button>
              <button
                onClick={() => handleRoleChange("reviewer")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  currentRole === "reviewer"
                    ? "bg-white text-[#203E2D] shadow-xs"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                Designated Reviewer
              </button>
            </div>
          </div>
        </div>
      </div>

      <NagaWeavingDivider />

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E6E1D6] pb-2">
        <button
          onClick={() => setActiveTab("contribute")}
          className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "contribute"
              ? "bg-[#203E2D] text-white shadow-xs"
              : "bg-white text-[#57534E] hover:bg-[#FAF7F2] border border-[#E6E1D6]"
          }`}
        >
          <PlusCircle size={15} /> 1. Submit Knowledge with Consent
        </button>

        <button
          onClick={() => setActiveTab("review")}
          className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "review"
              ? "bg-[#203E2D] text-white shadow-xs"
              : "bg-white text-[#57534E] hover:bg-[#FAF7F2] border border-[#E6E1D6]"
          }`}
        >
          <ShieldCheck size={15} /> 2. Reviewer Verification Queue
          {pendingStories.filter((s) => s.reviewStatus === "pending").length > 0 && (
            <span className="editorial-tag text-xs font-mono bg-[#A45E45] text-white border-[#A45E45]">
              {pendingStories.filter((s) => s.reviewStatus === "pending").length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("stewardship")}
          className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "stewardship"
              ? "bg-[#203E2D] text-white shadow-xs"
              : "bg-white text-[#57534E] hover:bg-[#FAF7F2] border border-[#E6E1D6]"
          }`}
        >
          <RotateCcw size={15} /> 3. Stewardship & Immediate Withdrawal
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "audit"
              ? "bg-[#203E2D] text-white shadow-xs"
              : "bg-white text-[#57534E] hover:bg-[#FAF7F2] border border-[#E6E1D6]"
          }`}
        >
          <History size={15} /> 4. Audit Ledger
        </button>

        <button
          onClick={() => setActiveTab("principles")}
          className={`px-4 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "principles"
              ? "bg-[#203E2D] text-white shadow-xs"
              : "bg-white text-[#57534E] hover:bg-[#FAF7F2] border border-[#E6E1D6]"
          }`}
        >
          <BookOpen size={15} /> 5. Preservation Approach
        </button>
      </div>

      {/* TAB 1: CONTRIBUTION FORM (Mandatory Consent & Scoping) */}
      {activeTab === "contribute" && (
        <div className="editorial-card p-6 md:p-8 space-y-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#252B26] tracking-tight">
              Submit Cultural Knowledge for Community Review
            </h2>
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
              Every submission must record explicit consent, attribution instructions, and access permissions. Submissions are never published directly — designated elders and language boards review each item first.
            </p>
          </div>

          {formSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-700 shrink-0" />
              {formSuccess}
            </div>
          )}

          {formError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-900 text-xs font-bold flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-700 shrink-0" />
              {formError}
            </div>
          )}

          <form onSubmit={handleContributionSubmit} className="space-y-6">
            {/* Contribution Type Selection */}
            <div className="grid grid-cols-3 gap-3">
              <div
                onClick={() => setContribType("story")}
                className={`p-3 rounded-2xl cursor-pointer border text-center transition-all ${
                  contribType === "story"
                    ? "bg-[#1E3A2B] text-white border-[#1E3A2B]"
                    : "bg-[#FAF7F2] text-neutral-700 border-[#EAE5D9]"
                }`}
              >
                <BookOpen size={18} className="mx-auto mb-1" />
                <span className="text-xs font-bold">Oral Tradition</span>
              </div>
              <div
                onClick={() => setContribType("phrase")}
                className={`p-3 rounded-2xl cursor-pointer border text-center transition-all ${
                  contribType === "phrase"
                    ? "bg-[#1E3A2B] text-white border-[#1E3A2B]"
                    : "bg-[#FAF7F2] text-neutral-700 border-[#EAE5D9]"
                }`}
              >
                <Languages size={18} className="mx-auto mb-1" />
                <span className="text-xs font-bold">Language Phrase</span>
              </div>
              <div
                onClick={() => setContribType("object")}
                className={`p-3 rounded-2xl cursor-pointer border text-center transition-all ${
                  contribType === "object"
                    ? "bg-[#1E3A2B] text-white border-[#1E3A2B]"
                    : "bg-[#FAF7F2] text-neutral-700 border-[#EAE5D9]"
                }`}
              >
                <Compass size={18} className="mx-auto mb-1" />
                <span className="text-xs font-bold">Heritage Object</span>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Tribe / Community Scope *:
                </label>
                <select
                  value={tribeName}
                  onChange={(e) => setTribeName(e.target.value)}
                  className="select select-sm w-full bg-[#FAF7F2] border-[#EAE5D9] rounded-xl text-xs font-bold"
                >
                  {tribes.map((t) => (
                    <option key={t} value={t}>{t} Tribe</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Title or Original Expression *:
                </label>
                <input
                  type="text"
                  required
                  placeholder={contribType === "phrase" ? "e.g. Saung-ka ma?" : "e.g. Song of the Hao Morung"}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input input-sm w-full bg-[#FAF7F2] border-[#EAE5D9] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Contributor / Knowledge Holder Name *:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elder Imtichuba Chang / Chingmak K."
                  value={contributorName}
                  onChange={(e) => setContributorName(e.target.value)}
                  className="input input-sm w-full bg-[#FAF7F2] border-[#EAE5D9] rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Type Specific Fields */}
            {contribType === "story" && (
              <div className="space-y-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE5D9]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      Original Indigenous Dialect & Variety:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Chang (Sauchung dialect)"
                      value={originalLanguage}
                      onChange={(e) => setOriginalLanguage(e.target.value)}
                      className="input input-sm w-full bg-white border-[#EAE5D9] rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      Elder / Storyteller Bio:
                    </label>
                    <input
                      type="text"
                      placeholder="Clan elder, born in Tuensang, custodian of Morung oral hymns"
                      value={storytellerBio}
                      onChange={(e) => setStorytellerBio(e.target.value)}
                      className="input input-sm w-full bg-white border-[#EAE5D9] rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Verbatim Original Dialect Transcript:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter the original spoken phonetic words..."
                    value={transcriptOriginal}
                    onChange={(e) => setTranscriptOriginal(e.target.value)}
                    className="textarea w-full bg-white border-[#EAE5D9] rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    English Translation (Draft for Reviewer):
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter translated oral narrative..."
                    value={transcriptTranslated}
                    onChange={(e) => setTranscriptTranslated(e.target.value)}
                    className="textarea w-full bg-white border-[#EAE5D9] rounded-xl text-xs"
                  />
                </div>
              </div>
            )}

            {contribType === "phrase" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE5D9]">
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Meaning in English *:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. How are you? / Are you at peace?"
                    value={meaning}
                    onChange={(e) => setMeaning(e.target.value)}
                    className="input input-sm w-full bg-white border-[#EAE5D9] rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Syllable-by-syllable Pronunciation Guide:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sah-oong-kah mah?"
                    value={pronunciationGuide}
                    onChange={(e) => setPronunciationGuide(e.target.value)}
                    className="input input-sm w-full bg-white border-[#EAE5D9] rounded-xl text-xs"
                  />
                </div>
              </div>
            )}

            {contribType === "object" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE5D9]">
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Category:
                  </label>
                  <select
                    value={objectCategory}
                    onChange={(e) => setObjectCategory(e.target.value)}
                    className="select select-sm w-full bg-white border-[#EAE5D9] rounded-xl text-xs font-bold"
                  >
                    <option value="textile">Textile / Shawl</option>
                    <option value="instrument">Sacred Musical Instrument</option>
                    <option value="craft">Woodcarving / Basketry</option>
                    <option value="practice">Ritual / Festival Practice</option>
                    <option value="place">Sacred Site / Conservation Village</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Traditional Community Usage:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sounded during Naknyulem festival to alert clans"
                    value={objectUsage}
                    onChange={(e) => setObjectUsage(e.target.value)}
                    className="input input-sm w-full bg-white border-[#EAE5D9] rounded-xl text-xs"
                  />
                </div>
              </div>
            )}

            {/* Cultural Context */}
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">
                Cultural Context, Customary Restrictions & Meaning:
              </label>
              <textarea
                rows={2}
                placeholder="Explain the background, clans involved, sacred protocols, or taboo aspects..."
                value={culturalContext}
                onChange={(e) => setCulturalContext(e.target.value)}
                className="textarea w-full bg-[#FAF7F2] border-[#EAE5D9] rounded-xl text-xs"
              />
            </div>

            {/* Mandatory Consent & Governance Fields (PRD Principles 2, 5, 6) */}
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-300 space-y-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-900">
                <ShieldCheck size={16} className="text-amber-800" />
                Mandatory Consent & Access Control Protocol
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-neutral-800 block mb-1">
                    Intended Access Level *:
                  </label>
                  <select
                    value={accessLevel}
                    onChange={(e) => setAccessLevel(e.target.value)}
                    className="select select-sm w-full bg-white border-amber-300 rounded-xl text-xs font-bold"
                  >
                    <option value="public">Public (Anyone can view after approval)</option>
                    <option value="community_only">Community Only (Registered community members & reviewers)</option>
                    <option value="private">Private / Restricted (Contributor & assigned clan reviewers only)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-800 block mb-1">
                    Attribution Requirement *:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Attribution to Elder Imtichuba Chang and Tuensang Village required."
                    value={attributionRequirement}
                    onChange={(e) => setAttributionRequirement(e.target.value)}
                    className="input input-sm w-full bg-white border-amber-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-800 block mb-1">
                  Consent Documentation Notes:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Verbal consent recorded on August 14, 2026 before clan witness"
                  value={consentNotes}
                  onChange={(e) => setConsentNotes(e.target.value)}
                  className="input input-sm w-full bg-white border-amber-300 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={consentOnRecord}
                    onChange={(e) => setConsentOnRecord(e.target.checked)}
                    className="checkbox checkbox-sm checkbox-error mt-0.5"
                  />
                  <span className="text-xs font-bold text-neutral-800 leading-snug">
                    I verify that the storyteller/artisan has granted explicit consent for educational preservation, understands their right to request withdrawal at any time, and confirms this material does not violate sacred secret customary laws.
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#5C645E]">
                Submitted contributions are reviewed by community custodians before appearing publicly.
              </span>
              <button
                type="submit"
                className="btn btn-sm bg-[#203E2D] hover:bg-[#A45E45] text-white border-0 font-bold rounded-xl px-6 cursor-pointer transition-colors"
              >
                Submit for Community Review
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: REVIEWER QUEUE (Gated) */}
      {activeTab === "review" && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#EAE5D9] shadow-md space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EAE5D9] pb-4">
            <div>
              <h2 className="text-xl font-black text-[#1C1917] tracking-tight flex items-center gap-2">
                <ShieldCheck size={22} className="text-emerald-700" />
                Community Reviewer Verification Queue
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Designated elders, linguists, and cultural custodians verify submissions before publication.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-600">Reviewing as:</span>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="input input-xs bg-[#FAF7F2] border-[#EAE5D9] rounded-lg font-bold"
              />
            </div>
          </div>

          {currentRole !== "reviewer" && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-700" />
                You are currently viewing in <strong>{currentRole}</strong> mode. Switch to <strong>Designated Reviewer</strong> to perform official approval actions.
              </span>
              <button
                onClick={() => handleRoleChange("reviewer")}
                className="btn btn-xs bg-amber-700 text-white font-bold rounded-lg border-0"
              >
                Switch to Reviewer Role
              </button>
            </div>
          )}

          {/* Pending Stories Review List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600">
              Oral Stories Verification Ledger ({pendingStories.length})
            </h3>

            <div className="space-y-3">
              {pendingStories.map((story) => (
                <div
                  key={story.storyId}
                  className={`p-5 rounded-2xl border transition-all ${
                    story.reviewStatus === "pending"
                      ? "bg-amber-50/50 border-amber-300"
                      : story.reviewStatus === "approved"
                      ? "bg-emerald-50/30 border-emerald-200"
                      : "bg-neutral-50 border-neutral-300"
                  }`}
                >
                  <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#1E3A2B] text-white mr-2">
                        {story.tribeName}
                      </span>
                      <span className="font-bold text-sm text-[#1C1917]">{story.title}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-neutral-500">
                        Access: {story.accessLevel}
                      </span>
                      <span className={`badge text-xs font-bold uppercase ${
                        story.reviewStatus === "approved"
                          ? "bg-emerald-700 text-white"
                          : story.reviewStatus === "pending"
                          ? "bg-amber-600 text-white"
                          : "bg-red-700 text-white"
                      }`}>
                        {story.reviewStatus}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-700 leading-relaxed mb-3">
                    <strong>Storyteller:</strong> {story.storyteller?.name} • <strong>Contributed by:</strong> {story.contributedBy} ({new Date(story.contributedAt).toLocaleDateString()})
                  </p>

                  <div className="p-3 rounded-xl bg-white border border-[#EAE5D9] text-xs font-serif text-neutral-800 mb-3">
                    {story.transcriptTranslated}
                  </div>

                  {story.reviewerNotes && (
                    <div className="text-[11px] text-neutral-500 italic mb-3">
                      Reviewer Notes: "{story.reviewerNotes}" — by {story.reviewedBy}
                    </div>
                  )}

                  {/* Review Actions */}
                  {currentRole === "reviewer" && (
                    <div className="flex items-center justify-between pt-2 border-t border-[#EAE5D9]/70">
                      <input
                        type="text"
                        placeholder="Add reviewer notes or dialect corrections..."
                        value={reviewerNotes}
                        onChange={(e) => setReviewerNotes(e.target.value)}
                        className="input input-xs bg-white border-[#EAE5D9] rounded-lg text-xs w-64"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReviewAction("story", story.storyId, "approved")}
                          className="btn btn-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg border-0 gap-1"
                        >
                          <Check size={12} /> Approve Publication
                        </button>
                        <button
                          onClick={() => handleReviewAction("story", story.storyId, "needs_revision")}
                          className="btn btn-xs bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg border-0 gap-1"
                        >
                          Request Revision
                        </button>
                        <button
                          onClick={() => handleReviewAction("story", story.storyId, "rejected")}
                          className="btn btn-xs bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg border-0 gap-1"
                        >
                          <X size={12} /> Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Phrases Verification Queue */}
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 pt-4 border-t border-[#EAE5D9]">
              Language Phrasebook Submissions ({pendingPhrases.length})
            </h3>
            <div className="space-y-2">
              {pendingPhrases.slice(0, 5).map((p) => (
                <div key={p.entryId} className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EAE5D9] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#1C1917]">{p.originalExpression}</span> ({p.languageVariety}) — "{p.meaning}"
                    <span className="ml-2 text-[10px] text-neutral-500">by {p.contributedBy}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge badge-xs uppercase font-bold">{p.reviewStatus}</span>
                    {currentRole === "reviewer" && p.reviewStatus === "pending" && (
                      <button
                        onClick={() => handleReviewAction("phrase", p.entryId, "approved")}
                        className="btn btn-xs bg-emerald-700 text-white font-bold"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Heritage Objects Verification Queue */}
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-600 pt-4 border-t border-[#EAE5D9]">
              Heritage Object Submissions ({pendingObjects.length})
            </h3>
            <div className="space-y-2">
              {pendingObjects.slice(0, 5).map((o) => (
                <div key={o.objectId} className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EAE5D9] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#1C1917]">{o.title}</span> ({o.tribeName} - {o.category})
                    <span className="ml-2 text-[10px] text-neutral-500">by {o.providedBy}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge badge-xs uppercase font-bold">{o.reviewStatus}</span>
                    {currentRole === "reviewer" && o.reviewStatus === "pending" && (
                      <button
                        onClick={() => handleReviewAction("object", o.objectId, "approved")}
                        className="btn btn-xs bg-emerald-700 text-white font-bold"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STEWARDSHIP & IMMEDIATE WITHDRAWAL */}
      {activeTab === "stewardship" && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#EAE5D9] shadow-md space-y-6">
          <div>
            <h2 className="text-xl font-black text-[#1C1917] tracking-tight flex items-center gap-2">
              <RotateCcw size={22} className="text-[#DC143C]" />
              Stewardship & Reversible Publication Center
            </h2>
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
              Per NagaQuest Product Principle 5 (<em>"Publication is reversible. Contributors can request correction or withdrawal after the fact"</em>). Submitting a withdrawal immediately flips access level to <strong>private</strong> and logs the reason.
            </p>
          </div>

          {withdrawalSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-700" />
              {withdrawalSuccess}
            </div>
          )}

          <form onSubmit={handleWithdrawalSubmit} className="space-y-4 max-w-xl bg-[#FAF7F2] p-5 rounded-2xl border border-[#EAE5D9]">
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">
                Record ID to Withdraw (Story or Object ID) *:
              </label>
              <input
                type="text"
                required
                placeholder="e.g. story-chang-001 or obj-chang-001"
                value={withdrawalId}
                onChange={(e) => setWithdrawalId(e.target.value)}
                className="input input-sm w-full bg-white border-[#EAE5D9] rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">
                Requester / Contributor Name *:
              </label>
              <input
                type="text"
                required
                placeholder="Your name as recorded on contribution"
                value={withdrawalRequester}
                onChange={(e) => setWithdrawalRequester(e.target.value)}
                className="input input-sm w-full bg-white border-[#EAE5D9] rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">
                Reason for Withdrawal or Customary Revision *:
              </label>
              <textarea
                rows={3}
                required
                placeholder="Explain why the knowledge is being withdrawn (e.g. clan dispute, sacred restriction, incorrect lineage details)..."
                value={withdrawalReason}
                onChange={(e) => setWithdrawalReason(e.target.value)}
                className="textarea w-full bg-white border-[#EAE5D9] rounded-xl text-xs"
              />
            </div>

            <button
              type="submit"
              className="btn btn-sm bg-[#DC143C] hover:bg-[#B91C1C] text-white border-0 font-bold rounded-xl gap-2 shadow-xs"
            >
              <Lock size={14} /> Execute Immediate Withdrawal (Set Private)
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: IMMUTABLE AUDIT LOG */}
      {activeTab === "audit" && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#EAE5D9] shadow-md space-y-6">
          <div>
            <h2 className="text-xl font-black text-[#1C1917] tracking-tight flex items-center gap-2">
              <History size={22} className="text-[#1E3A2B]" />
              Immutable Community Review Audit Trail
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              Complete chronological audit trail documenting every submission, review status transition, and withdrawal action.
            </p>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE5D9] text-xs space-y-1"
              >
                <div className="flex items-center justify-between text-neutral-500 font-mono text-[11px]">
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                  <span className="badge badge-sm font-bold bg-[#1E3A2B] text-white uppercase">
                    {log.action}
                  </span>
                </div>
                <div className="font-bold text-[#1C1917]">
                  Actor: <span className="text-[#DC143C]">{log.actor}</span> • Target: <span className="font-mono">{log.targetId}</span> ({log.targetType})
                </div>
                <p className="text-neutral-600 leading-relaxed italic">
                  "{log.notes}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: OUR APPROACH TO CULTURAL PRESERVATION */}
      {activeTab === "principles" && (
        <div className="editorial-card p-6 md:p-8 space-y-6">
          <div className="border-b border-[#E6E1D6] pb-4">
            <h2 className="font-serif text-2xl font-bold text-[#252B26] tracking-tight">
              Our approach to cultural preservation
            </h2>
            <p className="text-xs text-[#5C645E] mt-1 leading-relaxed">
              NagaQuest is guided by six principles designed to support responsible cultural documentation and respect community authority.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <div className="p-5 rounded-xl bg-[#FAF7F2] border border-[#E6E1D6] space-y-2">
              <h3 className="font-serif text-base font-bold text-[#203E2D]">
                1. Clear distinction between community records and AI drafts
              </h3>
              <p className="text-xs text-[#5C645E] leading-relaxed">
                Records are clearly differentiated so readers always know whether content is based on community-verified field documentation, published historical references, or unreviewed AI research drafts.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#FAF7F2] border border-[#E6E1D6] space-y-2">
              <h3 className="font-serif text-base font-bold text-[#203E2D]">
                2. Consent, attribution, and usage permissions
              </h3>
              <p className="text-xs text-[#5C645E] leading-relaxed">
                Oral recordings and photographs require explicit contributor or storyteller consent. Knowledge holders specify how their stories are attributed and whether materials are shared publicly or within the community.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#FAF7F2] border border-[#E6E1D6] space-y-2">
              <h3 className="font-serif text-base font-bold text-[#203E2D]">
                3. Honest communication when information is unavailable
              </h3>
              <p className="text-xs text-[#5C645E] leading-relaxed">
                When the archive lacks documented information on a topic, the platform acknowledges the gap directly rather than generating speculative or fabricated cultural lore.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#FAF7F2] border border-[#E6E1D6] space-y-2">
              <h3 className="font-serif text-base font-bold text-[#203E2D]">
                4. Respect for distinct communities, languages, and traditions
              </h3>
              <p className="text-xs text-[#5C645E] leading-relaxed">
                Nagaland is home to diverse indigenous communities, each with distinct languages, dialects, customs, and Morung traditions. The platform preserves these identities without homogenization.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#FAF7F2] border border-[#E6E1D6] space-y-2">
              <h3 className="font-serif text-base font-bold text-[#203E2D]">
                5. Community rights to correct or withdraw contributed material
              </h3>
              <p className="text-xs text-[#5C645E] leading-relaxed">
                Publication is always reversible. Storytellers, clan custodians, and community contributors retain the right to update, correct, or request the immediate withdrawal of contributed records.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#FAF7F2] border border-[#E6E1D6] space-y-2">
              <h3 className="font-serif text-base font-bold text-[#203E2D]">
                6. Protection of restricted or sacred knowledge
              </h3>
              <p className="text-xs text-[#5C645E] leading-relaxed">
                Sacred customary lore, sensitive clan rituals, and private traditions default to restricted access levels, ensuring knowledge is preserved in accordance with community norms.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
