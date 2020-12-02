const [enrichHostname] = window.location.hostname.replace(/^www./g, '').split('.');
const storageKey = `bux::${enrichHostname}`;

chrome.storage.sync.get(storageKey, (data) => {
  const path = data[storageKey];

  if (!path) { return; }

  const linkTag = document.createElement('link');
  linkTag.id = 'bux-linkTag';
  linkTag.rel = 'stylesheet';
  linkTag.href = `https://betterux.io/static/css/${path}.css`;
  document.head.appendChild(linkTag);
})
