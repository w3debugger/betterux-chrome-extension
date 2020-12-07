chrome.browserAction.onClicked.addListener(async ({ id, url }) => {
  const { hostname } = url ? new URL(url) : {};
  if (!hostname) { return; }

  const [enrichHostname] = hostname.replace(/^www.|^en./g, '').split('.');
  const data = await fetch('https://betterux.io/static/json/sites.json')
    .then(res => res.json())
    .then(res => res.find(({ url }) => url === enrichHostname))
    .catch(e => console.log(e)) || {};

  chrome.tabs.sendMessage(id, { data, enrichHostname })
});
