const akashaOnlineUrl = 'https://online.akashayogaacademy.com/';
document.querySelector('#downloadFromStart').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.url.startsWith(akashaOnlineUrl)) {
        chrome.tabs.sendMessage(tab.id, { action: 'downloadFromStart' });
    }
});

document.querySelector('#downloadFromCurrent').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.url.startsWith(akashaOnlineUrl)) {
        chrome.tabs.sendMessage(tab.id, { action: 'downloadFromCurrent' });
    }
});
