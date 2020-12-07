const selectedClass = 'bux-cardButtonSelected';

/*
 * Shared Functions
 */

const array = arr => Array.isArray(arr) ? arr : [];

const clickHandler = ({ url, target, enrichHostname }) => {
  const buxLinkTag = document.getElementById('bux-linkTag');

  if (target.classList.contains(selectedClass)) {
    chrome.storage.sync.remove(`bux::${enrichHostname}`, () => console.log('theme removed'));
    target.classList.remove(selectedClass);
    buxLinkTag.remove();
    return;
  }

  const path = `${enrichHostname}/${url}`;
  const href = `https://betterux.io/static/css/${path}.css`;

  const siblingClass = document.querySelector(`.${selectedClass}`);
  if (siblingClass) { siblingClass.classList.remove(selectedClass) }
  target.classList.add(selectedClass);

  if (!buxLinkTag) {
    const linkTag = document.createElement('link');
    linkTag.id = 'bux-linkTag';
    linkTag.rel = 'stylesheet';
    linkTag.href = href;
    document.head.appendChild(linkTag);
  } else {
    buxLinkTag.href = href;
  }

  chrome.storage.sync.set({[`bux::${enrichHostname}`]: path}, () => console.log(`theme is set to ${url}`));
}

const clearStyles = () => {
  const linkTag = document.getElementById('bux-linkTag');
  if (linkTag) {
    linkTag.remove();
    location.reload();
  }
}

chrome.runtime.onMessage.addListener(async ({ data, enrichHostname }) => {
  const buxWrapper = document.querySelector('.bux-wrapper');
  if (buxWrapper) { buxWrapper.remove(); return; }

  const htmlContent = await fetch(chrome.extension.getURL('content.html')).then(res => res.text());
  if (!htmlContent) { return console.log('content.html is missing!'); }

  const dom = document.createElement('div');
  dom.classList.add('bux-wrapper');
  dom.innerHTML = htmlContent;

  const buxHeaderLink = dom.querySelector('.bux-headerLink');
  buxHeaderLink.href = `https://betterux.io/${enrichHostname}`;

  const buxClearStyle = dom.querySelector('.bux-clearStyles');
  buxClearStyle.addEventListener('click', () => clearStyles());

  if (array(data.variations).length === 0) {
    const buxCard = document.createElement('div');
    buxCard.classList.add('bux-card')
    buxCard.innerHTML = `
      <div class="bux-cardNotFoundHeading">No UX found :(</div>
      <div class="bux-cardNotFoundText">Please <a class="bux-cardNotFoundLink" href="https://github.com/w3debugger/betterux-web" target="_blank">visit</a> to contribute</div>
    `;

    dom.querySelector('.bux-cards').append(buxCard);
  } else {
    array(data.variations).forEach(({ url, title, image }) => {
      const buxCard = document.createElement('div');
      buxCard.classList.add('bux-card');

      const buxCardButton = document.createElement('button');
      buxCardButton.id = `${enrichHostname}-${url}`;
      buxCardButton.classList.add('bux-cardButton');
      buxCardButton.style.backgroundImage = `url('${image}')`;
      buxCardButton.addEventListener('click', ({ target }) => clickHandler({ url, target, enrichHostname }));

      const buxCardText = document.createElement('div');
      buxCardText.classList.add('bux-cardText');
      buxCardText.innerText = title;

      buxCard.appendChild(buxCardButton);
      buxCard.appendChild(buxCardText);

      dom.querySelector('.bux-cards').append(buxCard);
    })

    chrome.storage.sync.get(`bux::${enrichHostname}`, (data) => {
      const path = data[storageKey];
      const isBuxCardButton = dom.querySelector(`#${path.replace('/', '-')}`)
      if (isBuxCardButton) { isBuxCardButton.classList.add(selectedClass) }
    })
  }

  document.body.appendChild(dom);
});
