let fileName;
let url;
let hasDownloadStart = false;  

// 1. get fileName from content script (already done)
// 2. onCreated: 
    // 2.1. get final url for download
    // 2.2. cancel download
    // 2.3. call downloads.download API to download


chrome.downloads.onCreated.addListener((downloadItem) => {
    console.log('download item: ', downloadItem);
    debugger;
    if (!downloadItem.filename.startsWith('test')) {
        console.log('start canceling, state: ', downloadItem.state);
        chrome.downloads.cancel(downloadItem.id);
        url = downloadItem.finalUrl;
        hasDownloadStart = false;
        console.log('canceled, state: ', downloadItem.state);
    } else {
        debugger;
        messageContentScript('Y');
    }
});

chrome.downloads.onChanged.addListener(
    async (downloadDelta) => {
        if (downloadDelta.state && downloadDelta.state.current === 'interrupted' && !hasDownloadStart) {
            console.log('start downloading: ', fileName, url);
            const downloaded = await chrome.downloads.download({ url, conflictAction: 'overwrite', filename: fileName })
            console.log('downloaded: ', downloaded);
            hasDownloadStart = true;
            return downloaded;
            
        }
    }
);

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'changeFileName') {
        fileName = `test/${message.filename}`;
    }
    sendResponse('FileNameUpdated');
});

const akashaOnlineUrl = 'https://online.akashayogaacademy.com/';

const messageContentScript = async (shouldContinue) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.url.startsWith(akashaOnlineUrl)) {
        chrome.tabs.sendMessage(tab.id, { shouldContinue, });
    }
}

const delay = (time) => {
    return new Promise(resolve => setTimeout(resolve, time));
};