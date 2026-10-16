/* global process */
import { GoogleGenAI } from "@google/genai";

const safeEnv =
  (typeof import.meta !== "undefined" && import.meta.env) ||
  (typeof process !== "undefined" && process.env) ||
  {};

const STORAGE_KEY = "nagaquest_api_key";
const GROQ_STORAGE_KEY = "nagaquest_groq_api_key";
const CACHE_STORAGE_KEY = "nagaquest_response_cache_v12";
const CACHE_TTL_MS = 30 * 60 * 1000;
const CACHE_MAX_ENTRIES = 40;

const DEFAULT_GEMINI_MODEL = safeEnv.VITE_GEMINI_MODEL || safeEnv.GEMINI_MODEL || "gemini-3-flash-preview";
const MODELS_TO_TRY = [DEFAULT_GEMINI_MODEL, "gemini-3.8-flash", "gemini-3.5-flash-lite", "gemini-3.6-flash"];
const DEFAULT_GROQ_MODEL = safeEnv.VITE_GROQ_MODEL || safeEnv.GROQ_MODEL || "qwen/qwen3.8-27b";

const REQUEST_TIMEOUT_MS = 20_000;

// ---------------------------------------------------------------------
// Config-driven prompt building
// ---------------------------------------------------------------------
const BASE_GUARDRAILS = `You are NagaQuest AI — an educational assistant dedicated to preserving Nagaland's indigenous heritage with accuracy and respect.

ACCURACY & TONE:
- Ground answers in documented Naga culture: 17 recognized tribes, Morung youth lodges, Feasts of Merit, warrior shawls, log drums, and the Hornbill Festival.
- Name specific tribes, festivals, garments, and instruments when relevant — avoid vague phrases like "ancient traditions".
- If a detail is uncertain or varies by village/clan, say so briefly instead of inventing facts.
- Use dignified, educational language. Never exoticize, stereotype, or treat tribal culture as fantasy tropes.
- In heritage answers, never present folktale fiction as documented history.

OUTPUT FORMAT:
- Use clean Markdown only: headings (## / ###), **bold** key terms, and bullet lists.
- Answer the user's question directly and completely.
- Do not wrap the response in code blocks.
- Do not include filler like "Here is your answer", "As an AI", or "I hope this helps".`;

const STYLE_CONFIG = {
  short: {
    maxTokens: 800,
    instruction:
      "LENGTH & STYLE: Concise summary — under 120 words total. Provide a complete, punchy response without truncating or leaving any sentence incomplete.",
    formatNote: "Keep response concise (under 120 words), direct, and complete.",
  },
  medium: {
    maxTokens: 1500,
    instruction:
      "LENGTH & STYLE: Balanced response — approximately 200–280 words. Lead with a direct answer or story, followed by structured complete sections.",
    formatNote: "Provide a balanced ~250 word response with full complete sections.",
  },
  detailed: {
    maxTokens: 3000,
    instruction:
      "LENGTH & STYLE: Comprehensive deep-dive — 500–700 words with subheadings (###), ritual steps, historical context, and cultural symbolism.",
    formatNote: "Provide a comprehensive 500+ word deep-dive with subheadings and full cultural context.",
  },
};

const CATEGORY_DIRECTIVES = {
  folklore:
    "TASK: Write an original narrative folktale (not a single-line summary). Include a unique # title, 2–4 detailed story paragraphs woven with tribe-specific customs, shawls, and festival rituals, and a 🌅 Moral & Cultural Wisdom section with 2 bullet lessons. The story MUST be hyper-specific to the chosen tribe.",
  heritage:
    "TASK: Write a structured cultural heritage analysis. Open with a direct answer to the query, then use ### subheadings and bold bullet points for festivals, textiles, Morung customs, or symbolism as relevant.",
  language:
    "TASK: Provide a complete, natural translation first — never truncate. Include syllable-by-syllable phonetics and 2 related phrases with English glosses.",
};

