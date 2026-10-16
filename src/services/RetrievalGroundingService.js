// =====================================================================
// NAGAQUEST RETRIEVAL GROUNDING SERVICE
// Implements PRD Section 8.4: AI Cultural Learning Companion
// Grounds answers in approved archive records, cites sources,
// and explicitly declines to hallucinate when archive lacks evidence.
// =====================================================================

import archiveStore from "./archiveStore";
import GeminiService from "./GeminiService";

class RetrievalGroundingService {
  /**
   * Search approved archive entries for matches against a query and tribe
   */
  retrieveRelevantContext(query, tribeContext = "") {
    if (!query) return { stories: [], phrases: [], objects: [], totalCount: 0 };

    const lowerQuery = query.toLowerCase();
    const queryTokens = lowerQuery
      .split(/[\s,?.!]+/)
      .filter((t) => t.length > 2);

    const approvedStories = archiveStore.getAllStories().filter((s) => s.reviewStatus === "approved");
    const approvedPhrases = archiveStore.getAllPhrases().filter((p) => p.reviewStatus === "approved");
    const approvedObjects = archiveStore.getAllHeritageObjects().filter((o) => o.reviewStatus === "approved");

    const scoreItem = (text, tribeName) => {
      let score = 0;
      const lowerText = (text || "").toLowerCase();
      if (tribeContext && tribeContext.toLowerCase() !== "general") {
        if (tribeName && tribeName.toLowerCase().includes(tribeContext.toLowerCase())) {
          score += 3;
        }
      }
      queryTokens.forEach((token) => {
        if (lowerText.includes(token)) score += 2;
      });
      if (lowerText.includes(lowerQuery)) score += 5;
      return score;
    };

    const scoredStories = approvedStories
      .map((s) => ({
        item: s,
        score: scoreItem(`${s.title} ${s.transcriptTranslated} ${s.culturalContext} ${s.originalLanguage}`, s.tribeName)
      }))
      .filter((s) => s.score > 1)
      .sort((a, b) => b.score - a.score)
      .map((s) => s.item);

    const scoredPhrases = approvedPhrases
      .map((p) => ({
        item: p,
        score: scoreItem(`${p.originalExpression} ${p.meaning} ${p.context} ${p.category}`, p.languageVariety)
      }))
      .filter((p) => p.score > 1)
      .sort((a, b) => b.score - a.score)
      .map((p) => p.item);

    const scoredObjects = approvedObjects
      .map((o) => ({
        item: o,
        score: scoreItem(`${o.title} ${o.explanation} ${o.usage} ${o.category}`, o.tribeName)
      }))
      .filter((o) => o.score > 1)
      .sort((a, b) => b.score - a.score)
      .map((o) => o.item);

    return {
      stories: scoredStories.slice(0, 3),
      phrases: scoredPhrases.slice(0, 4),
      objects: scoredObjects.slice(0, 3),
      totalCount: scoredStories.length + scoredPhrases.length + scoredObjects.length
    };
  }

