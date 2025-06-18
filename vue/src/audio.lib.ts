//---audio private variables
let audioWindow = window as any;
audioWindow.AudioContext = audioWindow.AudioContext || audioWindow.webkitAudioContext;
let context = new AudioContext();
let contextGainNode = context.createGain();
contextGainNode.connect(context.destination);
let alertBuffer: AudioBuffer;



export const audioLib = {
    loadAudios(urls: string[]): Promise<AudioBuffer[]> {
        let pArray = [];
        for (let i = 0; i < urls.length; i++) {
            pArray.push(new Promise((res: (ab: AudioBuffer) => void) => {
                //requesting audio
                let request = new XMLHttpRequest();
                request.open('GET', urls[i], true);
                request.responseType = 'arraybuffer';
                // Decode asynchronously
                request.onload = () => {
                    context.decodeAudioData(request.response, buffer => res(buffer));
                    // console.log(urls[i] + ' decoded');
                };
                //start request
                request.send();
            }));
        }
        return Promise.all(pArray);
    },
    playAudio(audio: AudioBuffer, isLoop: boolean = false) {
        try {
            let source = context.createBufferSource();
            source.buffer = audio;
            source.loop = isLoop;
            source.connect(contextGainNode);
            source.start(0);
            return source;
        }
        catch (error) {
            console.log(error);
            return null;
        }
    },
    playAlert() {
        if (alertBuffer) audioLib.playAudio(alertBuffer);
    },
}

audioLib.loadAudios(['./sounds/warning2.mp3']).then(datas => {
    alertBuffer = datas[0];
});