const TRIBE_ANCHORS = {
  Angami: "District: Kohima/Khonoma. Festival: Sekrenyi (Feb, purification). Notable: terrace farming, Kizie rites, Lohe shawl.",
  Ao: "District: Mokokchung. Festival: Moatsu (May). Notable: Tsüngkotepsü warrior shawl, Rongsu shawl, Mopungchuket lore.",
  Chakhesang: "District: Phek. Festivals: Tsukhenyie, Sükrünye. Notable: stone carving, terraced agriculture, Chokri/Khezha dialects.",
  Chang: "District: Tuensang. Festival: Naknyulem (July, festival of light). Notable: Hao Morung, Tung log drum, Shatang shawl, Kongkhim.",
  Kachari: "District: Dimapur. Festival: Busu Dima (Jan). Notable: Dimapur monolithic ruins, ancient kingdom heritage, weaving.",
  Khiamniungan: "District: Noklak. Festivals: Tsiam (Thiam), Miu. Notable: cane basketry, frontier hill agriculture, harvest songs.",
  Konyak: "District: Mon. Festival: Aoling (April). Notable: woodcarving, historical tattoo heritage, brass ornaments, Pa Morung.",
  Kuki: "District: Peren/Phek areas. Festival: Mimkut (Jan). Notable: bamboo dance, agricultural thanksgiving, festive attire.",
  Lotha: "District: Wokha. Festival: Tokhu Emong (Nov 7, harvest/reconciliation). Notable: Sutam shawl, Champo Morung, Pitsü feast.",
  Phom: "District: Longleng. Festival: Monyiu (April). Notable: pottery, wood sculptures, oral harvest lore.",
  Pochury: "District: Meluri/Phek. Festival: Yemshe (Oct). Notable: cane craft, traditional salt making, agricultural rites.",
  Rengma: "District: Tseminyu. Festival: Ngada (Nov). Notable: Ngada reconciliation rites, Mousalang shawl, clan governance.",
  Sangtam: "District: Kiphire. Festival: Mongmong (Sept). Notable: harvest purification, log drum ceremonies, weaving.",
  Sumi: "District: Zunheboto. Festivals: Tuluni (July), Ahuna (Nov). Notable: Supong Naga shawl, martial folk dances.",
  Tikhir: "District: Kiphire. Festival: Tsonglaknyi (Oct). Notable: tiger purification rites, traditional weaving arts.",
  Yimkhiung: "District: Shamator. Festival: Metemneo (Aug). Notable: colorful festive regalia, agricultural ceremonies.",
  Zeliang: "District: Peren. Festival: Hega (Feb). Notable: hornbill song chants, folk dances, Liangmai/Zeme dialects.",
  Nagamese: "Nagamese Creole: lingua franca blending Assamese, Hindi, English, and tribal languages. Used at Hornbill Festival and daily markets.",
};

function getTribeAnchor(tribeContext) {
  if (!tribeContext || tribeContext === "General") return "";
  const key = Object.keys(TRIBE_ANCHORS).find(
    (k) => tribeContext.toLowerCase().includes(k.toLowerCase())
  );
  return key ? `\n\nTRIBE CONTEXT (${tribeContext}): ${TRIBE_ANCHORS[key]}` : "";
}

function normalizeStyle(answerStyle) {
  return STYLE_CONFIG[answerStyle] ? answerStyle : "medium";
}

