document.getElementById('fullscreenBtn').addEventListener('click', function() {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) { /* Firefox */
        document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
        document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) { /* IE/Edge */
        document.documentElement.msRequestFullscreen();
    }

    this.classList.add('hidden');
});

// Add more functions to handle the swap time, iFrame content change, etc.
const iframe = document.getElementById('contentIframe');
const urls = [];
let currentUrlIndex = 0;

document.getElementById('settingsBtn').addEventListener('click', function() {
    const settings = document.querySelector('.settings-panel');
    if (settings.classList.contains('active')) {
        settings.classList.remove('active');
    } else {
        settings.classList.add('active');
    }
});

document.getElementById('closeSettingsBtn').addEventListener('click', function() {
    const settings = document.querySelector('.settings-panel');
    settings.classList.remove('active');
});

// document.addEventListener('click', function(event) {
//     const settings = document.querySelector('.settings-panel');
//     if (!settings.contains(event.target) && event.target.id !== 'settingsBtn') {
//         settings.classList.remove('active');
//     }
// });


// document.getElementById('addUrlButton').addEventListener('click', function() {
//     const urlInput = document.getElementById('urlInput').value;
//     if (urlInput) {
//         urls.push(urlInput);
//         updateUrlList();
//     }
// });

// const swapTimeSlider = document.getElementById('swapTimeSlider');
// const swapTimeInput = document.getElementById('swapTimeInput');

// swapTimeSlider.addEventListener('input', function() {
//     const value = this.value;
//     swapTimeInput.value = value;
//     // Handle the swap time functionality here if needed
// });

// swapTimeInput.addEventListener('input', function() {
//     const value = this.value;
//     if (value >= 1 && value <= 60) {
//         swapTimeSlider.value = value;
//         // Handle the swap time functionality here if needed
//     } else if (value < 1) {
//         this.value = 1;
//         swapTimeSlider.value = 1;
//     } else if (value > 60) {
//         this.value = 60;
//         swapTimeSlider.value = 60;
//     }
// });

function updateUrlList() {
    const list = document.getElementById('urlList');
    list.innerHTML = '';
    urls.forEach((url, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = url;
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', function() {
            urls.splice(index, 1);
            updateUrlList();
        });
        listItem.appendChild(removeButton);
        list.appendChild(listItem);
    });
}

// Handle the iFrame content swapping and error events
iframe.addEventListener('error', function() {
    currentUrlIndex = (currentUrlIndex + 1) % urls.length;
    iframe.src = urls[currentUrlIndex];
});

function switchContent() {
    const swapTime = document.getElementById('swapTimeSlider').value;
    setTimeout(() => {
        currentUrlIndex = (currentUrlIndex + 1) % urls.length;
        iframe.src = urls[currentUrlIndex];
    }, swapTime * 60 * 1000);
}

const swapTimeSlider = document.getElementById('swapTimeSlider');
const swapTimeInput = document.getElementById('swapTimeInput');
const urlInput = document.getElementById('urlInput');
const addUrlButton = document.getElementById('addUrlButton');
const urlList = document.getElementById('urlList');

// Event listeners
swapTimeSlider.addEventListener('input', handleSwapTimeChange);
swapTimeInput.addEventListener('input', handleSwapTimeChange);
addUrlButton.addEventListener('click', addUrl);

// Load the next URL to the iframe.
function loadNextUrl() {
    const storedUrls = JSON.parse(localStorage.getItem('urls')) || [];
    
    if (currentUrlIndex >= storedUrls.length) {
        currentUrlIndex = 0; // Reset to start
    }

    if (storedUrls.length === 0) {
        iframe.src = "about:blank"; // Load a blank page
        return; 
    }

    iframe.src = storedUrls[currentUrlIndex++];
}

// On load, retrieve URLs and swap time from localStorage
document.addEventListener('DOMContentLoaded', (event) => {
    const storedUrls = JSON.parse(localStorage.getItem('urls')) || [];
    const storedSwapTime = localStorage.getItem('swapTime') || '1';
    
    storedUrls.forEach(url => displayUrl(url));
    swapTimeInput.value = storedSwapTime;
    swapTimeSlider.value = storedSwapTime;
    
    loadNextUrl(); // Load the initial URL
    setInterval(loadNextUrl, storedSwapTime * 60 * 1000); // Start the rotation
});

function handleSwapTimeChange() {
    const value = this.value;
    if (this.id === 'swapTimeInput') {
        if (value >= 1 && value <= 60) {
            swapTimeSlider.value = value;
        } else if (value < 1) {
            this.value = 1;
            swapTimeSlider.value = 1;
        } else if (value > 60) {
            this.value = 60;
            swapTimeSlider.value = 60;
        }
    } else {
        swapTimeInput.value = value;
    }
    localStorage.setItem('swapTime', value);
    // Update the iframe refresh rate here based on the swapTime
}

function addUrl() {
    const url = urlInput.value;
    if (url) {
        displayUrl(url);
        const storedUrls = JSON.parse(localStorage.getItem('urls')) || [];
        storedUrls.push(url);
        localStorage.setItem('urls', JSON.stringify(storedUrls));
        urlInput.value = ''; // Clear the input for the next URL
        // Add the URL to your iframe rotation here
        loadNextUrl();
    }
}

function removeUrlFromRotation(removedUrl) {
    const storedUrls = JSON.parse(localStorage.getItem('urls')) || [];
    const updatedUrls = storedUrls.filter(url => url !== removedUrl);
    localStorage.setItem('urls', JSON.stringify(updatedUrls));

    // Check if the removed URL is the currently displayed one
    if (iframe.src === removedUrl) {
        currentUrlIndex++; // This will ensure we skip to the next URL
        loadNextUrl();
    }

    // if this results in no urls left
    if (updatedUrls.length === 0) {
        loadNextUrl();
    }
}

function displayUrl(url) {
    const listItem = document.createElement('li');
    const listItemContainer = listItem.appendChild(document.createElement('div'));
    listItemContainer.textContent = url;

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', function() {
        urlList.removeChild(listItem);
        const storedUrls = JSON.parse(localStorage.getItem('urls')) || [];
        const updatedUrls = storedUrls.filter(storedUrl => storedUrl !== url);
        localStorage.setItem('urls', JSON.stringify(updatedUrls));
        // Remove the URL from your iframe rotation here
        removeUrlFromRotation(url);
    });

    listItem.appendChild(removeBtn);
    urlList.appendChild(listItem);
}

