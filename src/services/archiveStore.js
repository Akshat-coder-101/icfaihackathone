// =====================================================================
// NAGAQUEST ARCHIVE STORE & GOVERNANCE STATE MACHINE
// Enforces 6-stage lifecycle:
// 1. Contribution -> 2. Consent -> 3. Documentation -> 4. Review ->
// 5. Publication -> 6. Stewardship & Withdrawal
// =====================================================================

import {
  INITIAL_ORAL_STORIES,
  INITIAL_PHRASEBOOK,
  INITIAL_HERITAGE_OBJECTS,
  INITIAL_AUDIT_LOG
} from "../data/archiveData";

const STORAGE_KEYS = {
  STORIES: "nagaquest_archive_stories_v4",
  PHRASES: "nagaquest_archive_phrases_v4",
  OBJECTS: "nagaquest_archive_objects_v4",
  AUDIT: "nagaquest_archive_audit_v4",
  ROLE: "nagaquest_user_role_v3",
  LEARNER_PROGRESS: "nagaquest_learner_progress_v3"
};

class ArchiveStore {
  constructor() {
    this._listeners = new Set();
    this._initStore();
  }

  _initStore() {
    // Stories
    const savedStories = localStorage.getItem(STORAGE_KEYS.STORIES);
    if (!savedStories) {
      localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(INITIAL_ORAL_STORIES));
    }
    // Phrases
    const savedPhrases = localStorage.getItem(STORAGE_KEYS.PHRASES);
    if (!savedPhrases) {
      localStorage.setItem(STORAGE_KEYS.PHRASES, JSON.stringify(INITIAL_PHRASEBOOK));
    }
    // Heritage Objects
    const savedObjects = localStorage.getItem(STORAGE_KEYS.OBJECTS);
    if (!savedObjects) {
      localStorage.setItem(STORAGE_KEYS.OBJECTS, JSON.stringify(INITIAL_HERITAGE_OBJECTS));
    }
    // Audit Log
    const savedAudit = localStorage.getItem(STORAGE_KEYS.AUDIT);
    if (!savedAudit) {
      localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(INITIAL_AUDIT_LOG));
    }
  }

  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  _notify() {
    this._listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error("ArchiveStore listener error:", err);
      }
    });
  }

  // -------------------------------------------------------------------
  // Role & Permissions
  // -------------------------------------------------------------------
  getCurrentRole() {
    return localStorage.getItem(STORAGE_KEYS.ROLE) || "public";
  }

  setCurrentRole(role) {
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
    this._notify();
  }

  canViewItem(item, role = this.getCurrentRole()) {
    if (!item) return false;
    // Reviewers can inspect everything including pending and private for review
    if (role === "reviewer") return true;

    // PRD v6 Section 5.2: sensitivity: review hides the card from public view until reviewed
    if (item.sensitivity === "review") {
      return role === "reviewer";
    }

    // Heritage objects with sensitivity: public are visible to learners/general public
    if (item.sensitivity === "public") {
      return true;
    }

    // Items must be approved to be visible to learners/general public
    if (item.reviewStatus && item.reviewStatus !== "approved") {
      // Contributors can see their own pending items
      if (role === "contributor") return true;
      return false;
    }

    // Access level gating
    if (!item.accessLevel || item.accessLevel === "public") return true;
    if (item.accessLevel === "community_only" && (role === "reviewer" || role === "contributor")) {
      return true;
    }
    if (item.accessLevel === "private") {
      return role === "reviewer";
    }
    return false;
  }

  // -------------------------------------------------------------------
  // Oral Stories Queries & Actions
  // -------------------------------------------------------------------
  getAllStories(includeAll = false) {
    const raw = localStorage.getItem(STORAGE_KEYS.STORIES);
    const stories = raw ? JSON.parse(raw) : INITIAL_ORAL_STORIES;
    if (includeAll) return stories;
    return stories.filter((s) => this.canViewItem(s));
  }

  getStoryById(storyId) {
    const stories = this.getAllStories(true);
    return stories.find((s) => s.storyId === storyId) || null;
  }

  submitStory(submission) {
    if (!submission.title || !submission.tribeName || !submission.contributedBy) {
      throw new Error("Missing required fields: Title, Tribe, and Contributor name are mandatory.");
    }
    if (!submission.attributionRequirement) {
      throw new Error("Consent requirement: Attribution Requirement must be specified.");
    }
    if (!submission.consentOnRecord) {
      throw new Error("Consent requirement: Storyteller / Community consent must be explicitly granted on record.");
    }

    const stories = this.getAllStories(true);
    const newStory = {
      storyId: `story-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      tribeId: (submission.tribeName || "chang").toLowerCase().replace(/\s+/g, "-"),
      tribeName: submission.tribeName,
      dataStatus: submission.dataStatus || "illustrative",
      title: submission.title.trim(),
      originalLanguage: submission.originalLanguage || "Indigenous Dialect",
      audioUrl: submission.audioUrl || "",
      audioDuration: submission.audioDuration || "Audio on file",
      videoUrl: submission.videoUrl || "",
      transcriptOriginal: submission.transcriptOriginal || "",
      transcriptTranslated: submission.transcriptTranslated || "",
      translationReviewedBy: submission.translationReviewedBy || "Pending Review",
      storyteller: {
        name: submission.storytellerName || submission.contributedBy,
        bio: submission.storytellerBio || "Community knowledge holder.",
        consentOnRecord: true,
        consentNotes: submission.consentNotes || "Consent verified at contribution time."
      },
      culturalContext: submission.culturalContext || "",
      contributedBy: submission.contributedBy,
      contributedAt: new Date().toISOString(),
      reviewStatus: "pending", // Unconditionally pending — no auto-publish
      reviewedBy: null,
      reviewedAt: null,
      reviewerNotes: null,
      accessLevel: submission.accessLevel || "public",
      attributionRequirement: submission.attributionRequirement
    };

    stories.unshift(newStory);
    localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories));

    this._recordAudit({
      action: "contribute",
      targetType: "story",
      targetId: newStory.storyId,
      actor: newStory.contributedBy,
      notes: `New oral story submitted for ${newStory.tribeName}: "${newStory.title}". Status: Pending review.`
    });

    this._notify();
    return newStory;
  }

  reviewStory(storyId, { status, reviewerName, reviewerNotes }) {
    const stories = this.getAllStories(true);
    const index = stories.findIndex((s) => s.storyId === storyId);
    if (index === -1) throw new Error("Story not found.");

    stories[index] = {
      ...stories[index],
      reviewStatus: status,
      reviewedBy: reviewerName || "Designated Community Reviewer",
      reviewedAt: new Date().toISOString(),
      reviewerNotes: reviewerNotes || ""
    };

    localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories));

    this._recordAudit({
      action: `review_${status}`,
      targetType: "story",
      targetId: storyId,
      actor: reviewerName || "Designated Community Reviewer",
      notes: `Review status changed to ${status}. Notes: ${reviewerNotes || "None"}`
    });

    this._notify();
    return stories[index];
  }

  withdrawStory(storyId, requesterName, reason) {
    const stories = this.getAllStories(true);
    const index = stories.findIndex((s) => s.storyId === storyId);
    if (index === -1) throw new Error("Story not found.");

    stories[index] = {
      ...stories[index],
      accessLevel: "private",
      withdrawnAt: new Date().toISOString(),
      withdrawnBy: requesterName,
      withdrawalReason: reason
    };

    localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(stories));

    this._recordAudit({
      action: "withdraw",
      targetType: "story",
      targetId: storyId,
      actor: requesterName,
      notes: `Story access withdrawn and set to private. Reason: ${reason}`
    });

    this._notify();
    return stories[index];
  }

  // -------------------------------------------------------------------
  // Phrasebook Queries & Actions
  // -------------------------------------------------------------------
  getAllPhrases(includeAll = false) {
    const raw = localStorage.getItem(STORAGE_KEYS.PHRASES);
    const phrases = raw ? JSON.parse(raw) : INITIAL_PHRASEBOOK;
    if (includeAll) return phrases;
    return phrases.filter((p) => this.canViewItem(p));
  }

  getPhrasesByLanguage(languageVariety) {
    const phrases = this.getAllPhrases();
    if (!languageVariety || languageVariety === "All") return phrases;
    return phrases.filter(
      (p) => p.languageVariety.toLowerCase() === languageVariety.toLowerCase()
    );
  }

  getLanguageCoverage() {
    const phrases = this.getAllPhrases();
    const coverage = {};
    phrases.forEach((p) => {
      const lang = p.languageVariety || "Unknown";
      if (!coverage[lang]) {
        coverage[lang] = { total: 0, verified: 0, demo: 0, published: 0, ai: 0 };
      }
      coverage[lang].total += 1;
      if (p.dataStatus === "verified_real") {
        coverage[lang].verified += 1;
      } else if (p.dataStatus === "published_reference") {
        coverage[lang].published += 1;
      } else if (p.dataStatus === "ai_generated") {
        coverage[lang].ai += 1;
      } else {
        coverage[lang].demo += 1;
      }
    });
    return coverage;
  }

  submitPhrase(submission) {
    if (!submission.languageVariety || !submission.originalExpression || !submission.meaning) {
      throw new Error("Language, original expression, and meaning are mandatory.");
    }
    const phrases = this.getAllPhrases(true);
    const newPhrase = {
      entryId: `phrase-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      languageVariety: submission.languageVariety,
      dataStatus: submission.dataStatus || "illustrative", // Never default to verified_real
      category: submission.category || "Essentials",
      originalExpression: submission.originalExpression.trim(),
      audioUrl: submission.audioUrl || "",
      meaning: submission.meaning.trim(),
      pronunciationGuide: submission.pronunciationGuide || "",
      context: submission.context || "",
      contributedBy: submission.contributedBy || "Community Contributor",
      reviewStatus: "pending",
      reviewedBy: null,
      accessLevel: submission.accessLevel || "public"
    };

    phrases.unshift(newPhrase);
    localStorage.setItem(STORAGE_KEYS.PHRASES, JSON.stringify(phrases));

    this._recordAudit({
      action: "contribute",
      targetType: "phrase",
      targetId: newPhrase.entryId,
      actor: newPhrase.contributedBy,
      notes: `Submitted phrase in ${newPhrase.languageVariety}: "${newPhrase.originalExpression}". Status: Pending review.`
    });

    this._notify();
    return newPhrase;
  }

  reviewPhrase(entryId, { status, reviewerName }) {
    const phrases = this.getAllPhrases(true);
    const index = phrases.findIndex((p) => p.entryId === entryId);
    if (index === -1) throw new Error("Phrase not found.");

    phrases[index] = {
      ...phrases[index],
      reviewStatus: status,
      reviewedBy: reviewerName || "Designated Language Reviewer"
    };

    localStorage.setItem(STORAGE_KEYS.PHRASES, JSON.stringify(phrases));

    this._recordAudit({
      action: `review_${status}`,
      targetType: "phrase",
      targetId: entryId,
      actor: reviewerName || "Designated Language Reviewer",
      notes: `Review status changed to ${status}.`
    });

    this._notify();
    return phrases[index];
  }

  // -------------------------------------------------------------------
  // Heritage Atlas Queries & Actions
  // -------------------------------------------------------------------
  getAllHeritageObjects(includeAll = false) {
    const raw = localStorage.getItem(STORAGE_KEYS.OBJECTS);
    const objects = raw ? JSON.parse(raw) : INITIAL_HERITAGE_OBJECTS;
    if (includeAll) return objects;
    return objects.filter((o) => this.canViewItem(o));
  }

  getHeritageObjectById(objectId) {
    const objects = this.getAllHeritageObjects(true);
    return objects.find((o) => o.objectId === objectId) || null;
  }

  submitHeritageObject(submission) {
    if (!submission.title || !submission.tribeName || !submission.category) {
      throw new Error("Title, Tribe, and Category are mandatory.");
    }
    const objects = this.getAllHeritageObjects(true);
    const newObj = {
      objectId: `obj-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      tribeId: (submission.tribeName || "general").toLowerCase().replace(/\s+/g, "-"),
      tribeName: submission.tribeName,
      dataStatus: submission.dataStatus || "illustrative", // Never default to verified_real
      category: submission.category,
      communityName: submission.communityName || `${submission.tribeName} Community`,
      title: submission.title.trim(),
      photos: submission.photoUrl ? [
        {
          url: submission.photoUrl,
          consentGranted: Boolean(submission.consentGranted),
          credit: submission.photoCredit || "Contributed photo"
        }
      ] : [],
      usage: submission.usage || "",
      explanation: submission.explanation || "",
      providedBy: submission.providedBy || "Community Contributor",
      reviewStatus: "pending",
      reviewedBy: null,
      accessLevel: submission.accessLevel || "public"
    };

    objects.unshift(newObj);
    localStorage.setItem(STORAGE_KEYS.OBJECTS, JSON.stringify(objects));

    this._recordAudit({
      action: "contribute",
      targetType: "heritage_object",
      targetId: newObj.objectId,
      actor: newObj.providedBy,
      notes: `Submitted heritage object for ${newObj.tribeName}: "${newObj.title}". Status: Pending review.`
    });

    this._notify();
    return newObj;
  }

  reviewHeritageObject(objectId, { status, reviewerName }) {
    const objects = this.getAllHeritageObjects(true);
    const index = objects.findIndex((o) => o.objectId === objectId);
    if (index === -1) throw new Error("Object not found.");

    objects[index] = {
      ...objects[index],
      reviewStatus: status,
      reviewedBy: reviewerName || "Designated Heritage Reviewer"
    };

    localStorage.setItem(STORAGE_KEYS.OBJECTS, JSON.stringify(objects));

    this._recordAudit({
      action: `review_${status}`,
      targetType: "heritage_object",
      targetId: objectId,
      actor: reviewerName || "Designated Heritage Reviewer",
      notes: `Review status changed to ${status}.`
    });

    this._notify();
    return objects[index];
  }

  withdrawHeritageObject(objectId, requesterName, reason) {
    const objects = this.getAllHeritageObjects(true);
    const index = objects.findIndex((o) => o.objectId === objectId);
    if (index === -1) throw new Error("Object not found.");

    objects[index] = {
      ...objects[index],
      accessLevel: "private",
      withdrawnAt: new Date().toISOString(),
      withdrawnBy: requesterName,
      withdrawalReason: reason
    };

    localStorage.setItem(STORAGE_KEYS.OBJECTS, JSON.stringify(objects));

    this._recordAudit({
      action: "withdraw",
      targetType: "heritage_object",
      targetId: objectId,
      actor: requesterName,
      notes: `Heritage object access withdrawn and set to private. Reason: ${reason}`
    });

    this._notify();
    return objects[index];
  }

  // -------------------------------------------------------------------
  // Audit Trail
  // -------------------------------------------------------------------
  getAuditLog() {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT);
    return raw ? JSON.parse(raw) : INITIAL_AUDIT_LOG;
  }

  _recordAudit({ action, targetType, targetId, actor, notes }) {
    const log = this.getAuditLog();
    const entry = {
      id: `audit-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
      action,
      targetType,
      targetId,
      actor,
      notes
    };
    log.unshift(entry);
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(log));
  }

  // -------------------------------------------------------------------
  // Learner Progress (Browser-Local)
  // -------------------------------------------------------------------
  getLearnerProgress() {
    const raw = localStorage.getItem(STORAGE_KEYS.LEARNER_PROGRESS);
    return raw
      ? JSON.parse(raw)
      : {
          exploredStories: [],
          masteredPhrases: [],
          exploredObjects: [],
          completedQuizzes: 0
        };
  }

  markStoryExplored(storyId) {
    const progress = this.getLearnerProgress();
    if (!progress.exploredStories.includes(storyId)) {
      progress.exploredStories.push(storyId);
      localStorage.setItem(STORAGE_KEYS.LEARNER_PROGRESS, JSON.stringify(progress));
      this._notify();
    }
  }

  markPhraseMastered(phraseId) {
    const progress = this.getLearnerProgress();
    if (!progress.masteredPhrases.includes(phraseId)) {
      progress.masteredPhrases.push(phraseId);
      localStorage.setItem(STORAGE_KEYS.LEARNER_PROGRESS, JSON.stringify(progress));
      this._notify();
    }
  }

  recordQuizCompleted() {
    const progress = this.getLearnerProgress();
    progress.completedQuizzes = (progress.completedQuizzes || 0) + 1;
    localStorage.setItem(STORAGE_KEYS.LEARNER_PROGRESS, JSON.stringify(progress));
    this._notify();
  }

  // Reset to initial pilot dataset
  resetToInitialPilot() {
    localStorage.setItem(STORAGE_KEYS.STORIES, JSON.stringify(INITIAL_ORAL_STORIES));
    localStorage.setItem(STORAGE_KEYS.PHRASES, JSON.stringify(INITIAL_PHRASEBOOK));
    localStorage.setItem(STORAGE_KEYS.OBJECTS, JSON.stringify(INITIAL_HERITAGE_OBJECTS));
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(INITIAL_AUDIT_LOG));
    this._notify();
  }
}

export default new ArchiveStore();