  /**
   * Generates a grounded response or explicitly declares an archive gap
   */
  async generateCompanionAnswer({
    query,
    tribeContext = "General",
    mode = "strict_archive", // 'strict_archive' | 'exploratory_ai'
    selectedEntry = null,
    answerStyle = "medium"
  }) {
    // 1. If an entry is explicitly selected in the UI, use it as direct context
    let retrieved = this.retrieveRelevantContext(query, tribeContext);
    if (selectedEntry) {
      if (selectedEntry.storyId && !retrieved.stories.some((s) => s.storyId === selectedEntry.storyId)) {
        retrieved.stories.unshift(selectedEntry);
      } else if (selectedEntry.objectId && !retrieved.objects.some((o) => o.objectId === selectedEntry.objectId)) {
        retrieved.objects.unshift(selectedEntry);
      } else if (selectedEntry.entryId && !retrieved.phrases.some((p) => p.entryId === selectedEntry.entryId)) {
        retrieved.phrases.unshift(selectedEntry);
      }
    }

    const citations = [
      ...retrieved.stories.map((s) => ({ id: s.storyId, title: s.title, type: "story", tribe: s.tribeName, dataStatus: s.dataStatus || "illustrative" })),
      ...retrieved.phrases.map((p) => ({ id: p.entryId, title: `${p.originalExpression} ("${p.meaning}")`, type: "phrase", tribe: p.languageVariety, dataStatus: p.dataStatus || "illustrative" })),
      ...retrieved.objects.map((o) => ({ id: o.objectId, title: o.title, type: "object", tribe: o.tribeName, dataStatus: o.dataStatus || "illustrative" }))
    ];

    // 2. Strict archive enforcement: If no archive entry supports the answer
    if (citations.length === 0 && mode === "strict_archive") {
      return {
        answer: `### 🌿 Archive Documentation Notice\n\n**The NagaQuest Archive does not have a verified, community-reviewed record for this query yet.**\n\nUnder our community governance principles (*PRD Principle 3: "The archive can say 'I don't know'"*), we decline to fabricate or extrapolate unverified cultural traditions.\n\n#### What you can do:\n- If you are an elder, storyteller, or knowledge holder, **[submit a verified recording or object in the Community Contribution Portal](/community-portal)**.\n- Try asking about documented pilot traditions: **Naknyulem fire rites (Chang)**, **Tung sacred log drums (Chang)**, **Tsüngkotepsü warrior shawls (Ao)**, or **Sekrenyi purification (Angami)**.\n- Or switch to **"Exploratory AI Mode"** below if you wish to see general AI inferences with an explicit unverified label.`,
        groundingLevel: "archive_gap",
        badge: "Archive Gap — No Guessing",
        citations: [],
        retrieved,
        suggestedActivities: null,
        relatedStory: null
      };
    }

    // 3. If mode is exploratory AI without archive records
    if (citations.length === 0 && mode === "exploratory_ai") {
      const rawPrompt = `You are NagaQuest AI in Exploratory Mode. The user asks: "${query}" (Tribe focus: ${tribeContext}).
Remember: No approved archive entries match this in our community database. Provide a respectful, high-level educational overview, but include an upfront disclaimer that this is general background knowledge not yet verified by local elders.`;
      
      const aiResponse = await GeminiService.generateResponse(rawPrompt, "heritage", tribeContext, answerStyle);
      const meta = GeminiService.getLastMeta();

      return {
        answer: aiResponse,
        groundingLevel: "unverified_ai",
        badge: "General AI Knowledge — Unverified",
        citations: [],
        retrieved,
        suggestedActivities: null,
        relatedStory: null,
        meta
      };
    }

    // 4. Grounded response using retrieved approved records
    let archiveEvidenceText = "=== APPROVED NAGA ARCHIVE ENTRIES ===\n";
    retrieved.stories.forEach((s) => {
      archiveEvidenceText += `\n[ORAL STORY: ${s.title} (ID: ${s.storyId}, Tribe: ${s.tribeName})]\nStoryteller: ${s.storyteller?.name}\nTranslation: ${s.transcriptTranslated}\nCultural Context: ${s.culturalContext}\n`;
    });
    retrieved.objects.forEach((o) => {
      archiveEvidenceText += `\n[HERITAGE OBJECT: ${o.title} (ID: ${o.objectId}, Tribe: ${o.tribeName}, Category: ${o.category})]\nUsage: ${o.usage}\nExplanation: ${o.explanation}\nCommunity: ${o.communityName}\n`;
    });
    retrieved.phrases.forEach((p) => {
      archiveEvidenceText += `\n[REVIEWED PHRASE: ${p.originalExpression} -> "${p.meaning}" (ID: ${p.entryId}, Language: ${p.languageVariety})]\nPronunciation: ${p.pronunciationGuide}\nContext: ${p.context}\n`;
    });

    const groundingPrompt = `You are the NagaQuest Cultural Learning Companion. Your answers MUST BE STRICTLY GROUNDED in the approved community archive entries provided below.

${archiveEvidenceText}

LEARNER'S QUESTION: "${query}" (Focus Tribe: ${tribeContext})

INSTRUCTIONS:
1. Ground your answer directly on the verified archive entries above.
2. CITE the archive entries you draw from using markdown tags like [Archive: Title](archive-id).
3. If unfamiliar indigenous terms appear (e.g., Tung, Morung, Naknyulem, Tsüngkotepsü), explain them using the reviewed phrasebook records above.
4. If the user asks for information NOT contained in these approved entries, explicitly state: "The archive does not document this specific detail yet." DO NOT extrapolate or blend across different tribes.
5. Conclude with a brief 1-sentence cultural reflection.`;

    try {
      const groundedAnswer = await GeminiService.generateResponse(
        groundingPrompt,
        "heritage",
        tribeContext,
        answerStyle
      );
      const meta = GeminiService.getLastMeta();

      // Related story recommendation
      const relatedStory = retrieved.stories[0] || null;

      // Quick comprehension activity generator
      const suggestedActivities = [
        `What is the primary spiritual significance of ${retrieved.objects[0]?.title || retrieved.stories[0]?.title || "this tradition"} to the ${tribeContext !== "General" ? tribeContext : "community"}?`,
        `How does the community review and consent process ensure this oral knowledge remains authentic?`
      ];

      return {
        answer: groundedAnswer,
        groundingLevel: "grounded_archive",
        badge: "Grounded in Archive",
        citations,
        retrieved,
        suggestedActivities,
        relatedStory,
        meta
      };
    } catch (err) {
      console.warn("Companion API call failed, falling back to local archive summary:", err);
      // Construct pure local grounded summary if API fails
      let localGroundedText = `### 🌿 Verified Archive Records on "${query}"\n\n`;
      retrieved.stories.forEach((s) => {
        localGroundedText += `#### 📜 ${s.title} (${s.tribeName})\n*Storyteller: ${s.storyteller?.name}*\n\n> "${s.transcriptTranslated}"\n\n*Context:* ${s.culturalContext}\n\n`;
      });
      retrieved.objects.forEach((o) => {
        localGroundedText += `#### 🏛️ ${o.title} (${o.tribeName} - ${o.category})\n${o.explanation}\n\n*Traditional Usage:* ${o.usage}\n\n`;
      });
      if (retrieved.phrases.length > 0) {
        localGroundedText += `#### 🗣️ Verified Language Terms:\n` + retrieved.phrases.map((p) => `- **${p.originalExpression}** (${p.pronunciationGuide}): "${p.meaning}" — *${p.context}*`).join("\n");
      }

      return {
        answer: localGroundedText,
        groundingLevel: "grounded_archive",
        badge: "Grounded in Archive (Local Mode)",
        citations,
        retrieved,
        suggestedActivities: null,
        relatedStory: retrieved.stories[0] || null,
        meta: { source: "offline_archive", cached: false }
      };
    }
  }
}

export default new RetrievalGroundingService();
