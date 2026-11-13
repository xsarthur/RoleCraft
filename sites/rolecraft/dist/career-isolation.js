/* Profession isolation for career switches. No network and no career content. */
(function (root) {
  'use strict';
  const AGENT_CAREER_ID = 'agent-developer';
  const QUESTION_BANK_STORAGE_KEY = 'rolecraft-experience-v13';
  const LOCAL_CAREER_KEY = 'rolecraft-local-career-v1';
  const GLOBAL_SETTING_KEYS = new Set([
    'rolecraft-v1',
    'rolecraft-career-conflict-dismissed-v1'
  ]);
  const POST_SWITCH_HASH = '#learn';

  function questionBankMode(careerId) {
    if (!careerId || careerId === AGENT_CAREER_ID) return 'agent';
    return 'unavailable';
  }

  function selectCacheKeysToClear(keys, previousCareer) {
    const id = typeof previousCareer?.careerId === 'string' ? previousCareer.careerId : '';
    const bits = [id, previousCareer?.textbookVersionId, previousCareer?.contentVersion, previousCareer?.corpusHash]
      .filter(bit => typeof bit === 'string' && bit.length >= 8);
    const clear = [];
    for (const key of keys || []) {
      if (typeof key !== 'string' || !key || key === LOCAL_CAREER_KEY) continue;
      if (GLOBAL_SETTING_KEYS.has(key)) continue;
      if (key === QUESTION_BANK_STORAGE_KEY) { clear.push(key); continue; }
      let decoded = key;
      try { decoded = decodeURIComponent(key); } catch { /* keep the raw key */ }
      if (bits.some(bit => key.includes(bit) || decoded.includes(bit))) clear.push(key);
    }
    return clear;
  }

  function postSwitchHash() { return POST_SWITCH_HASH; }

  root.RolecraftCareerIsolation = {
    AGENT_CAREER_ID,
    QUESTION_BANK_STORAGE_KEY,
    LOCAL_CAREER_KEY,
    questionBankMode,
    selectCacheKeysToClear,
    postSwitchHash
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
