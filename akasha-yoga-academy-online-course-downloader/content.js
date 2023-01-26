const DOWNLOAD_SUCCESSFUL = 'Downloaded';
const DOWNLOAD_FAILED = 'Fail to download';
const akashaOnlineUrl = 'https://online.akashayogaacademy.com/';
let shouldContinue = true;

chrome.runtime.onMessage.addListener(async (request) => {
    console.log('request: ', request);
    if (request.action === 'downloadFromStart') {
        const courses = document.querySelectorAll('.course-player__chapters-menu .course-player__content-item a');
        for (course of courses) {
            while (!shouldContinue) {
                await delay(3000);
            }
            console.log('course:  ', course);
            course.click();
            await delay(2000);

            const downloadableItems = findDownloadableItems();
            if (downloadableItems.length > 0) {
                for (item of downloadableItems) {
                    if (isNewPart(item)) {
                        // todo: pause and ask for user interaction
                        // alert("This is a new course part. All courses in the previous part have been downloaded, please organize the download folder before proceeding.");
                        console.log("New part!!")
                    }

                    debugger;
                    const isFileNameUpdated = await messageBackgroundScriptToChangeFileName(course.getAttribute('href').split('/').at(-1), item.getAttribute('href'));
                    if (isFileNameUpdated) {
                        await clickDownload(item); 
                    } else {
                        console.error('File Name Not Updated');
                    }
                }
                await updateUI("All contents are successfully downloaded on this page.");
            } else {
                updateUI("Nothing to download on this page.");
            }
        }
    }
});

chrome.runtime.onMessage.addListener(async (request) => {
    if (request.shouldContinue === 'Y') {
        shouldContinue = true;
    }
})

const messageBackgroundScriptToChangeFileName = async (filename, url) => {
    const response = await chrome.runtime.sendMessage({ action: 'changeFileName', filename, url });
    if (response === 'FileNameUpdated') {
        return true;
    }
    return false;
}

const delay = (time) => {
    return new Promise(resolve => setTimeout(resolve, time));
};

const clickDownload = async(item) => {
    try {
        item.setAttribute('target', '_self');
        item.click();
        await delay(2000);
        console.log('item downloaded', item);
        item.setAttribute('target', '_blank');
        shouldContinue = false;
        return DOWNLOAD_SUCCESSFUL; 
    } catch(e) {
        console.error(e);
        return DOWNLOAD_FAILED;
    }
};

const updateUI = async(msg) => {
    // todo: update ui
    console.log(msg);
}

const findDownloadableItems = () => {
    const downloadLinks = []
    // PDFs - not working yet because it always opens up a new page
    // const PDFs = document.querySelectorAll('a.fr-file');
    // if (PDFs.length > 0) {
    //     downloadLinks.push(...PDFs);    
    // }

    // Videos
    const downloadBtns = document.querySelectorAll('.course-player__download-files__menu a');
    const downloadIcons = document.querySelectorAll('a.course-player__content-header__action-download');

    if (downloadBtns.length > 0) {
        downloadBtns.forEach(btn => {
            if (!btn.getAttribute('href').includes('pdf')) {
                downloadLinks.push(btn);
            }
        });
    } else if (downloadIcons.length > 0) {
        downloadIcons.forEach(icon => {
            if (!icon.getAttribute('href').includes('pdf')) {
                downloadLinks.push(icon);
            }
        })
    }
    return downloadLinks;
};

const isNewPart = (item) => {
    return item.href.includes('AkashaYTT200Part');
}