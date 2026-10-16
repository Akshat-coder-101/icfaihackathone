// =====================================================================
// NAGAQUEST OFFLINE CULTURAL LIBRARY
// Downloads and stores approved archive records for offline exploration
// Uses IndexedDB with localStorage fallback
// =====================================================================

const DB_NAME = "NagaQuestOfflineDB";
const DB_VERSION = 1;
const STORE_NAME = "offline_archive_items";

class OfflineLibrary {
  constructor() {
    this.db = null;
    this._listeners = new Set();
    this._initPromise = this._initDB();
  }

  async _initDB() {
    if (!window.indexedDB) {
      console.warn("IndexedDB not supported; using localStorage fallback.");
      return null;
    }
    return new Promise((resolve) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = (e) => {
        console.warn("IndexedDB open failed; fallback to localStorage.", e);
        resolve(null);
      };
      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
      };
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          store.createIndex("itemType", "itemType", { unique: false });
          store.createIndex("tribeId", "tribeId", { unique: false });
        }
      };
    });
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
        console.error("OfflineLibrary listener error:", err);
      }
    });
  }

  async saveItem(item, itemType) {
    await this._initPromise;
    const offlineItem = {
      id: item.storyId || item.entryId || item.objectId || item.placeId || `item-${Date.now()}`,
      itemType, // 'story' | 'phrase' | 'object' | 'tourism'
      downloadedAt: new Date().toISOString(),
      verifiedRecord: item.dataStatus === "verified_real" || item.dataStatus === "api_sourced",
      title: item.title || item.originalExpression || item.name || "Untitled Record",
      tribeName: item.tribeName || item.languageVariety || item.district || "General",
      data: item
    };

    if (this.db) {
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction([STORE_NAME], "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.put(offlineItem);
        tx.oncomplete = () => {
          this._notify();
          resolve(offlineItem);
        };
        tx.onerror = (e) => reject(e);
      });
    } else {
      const key = `nq_offline_${offlineItem.id}`;
      localStorage.setItem(key, JSON.stringify(offlineItem));
      this._notify();
      return offlineItem;
    }
  }

  async removeItem(id) {
    await this._initPromise;
    if (this.db) {
      return new Promise((resolve, reject) => {
        const tx = this.db.transaction([STORE_NAME], "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.delete(id);
        tx.oncomplete = () => {
          this._notify();
          resolve(true);
        };
        tx.onerror = (e) => reject(e);
      });
    } else {
      localStorage.removeItem(`nq_offline_${id}`);
      this._notify();
      return true;
    }
  }

  async isItemSaved(id) {
    await this._initPromise;
    if (this.db) {
      return new Promise((resolve) => {
        const tx = this.db.transaction([STORE_NAME], "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);
        req.onsuccess = () => resolve(!!req.result);
        req.onerror = () => resolve(false);
      });
    } else {
      return !!localStorage.getItem(`nq_offline_${id}`);
    }
  }

  async getAllItems() {
    await this._initPromise;
    if (this.db) {
      return new Promise((resolve) => {
        const tx = this.db.transaction([STORE_NAME], "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } else {
      const items = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("nq_offline_")) {
          try {
            items.push(JSON.parse(localStorage.getItem(k)));
          } catch {
            // ignore malformed
          }
        }
      }
      return items;
    }
  }

  async downloadEntirePilotCollection(stories, phrases, objects) {
    for (const story of stories) {
      await this.saveItem(story, "story");
    }
    for (const phrase of phrases) {
      await this.saveItem(phrase, "phrase");
    }
    for (const obj of objects) {
      await this.saveItem(obj, "object");
    }
    this._notify();
    return true;
  }
}

export default new OfflineLibrary();