function stripResponseArtifacts(text) {
  if (!text) return text;
  return text
    .replace(/^```(?:markdown|md)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
}

function categoryTemperature(category) {
  if (category === "folklore") return 0.88; // Vivid, highly creative storytelling for folklore & myths
  if (category === "heritage") return 0.50; // Rich, engaging educational analysis for heritage guide
  if (category === "language") return 0.25; // Accurate, natural translations with low hallucination
  return 0.50;
}

function hashCacheKey(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return `nq_${Math.abs(hash).toString(36)}`;
}

class GeminiService {
  constructor() {
    this.apiKey = (typeof localStorage !== "undefined" && localStorage.getItem(STORAGE_KEY)) || safeEnv.VITE_GEMINI_API_KEY || safeEnv.GEMINI_API_KEY || "";
    this.groqApiKey = (typeof localStorage !== "undefined" && localStorage.getItem(GROQ_STORAGE_KEY)) || safeEnv.VITE_GROQ_API_KEY || safeEnv.GROQ_API_KEY || "";
    this.groqModel = safeEnv.VITE_GROQ_MODEL || safeEnv.GROQ_MODEL || DEFAULT_GROQ_MODEL;
    this.ai = null;
    // Metadata about the most recent generate() call
    this.lastMeta = { source: null, model: null, provider: null, category: null, cached: false };
    if (this.apiKey) this.initAI();
  }

  _readCacheStore() {
    try {
      if (typeof sessionStorage === "undefined") return {};
      const raw = sessionStorage.getItem(CACHE_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  _writeCacheStore(store) {
    try {
      if (typeof sessionStorage === "undefined") return;
      sessionStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(store));
    } catch {
      /* quota exceeded — skip caching */
    }
  }

  _cacheKey(prompt, category, tribeContext, answerStyle, customRequirement) {
    return hashCacheKey(
      [prompt, category, tribeContext, answerStyle, customRequirement || ""].join("|")
    );
  }

  _getFromCache(key) {
    const store = this._readCacheStore();
    const entry = store[key];
    if (!entry) return null;
    if (Date.now() - entry.ts > CACHE_TTL_MS) {
      delete store[key];
      this._writeCacheStore(store);
      return null;
    }
    return entry;
  }

  _saveToCache(key, text, meta) {
    const store = this._readCacheStore();
    store[key] = { text, meta, ts: Date.now() };
    const keys = Object.keys(store);
    if (keys.length > CACHE_MAX_ENTRIES) {
      keys
        .sort((a, b) => store[a].ts - store[b].ts)
        .slice(0, keys.length - CACHE_MAX_ENTRIES)
        .forEach((k) => delete store[k]);
    }
    this._writeCacheStore(store);
  }

  clearCache() {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem(CACHE_STORAGE_KEY);
    }
  }

  getApiKey() {
    return this.apiKey;
  }

  getGeminiKeys() {
    const raw = this.apiKey || "";
    return raw.split(",").map(k => k.trim()).filter(Boolean);
  }

  getGroqKey() {
    return this.groqApiKey || (typeof localStorage !== "undefined" && localStorage.getItem(GROQ_STORAGE_KEY)) || safeEnv.VITE_GROQ_API_KEY || safeEnv.GROQ_API_KEY || "";
  }

  setGroqKey(key) {
    this.groqApiKey = key || safeEnv.VITE_GROQ_API_KEY || safeEnv.GROQ_API_KEY || "";
    if (typeof localStorage !== "undefined") {
      if (key) {
        localStorage.setItem(GROQ_STORAGE_KEY, key);
      } else {
        localStorage.removeItem(GROQ_STORAGE_KEY);
      }
    }
    this.clearCache();
  }

  setApiKey(key) {
    this.apiKey = key || safeEnv.VITE_GEMINI_API_KEY || safeEnv.GEMINI_API_KEY || "";
    if (typeof localStorage !== "undefined") {
      if (key) {
        localStorage.setItem(STORAGE_KEY, key);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    this.clearCache();
    this.initAI();
  }

  hasApiKey() {
    return this.getGeminiKeys().length > 0 || Boolean(this.getGroqKey());
  }

  getLastMeta() {
    return this.lastMeta;
  }

  initAI() {
    try {
      const keys = this.getGeminiKeys();
      if (keys.length > 0) {
        this.ai = new GoogleGenAI({ apiKey: keys[0] });
      }
    } catch (e) {
      console.error("Failed to initialize Gemini client:", e);
      this.ai = null;
    }
  }

  async testConnection() {
    // 1. Test Gemini (trying all available keys and models)
    const geminiKeys = this.getGeminiKeys();
    for (const key of geminiKeys) {
      try {
        const client = new GoogleGenAI({ apiKey: key });
        for (const modelName of MODELS_TO_TRY) {
          try {
            const text = await this._callModelWithTimeout(
              client,
              modelName,
              "Reply with exactly: OK",
              "Connection test. Reply with exactly the word OK and nothing else.",
              16,
              "general"
            );
            if (text?.toLowerCase().includes("ok")) {
              return { ok: true, provider: "Gemini", model: modelName };
            }
          } catch {
            /* try next model */
          }
        }
      } catch {
        /* try next key */
      }
    }

    // 2. Test Groq failover
    const groqKey = this.getGroqKey();
    if (groqKey) {
      try {
        const text = await this._callGroqWithTimeout(
          "Say exactly: OK",
          "Connection test.",
          16
        );
        if (text?.toLowerCase().includes("ok")) {
          return { ok: true, provider: "Groq", model: this.groqModel || DEFAULT_GROQ_MODEL };
        }
      } catch {
        /* Groq failed */
      }
    }

    return false;
  }

  /**
   * Calls a single Gemini model with a hard timeout using AbortController
   */
  async _callModelWithTimeout(clientInstance, modelName, formatPrompt, enhancedInstruction, maxTokens, category = "general") {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const temp = categoryTemperature(category);
      const client = clientInstance || this.ai;
      const response = await client.models.generateContent({
        model: modelName,
        contents: formatPrompt,
        config: {
          systemInstruction: enhancedInstruction || undefined,
          temperature: temp,
          maxOutputTokens: maxTokens,
          topP: 0.9,
          abortSignal: controller.signal,
        },
      });
      return stripResponseArtifacts(response?.text || null);
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Calls Groq chat completions endpoint with hard timeout
   */
  async _callGroqWithTimeout(formatPrompt, enhancedInstruction, maxTokens) {
    const groqKey = this.getGroqKey();
    if (!groqKey) return null;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const messages = [];
      if (enhancedInstruction) {
        messages.push({ role: "system", content: enhancedInstruction });
      }
      messages.push({ role: "user", content: formatPrompt });

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: this.groqModel || DEFAULT_GROQ_MODEL,
          messages,
          max_tokens: maxTokens || 1200,
          temperature: 0.5
        }),
        signal: controller.signal
      });

      if (!res.ok) {
        return null;
      }
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      return stripResponseArtifacts(content || null);
    } catch (err) {
      console.warn("Groq request failed:", err);
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  _buildInstruction(systemInstruction, category, tribeContext, answerStyle, customRequirement) {
    const styleKey = normalizeStyle(answerStyle);
    let style = { ...STYLE_CONFIG[styleKey] };
    const activeReq = customRequirement?.trim();

    if (category === "folklore" && styleKey === "short") {
      style = {
        maxTokens: 800,
        instruction:
          "LENGTH & STYLE: Concise short folktale (~120–160 words). Provide a complete story with a title, 2–3 narrative story paragraphs, and a moral section. NEVER output a single line or 1-sentence summary.",
        formatNote: "Provide a complete short folktale with a title, 2-3 story paragraphs, and a moral section (~140 words).",
      };
    }

    if (category === "language") {
      return {
        instruction: (systemInstruction || "").trim(),
        style,
        activeReq: false
      };
    }

    let instruction = `${BASE_GUARDRAILS}\n\n${(systemInstruction || "").trim()}`;

    if (CATEGORY_DIRECTIVES[category]) {
      instruction += `\n\n${CATEGORY_DIRECTIVES[category]}`;
    }

    instruction += getTribeAnchor(tribeContext);

    if (activeReq) {
      instruction += `\n\nEXPLICIT USER REQUIREMENT: Strictly fulfill this directive:\n"${activeReq}"`;
    } else {
      instruction += `\n\n${style.instruction}`;
    }

    return { instruction, style, activeReq: !!activeReq };
  }

  async generate(prompt, systemInstruction = "", category = "general", tribeContext = "General", answerStyle = "medium", customRequirement = "") {
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem(STORAGE_KEY) || import.meta.env.VITE_GEMINI_API_KEY || "";
    }
    if (!this.ai && this.apiKey) this.initAI();

    const styleKey = normalizeStyle(answerStyle);
    const { instruction, style, activeReq } = this._buildInstruction(
      systemInstruction,
      category,
      tribeContext,
      styleKey,
      customRequirement
    );

    let formatPrompt = prompt;
    let maxTokens = style.maxTokens;

    if (category === "language") {
      maxTokens = 1000;
      // Do not append any essay format note for translation queries
    } else if (activeReq) {
      maxTokens = styleKey === "detailed" ? 3000 : styleKey === "short" ? 800 : 1500;
      formatPrompt = `[USER REQUIREMENT]: "${customRequirement.trim()}"\n\n[TOPIC / CONTEXT]:\n${prompt}`;
    } else {
      formatPrompt += `\n\n[FORMAT]: ${style.formatNote}`;
    }

    const cacheKey = this._cacheKey(prompt, category, tribeContext, styleKey, customRequirement);
    const cached = this._getFromCache(cacheKey);
    if (cached) {
      this.lastMeta = { ...cached.meta, cached: true };
      return cached.text;
    }

    // 0. Primary: Centralized Python FastAPI backend
    try {
      const pyRes = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: prompt,
          tribeContext: tribeContext || "General"
        }),
        signal: AbortSignal.timeout(10000)
      });
      if (pyRes.ok) {
        const pyData = await pyRes.json();
        if (pyData.reply) {
          this.lastMeta = {
            source: "api",
            provider: pyData.provider || "Python Backend (FastAPI)",
            model: pyData.model || "Gemini/Groq",
            category,
            groundingLevel: pyData.groundingLevel,
            cached: false
          };
          this._saveToCache(cacheKey, pyData.reply, this.lastMeta);
          return pyData.reply;
        }
      }
    } catch {
      // Python backend not running or errored, seamlessly proceed to client-side rotation
    }

    // 1. Try Gemini models across all configured keys
    const geminiKeys = this.getGeminiKeys();
    for (const currentKey of geminiKeys) {
      try {
        const client = new GoogleGenAI({ apiKey: currentKey });
        for (const modelName of MODELS_TO_TRY) {
          try {
            const text = await this._callModelWithTimeout(client, modelName, formatPrompt, instruction, maxTokens, category);
            if (text) {
              this.lastMeta = { source: "api", provider: "Gemini", model: modelName, category, cached: false };
              this._saveToCache(cacheKey, text, this.lastMeta);
              return text;
            }
          } catch (err) {
            const reason = err?.name === "AbortError" ? "timed out" : err.message || err;
            console.warn(`Gemini [${modelName}] failed (${reason}), trying next.`);
          }
        }
      } catch (keyErr) {
        console.warn("Gemini client initialization failed for key:", keyErr);
      }
    }

    // 2. High-speed failover to Groq API (qwen/qwen3.8-27b)
    const groqKey = this.getGroqKey();
    if (groqKey) {
      try {
        const text = await this._callGroqWithTimeout(formatPrompt, instruction, maxTokens);
        if (text) {
          this.lastMeta = { source: "api", provider: "Groq", model: this.groqModel || DEFAULT_GROQ_MODEL, category, cached: false };
          this._saveToCache(cacheKey, text, this.lastMeta);
          return text;
        }
      } catch (err) {
        console.warn("Groq failover call failed:", err);
      }
    }

    console.warn("All Gemini models failed or no API key set — serving offline fallback content.");
    this.lastMeta = { source: "fallback", model: null, category, cached: false };
    return this.getOfflineFallback(prompt, category, tribeContext, answerStyle, customRequirement);
  }

  /**
   * Static hand-written cultural fallback used when model calls fail or are offline.
   */
  getOfflineFallback(prompt, category, tribeContext = "General", answerStyle = "medium", customRequirement = "") {
    const lower = (prompt || "").toLowerCase();
    const tribe = (tribeContext || "").toLowerCase();
    const activeReq = customRequirement ? customRequirement.trim() : "";

    if (category === "folklore") return this._folkloreFallback(lower, tribe, tribeContext);
    if (category === "language") return this._languageFallback(prompt, tribeContext);
    if (category === "heritage") return this._heritageFallback(lower, tribe, tribeContext, answerStyle, activeReq);

    return `## Nagaland Indigenous Heritage Overview\n\nNagaland is home to 17 recognized indigenous tribes, each possessing distinct Tibeto-Burman dialects, festive traditions, and warrior textile motifs.`;
  }

  _folkloreFallback(lower, tribe, tribeContext) {
    const tName = tribeContext && tribeContext !== "General" ? tribeContext : "Naga";
    
    if (tribe.includes("chang") || lower.includes("naknyulem")) {
      return `# The Flame of Naknyulem & the Horns of Tuensang

In the ancient Chang village of Tuensang, high among the mist-covered pine ridges, young **Chingmak** sat quietly inside the **Hao**—the traditional Chang Morung youth lodge. Outside, elder **Sungkum** struck the hollow wood of the massive **Tung** (log drum), signaling the dawn of **Naknyulem**—the sacred festival celebrating the triumph of light over darkness.

Dressed in his hand-woven crimson-and-black **Shatang shawl**, Chingmak was chosen by the village council to guard the sacred hearth fire and venture into the ancestral forest to gather resinous pine logs for the torchlight rituals.

Deep in the forest, a glowing spirit guardian appeared. Instead of drawing his spear, Chingmak reached for his **Kongkhim** (bamboo mouth organ) and played a traditional Chang melody of peace and gratitude. Moved by his reverence for the living earth, the spirit blessed the village with abundant harvests and left behind a bundle of sacred golden millet grains.

Chingmak returned to the village square as night fell, and the elders kindled the resin torches, beating the **Tung** long into the night while the Chang villagers danced in celebration of Naknyulem.

## 🌅 Moral & Cultural Wisdom
- **Naknyulem Triumph**: Light, sacred fire, and communal music dispel uncertainty and renew village unity.
- **Hao Morung Discipline**: Discipline and reverence learned in the Morung prepare youth to protect the community.`;
    }

    if (tribe.includes("angami") || lower.includes("sekrenyi")) {
      return `# The Fire of Khonoma (${tName} Legend)

High in the terraced village of Khonoma, a malevolent shadow spirit crept from the misty valleys to steal the village’s warmth and divide its people. Inside the central **Kichuki** Morung, young **Viketo** wrapped his black-and-red **Lohe** shawl tightly around his shoulders.

Gathering the warriors, Viketo invoked the sacred purification rites of **Sekrenyi**, guiding everyone to wash away ill-will in the cold mountain spring. Purified in spirit, they kindled massive pitch-pine torches, bringing the radiant, darkness-shattering power of sacred fire to every threshold.

Blinded by the pure light and the unyielding harmony of the Angami people, the shrieking spirits retreated into the deepest forest abysses. By dawn, the shadow was broken, and warmth flooded every home once more.

## 🌅 Moral & Cultural Wisdom
- **Spiritual Purity**: True harmony is forged when a community purifies its heart and stands united.
- **Morung Resilience**: Ancestral traditions provide the ultimate shield against adversity.`;
    }

    return `# The Story of the Sacred Pine Ridge (${tName} Folktale)

High in the mist-covered hills of ${tName} territory, young braves gathered inside the traditional Morung youth lodge. Guided by ancestral wisdom, elders instructed the youths on the sacred duties of village defense, harvest rituals, and clan ballads.

When a sudden winter mist descended over the ridge, the brave youth stepped forward wearing the clan's hand-woven ceremonial shawl. Sounding the village log drum, the clan united in song and kindled resinous torches, banishing fear and welcoming a prosperous season.

The villagers celebrated long into the night with traditional dances and harvest feasting in honor of their ancestors.

## 🌅 Moral & Cultural Wisdom
- **Communal Unity**: Courage, sacred fire, and respect for elders preserve village peace and prosperity.
- **Ancestral Heritage**: Oral traditions handed down through the Morung keep tribal identity alive across generations.`;
  }

  _languageFallback(prompt, tribeContext) {
    const queryMatch =
      prompt.match(/Phrase to translate into[^:]+:\s*"([^"]+)"/i) ||
      prompt.match(/Translate this phrase into[^:]+:\s*"([^"]+)"/i) ||
      prompt.match(/Translate:\s*"([^"]+)"/i) ||
      prompt.match(/"([^"]+)"/);

    let rawText = queryMatch?.[1] || prompt;
    rawText = rawText
      .replace(/Phrase to translate into[^\n]*/i, "")
      .replace(/Translate this phrase into[^\n]*/i, "")
      .replace(/\[FORMAT\].*/s, "")
      .replace(/Write a complete.*/s, "")
      .replace(/##.*/s, "")
      .trim();

    if (!rawText || rawText.length > 100) {
      rawText = queryMatch?.[1] || "Where is the Hornbill Festival taking place?";
    }

    const lower = rawText.toLowerCase();
    let finalTranslation = "";
    let finalPhonetics = "";

    // Locations & Festival Queries
    if (lower.includes("where is hornbill") || lower.includes("hornbill festival")) {
      finalTranslation = "Hornbill Festival kote hoise / kote ase?";
      finalPhonetics = "Horn-bill Fes-ti-val ko-te hoi-se / ko-te a-se?";
    } else if (lower.includes("where is kisama") || lower.includes("kisama")) {
      finalTranslation = "Kisama Heritage Village kote ase?";
      finalPhonetics = "Ki-sa-ma He-ri-tage Vil-lage ko-te a-se?";
    } else if (lower.includes("where is") || lower.includes("where")) {
      finalTranslation = `"${rawText}" kote ase?`;
      finalPhonetics = `"${rawText}" ko-te a-se?`;
    }
    // Greetings & Social Phrases
    else if (lower.includes("how are u") || lower.includes("how are you")) {
      finalTranslation = "Apuni kene ase?";
      finalPhonetics = "A-pu-ni ke-ne a-se?";
    } else if (lower.includes("hi") || lower.includes("hello") || lower.includes("hey")) {
      finalTranslation = "Halo! Apuni kene ase?";
      finalPhonetics = "Ha-lo! A-pu-ni ke-ne a-se?";
    } else if (lower.includes("thank")) {
      finalTranslation = "Donyobad / Dhanyabad!";
      finalPhonetics = "Do-nyo-ba-d!";
    } else if (lower.includes("bye") || lower.includes("goodbye")) {
      finalTranslation = "Ahiu de! (Goodbye, see you again!)";
      finalPhonetics = "A-hi-u de!";
    }
    // Shopping & Food
    else if (lower.includes("how much") || lower.includes("cost") || lower.includes("price")) {
      finalTranslation = "Iya laga daam ki-maan ase?";
      finalPhonetics = "I-ya la-ga daa-m ki-maa-n a-se?";
    } else if (lower.includes("delicious") || lower.includes("good food") || lower.includes("tasty")) {
      finalTranslation = "Ahaar bor bhal ase! (The food is very delicious!)";
      finalPhonetics = "A-haa-r bor bha-l a-se!";
    } else if (lower.includes("drink milk") || lower.includes("milk")) {
      finalTranslation = "Doodh khabu / piu.";
      finalPhonetics = "Doo-dh kha-bu.";
    } else if (lower.includes("water")) {
      finalTranslation = "Paani khabu.";
      finalPhonetics = "Paa-ni kha-bu.";
    } else if (lower.includes("tea")) {
      finalTranslation = "Chaa khabu.";
      finalPhonetics = "Chaa kha-bu.";
    } else if (lower.includes("lets play") || lower.includes("let's play")) {
      finalTranslation = "Khelibole ahiu!";
      finalPhonetics = "Khe-li-bo-le a-hi-u!";
    }

    if (!finalTranslation.trim()) {
      finalTranslation = `Apuni "${rawText}" Nagamese te kobi.`;
      finalPhonetics = `A-pu-ni "${rawText}" Na-ga-me-se te ko-bi.`;
    }

    const langName = tribeContext === "General" || tribeContext === "Nagamese" ? "Nagamese Creole" : `${tribeContext} Dialect`;

    return `## Translation & Language Companion (${langName})

**Original Phrase**: "${rawText}"
**Translation**: **"${finalTranslation}"**

### Pronunciation Guide
- *Phonetic Breakdown*: \`${finalPhonetics}\`

### Usage & Context
Commonly spoken across Nagaland in informal daily conversation when asking questions, greeting locals, or exploring the Hornbill Festival.

### Related Useful Phrases
1. **Hornbill Festival kote ase?** ➔ *Where is the Hornbill Festival?*
2. **Iya laga daam ki-maan?** ➔ *How much does this cost?*
3. **Kene ase? Bhal ase!** ➔ *How are you? I'm doing good!*`;
  }

  _heritageFallback(lower, tribe, tribeContext, answerStyle, activeReq) {
    if (tribe.includes("lotha")) {
      if (answerStyle === "short") {
        return `## Lotha Tribe Quick Summary\n\n- **Tokhu Emong (Nov 7)**: Harvest festival celebrating crop completion, public reconciliation, and clan unity in Wokha.\n- **Sutam Warrior Shawl**: Hand-woven dark indigo shawl striped with red and white bands for Feasts of Merit (**Pitsü**).\n- **The Champo Morung**: Traditional youth lodge academy for warrior training, oral lore, and bamboo craft.`;
      }
      return `## Detailed Cultural Deep-Dive: The Lotha (Kyong) Heritage of Wokha\n\nThe **Lotha tribe** (historically known as Kyong) inhabits Wokha district in west-central Nagaland, fondly called the "Land of Plenty."\n\n### 1. The Tokhu Emong Festival & Reconciliation Rites\nCelebrated annually on November 7th, **Tokhu Emong** marks the end of the harvest season. A central pillar is **reconciliation**: past grievances and clan misunderstandings are publicly forgiven before the communal feast (*Pitsü*).\n\n### 2. Warrior Textile Heraldry & The Sutam Shawl\n- **Sutam Shawl**: Dark indigo wool crossed by bold crimson and white stripes, earned by elders who hosted public Feasts of Merit.\n- **Phangrhup Shawl**: Rare embroidered ceremonial garment worn by paramount village chiefs.\n- **Toloho Shawl**: Everyday black and red garment worn by young warriors during assemblies.\n\n### 3. The Champo Morung System\nBefore modern education, the **Champo** was the central village youth academy for woodcarving, log drum beating, folk ballads (*Kyong Leng*), and clan oral history.\n\n### 4. Governance & Clan Values\nLotha society is organized into patrilineal clans emphasizing elder council leadership and ancestral land stewardship.`;
    }

    if (tribe.includes("chang")) {
      return `## Detailed Cultural Deep-Dive: Chang Tribe Heritage & Tuensang Traditions\n\nThe **Chang tribe** inhabits Tuensang district in eastern Nagaland, renowned for intricate weaving, log drum ceremonies, and rich oral mythologies.\n\n### 1. Naknyulem Festival of Lights\nCelebrated in July to mark the victory of light over dark forces, with resin torches, traditional games, and ceremonial dances.\n\n### 2. The Hao System (Morung Lodge)\nTraditional youth academy for woodcarving, log drum drumming (**Tung**), and oral epics.\n\n### 3. Shatang Warrior Shawl & Textile Motifs\nA red-and-black woven shawl worn by esteemed leaders, denoting family prestige and Naknyulem festival rites.\n\n### 4. Traditional Musical Instruments\nThe **Kongkhim**, a Chang bamboo mouth organ played during harvest celebrations and fireside gatherings.`;
    }

    return `## Cultural Analysis: ${tribeContext !== "General" ? tribeContext : "Nagaland Indigenous"} Heritage ${activeReq ? `(${activeReq})` : ""}\n\nNagaland is home to 17 recognized indigenous tribes, each possessing distinct Tibeto-Burman dialects, festive traditions, and warrior textile motifs.\n\n### 1. Morung Village Academies\nTraditional youth lodges where oral history, woodcarving, martial arts, and clan ballads were handed down.\n\n### 2. Textile Heraldry & Warrior Shawls\nHand-woven shawls recording an individual's civic achievements and completed Feasts of Merit.\n\n### 3. Log Drum Ceremonies\nCarved wooden log drums struck in rhythm to announce village events and harvests.`;
  }

  async weaveFolktale({ tribe, theme, characters, answerStyle = "medium", customRequirement = "" }) {
    const styleKey = normalizeStyle(answerStyle);
    const wordTarget = styleKey === "short" ? "140–180" : styleKey === "detailed" ? "500–650" : "240–320";

    const tribeAnchor = TRIBE_ANCHORS[tribe] || `${tribe} tribe of Nagaland`;

    const systemPrompt = `You are a master storyteller of the ${tribe} tribe in Nagaland.

STRICT CULTURAL DIRECTIVE FOR ${tribe.toUpperCase()}:
- Ground the tale specifically in ${tribe} culture: incorporate ${tribe} village setting, ${tribe} festival rites, Morung lodge traditions, traditional ${tribe} shawls, and local instruments (${tribeAnchor}).
- Plot Theme: "${theme}".
- Characters: ${characters || `A youth from the ${tribe} village`}.
- Format Rules: Always output a complete narrative story with a creative # title, 2 to 3 detailed story paragraphs, followed by a ## 🌅 Moral & Cultural Wisdom section with 2 bullet points. Never output placeholders or incomplete sections.`;

    const prompt = `Weave an original, authentic ${tribe} folktale.

Selected Tribe: ${tribe}
Theme/Plot: ${theme}
Characters & Context: ${characters || `A youth from the ${tribe} village`}
Target Length: ~${wordTarget} words

Required Output Format:
# [Creative Title]

(Write 2 to 3 complete narrative paragraphs detailing the opening scene in the ${tribe} region, the conflict involving local customs, and the resolution)

## 🌅 Moral & Cultural Wisdom
- **[Lesson Title]**: Moral lesson tied to ancestral values.
- **[Lesson Title]**: Cultural wisdom tied to community.`;

    return this.generate(prompt, systemPrompt, "folklore", tribe, styleKey, customRequirement);
  }

  async interpretHeritage(query, selectedTribe = "General", answerStyle = "medium", customRequirement = "") {
    const tribeScope =
      selectedTribe === "General"
        ? "all 17 recognized Naga tribes, with examples from multiple tribes where appropriate"
        : `the ${selectedTribe} tribe specifically — prioritize ${selectedTribe} festivals, shawls, Morung customs, and village traditions`;

    const systemPrompt = `Role: Cultural anthropologist and Hornbill Festival heritage guide specializing in ${tribeScope}.

Answer rules:
- Lead with a direct 1–2 sentence answer to the user's question.
- Include specific names: festivals, shawls, Morung terms, clan practices.
- When describing symbolism (colors, animals, patterns), explain what each element means.
- If the query spans multiple tribes, note tribal differences briefly.`;

    const prompt = `Heritage query: "${query}"
Tribe focus: ${selectedTribe}

Structure your answer:
## [Direct title answering the query]
[Opening paragraph — direct answer in 1–2 sentences]
### [Relevant subheading — festival / textile / Morung / symbolism]
- **Key term**: explanation
### [Second subheading if needed]
- Supporting cultural details`;

    return this.generate(prompt, systemPrompt, "heritage", selectedTribe, normalizeStyle(answerStyle), customRequirement);
  }

  async translateLanguage(phrase, tribe = "Nagamese", customRequirement = "") {
    const langLabel = tribe === "Nagamese" || tribe === "Nagamese (Creole)" ? "Nagamese Creole" : `${tribe} Dialect`;

    const systemPrompt = `You are an expert language companion and translator specializing in ${langLabel} spoken across Nagaland.
Your goal is to provide a complete, highly accurate, and natural translation for the user's phrase into ${langLabel}.
Translate the entire sentence completely. Never output a partial 1-word translation or cut off mid-sentence.`;

    const templatePrompt = `Phrase to translate into ${langLabel}: "${phrase}"

Write a complete language translation lesson in clean Markdown:

## Translation & Language Companion (${langLabel})

**Original Phrase**: "${phrase}"
**Translation**: Write the complete translated phrase in ${langLabel} here in bold.

### Pronunciation Guide
Write the syllable-by-syllable phonetic breakdown with hyphens here.

### Usage & Context
Write 1–2 sentences explaining practical usage of this phrase in Nagaland here.

### Related Useful Phrases
- Write related phrase 1 in ${langLabel} — English meaning
- Write related phrase 2 in ${langLabel} — English meaning`;

    return this.generate(templatePrompt, systemPrompt, "language", tribe, "medium", customRequirement);
  }

  async getFestivalGuide(topic, answerStyle = "medium", customRequirement = "") {
    const systemPrompt = `Role: Hornbill Festival virtual tour guide at Kisama Heritage Village, Nagaland.

Guide rules:
- Give practical, visitor-friendly advice: locations, timing, what to expect, cultural etiquette.
- Mention specific Hornbill events: tribal morungs, night carnival, rock fest, craft bazaar, traditional games.
- Respectful tone — educate visitors on how to engage respectfully with tribal performers and artisans.`;

    const prompt = `Hornbill Festival guide topic: "${topic}"

Structure:
## [Topic title]
[Direct practical answer first]
### What to Expect
- Key details
### Tips for Visitors
- Etiquette and practical advice`;

    return this.generate(prompt, systemPrompt, "heritage", "General", normalizeStyle(answerStyle), customRequirement);
  }
}

export default new GeminiService();
