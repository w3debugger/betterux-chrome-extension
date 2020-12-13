chrome.browserAction.onClicked.addListener(async ({ id, url }) => {
  const { hostname } = url ? new URL(url) : {};
  if (!hostname) { return; }
  
  const hostnameArray = hostname.replace(/^www.|^en./g, '').split('.');
  const enrichHostname = hostnameArray.length > 1 ? hostnameArray.splice(0, hostnameArray.length - 1).join('') : hostnameArray;

  const data = await fetch('https://betterux.io/static/json/sites.json')
    .then(res => res.json())
    .then(res => res.find(({ url }) => url === enrichHostname))
    .catch(e => console.log(e)) || {};

  chrome.tabs.sendMessage(id, { data, enrichHostname })
});
