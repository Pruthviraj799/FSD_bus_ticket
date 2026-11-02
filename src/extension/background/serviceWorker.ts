console.log('[JARVIS] Background Service Worker Initialized (MV3 Zero-Cloud Mode)');

// Ensure side panel behavior opens on action click
chrome.sidePanel?.setPanelBehavior?.({ openPanelOnActionClick: true })?.catch((err) => {
  console.warn('Sidepanel behavior configuration fallback:', err);
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('[JARVIS] Extension installed cleanly.');
});
