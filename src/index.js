const videoContainer = document.getElementById('video-container');
const button = document.getElementById('button');
const buttonContainer = document.getElementById('button-container');
const canvas = document.getElementById('canvas');
const snapshot = document.getElementById('snapshot');
const ctx = canvas.getContext('2d');

const backCamera = 'environment';
const frontCamera = 'user';
let devices = [];

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

if (!navigator.getUserMedia) {
    alert(`GetUserMedia Not Supported`);
    const p = document.createElement('p');
    p.innerText = 'Not Supported getUserMedia';
    buttonContainer.appendChild(p);
    snapshot.disabled = true;
}

if (!navigator.mediaDevices.getSupportedConstraints) {
    alert(`getSupportedConstraints Not Supported`);
    const p = document.createElement('p');
    p.innerText = 'Not Supported getSupportedConstraints';
    buttonContainer.appendChild(p);
} else {
    const constraints = navigator.mediaDevices.getSupportedConstraints();
    const p = document.createElement('p');
    p.innerText = JSON.stringify(constraints, null, 4);
    buttonContainer.appendChild(p);
}

const customConstraints = {
    audio: false,
    video: {
        facingMode: backCamera,
        width: {
            min: 320,
            max: 1920
        },
        height: {
            min: 240,
            max: 720
        },
        frameRate: 120
    }
};

const getVideoDevices = async () => {
    const enumDevices = await navigator.mediaDevices.enumerateDevices();
    devices = enumDevices.filter(device => device.kind === 'videoinput');

    if (!devices) {
        alert(`No Devices Found`);
        buttonContainer.innerHTML = 'No Devices found';
        return null;
    } else {
        devices.forEach(device => {
            const button = document.createElement('button');
            button.id = device.deviceId;
            button.type = 'button';
            button.classList = 'button-camera';
            button.innerText = device.label;
            button.onclick = () => {
                customConstraints.video.deviceId = {
                    exact: device.deviceId
                };

                updateVideo(customConstraints);
            };
            buttonContainer.appendChild(button);
        });

        customConstraints.video.deviceId = {
            exact: devices[1] ? devices[1].deviceId : devices[0].deviceId
        };

        updateVideo(customConstraints);
    }
};

getVideoDevices();

async function sleep(number) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, number);
    })
}

const updateVideo = (constraints) => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia(constraints).then(async res => {
            const videoId = document.getElementById('video');
            if (videoId) {
                videoContainer.removeChild(videoId);
            }
            const video = document.createElement('video');
            const media = res.getVideoTracks()[0];
            const capabilities = media.getCapabilities();
            const settings = media.getSettings();

            video.id = 'video';
            video.srcObject = res;
            video.offsetWidth = settings.width;
            video.offsetHeight = settings.height;
            videoContainer.appendChild(video);
            video.play();

            await sleep(1000);

            const input = document.createElement('input');
            input.type = 'range';

            // Check whether zoom is supported or not.
            if (!('zoom' in capabilities)) {
                const string = 'Zoom is not supported by ' + media.label;
                alert(string);
                const p = document.createElement('p');
                p.innerText = string;
                buttonContainer.appendChild(p);
                return null;
            }

            // Map zoom to a slider element.
            input.min = capabilities.zoom.min;
            input.max = capabilities.zoom.max;
            input.step = capabilities.zoom.step;
            input.value = settings.zoom;
            input.oninput = (event) => {
                media.applyConstraints({advanced: [ {zoom: event.target.value} ]});
            };

            videoContainer.appendChild(input);

        }).catch(e => alert(e));
    } else {
        throw new Error('GetUserMedia Not Supported');
    }
};

const constraints = navigator.mediaDevices.getSupportedConstraints();

function switchCameras() {
    customConstraints.video.facingMode = customConstraints.video.facingMode === backCamera ? frontCamera : backCamera;
    updateVideo(customConstraints);
}

// button.addEventListener('click', switchCameras);

function takeSnapshot() {
    let w = canvas.width = video.offsetWidth;
    let h = canvas.height = video.offsetHeight;
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(video, 0, 0, w, h);
    // convert it to base64
    const dataURI = canvas.toDataURL('image/jpeg');
    console.log(dataURI);
}

snapshot.addEventListener('click', takeSnapshot);