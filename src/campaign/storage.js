import { encodeCampaign, decodeCampaign } from './save.js';

// One record per slot: current and previous revisions are replaced in the same
// IndexedDB transaction. Revision checks prevent another tab's newer save being lost.
export class CampaignStorage {
  constructor({ indexedDB = globalThis.indexedDB, name = 'starseed-campaigns', now = () => new Date().toISOString() } = {}) {
    this.indexedDB = indexedDB; this.name = name; this.now = now; this.connection = null;
  }
  open() {
    if (this.connection) return this.connection;
    if (!this.indexedDB) return Promise.reject(new Error('Campaign storage is unavailable. Export a JSON copy to keep your progress.'));
    this.connection = new Promise((resolve, reject) => {
      let request, settled = false;
      const failed = error => { settled = true; reject(error); };
      try { request = this.indexedDB.open(this.name, 1); } catch (error) { failed(error); return; }
      request.onupgradeneeded = () => request.result.createObjectStore('slots', { keyPath: 'id' });
      request.onerror = () => failed(request.error || new Error('Could not open campaign storage.'));
      request.onblocked = () => failed(new Error('Another tab is blocking campaign storage. Close it and retry, or export JSON.'));
      request.onsuccess = () => {
        if (settled) { request.result.close(); return; }
        const db = request.result;
        db.onversionchange = () => { db.close(); this.connection = null; };
        resolve(db);
      };
    }).catch(error => { this.connection = null; throw error; });
    return this.connection;
  }
  async save(campaign) {
    // Snapshot before the asynchronous open: later caller mutations do not leak in.
    const snapshot = decodeCampaign(encodeCampaign(campaign));
    const expected = snapshot.revision;
    snapshot.revision++; snapshot.savedAt = this.now();
    const json = encodeCampaign(snapshot), db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('slots', 'readwrite'), store = tx.objectStore('slots');
      let reason;
      tx.oncomplete = () => resolve(snapshot);
      tx.onabort = () => reject(reason || tx.error || new Error('Campaign save failed; the previous revision was retained.'));
      const read = store.get(snapshot.campaignId);
      read.onsuccess = () => {
        const old = read.result;
        if ((old?.revision ?? 0) !== expected) {
          reason = new Error('This campaign changed in another tab. Reload its latest revision before saving.'); tx.abort(); return;
        }
        store.put({ id: snapshot.campaignId, revision: snapshot.revision, label: snapshot.label, savedAt: snapshot.savedAt, current: json, previous: old?.current ?? null });
      };
    });
  }
  async load(id, { previous = false } = {}) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('slots', 'readonly'), request = tx.objectStore('slots').get(id);
      let result;
      request.onsuccess = () => { result = request.result; };
      tx.onabort = () => reject(tx.error || new Error('Could not read the campaign.'));
      tx.oncomplete = () => {
        if (!result) { resolve(null); return; }
        try {
          const json = previous ? result.previous : result.current;
          if (!json) throw new Error('No previous campaign revision is available.');
          const record = decodeCampaign(json);
          // Restoring backup content must still compare against the current slot's
          // revision on the next write; the returned content is explicitly labelled.
          if (previous) record.revision = result.revision;
          resolve({ campaign: record, restoredPrevious: previous });
        } catch (error) { reject(error); }
      };
    });
  }
  async list() {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('slots', 'readonly'), request = tx.objectStore('slots').openCursor(), rows = [];
      request.onsuccess = () => { const c = request.result; if (c) { const { id, label, revision, savedAt } = c.value; rows.push({ id, label, revision, savedAt }); c.continue(); } };
      tx.oncomplete = () => resolve(rows.sort((a, b) => b.savedAt.localeCompare(a.savedAt)));
      tx.onabort = () => reject(tx.error || new Error('Could not list campaigns.'));
    });
  }
  async close() { const p = this.connection; this.connection = null; if (p) (await p).close(); }
}
