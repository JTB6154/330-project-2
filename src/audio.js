// 1 - our WebAudio context, **we will export and make this public at the bottom of the file**
let audioCTX;

// **These are "private" properties - these will NOT be visible outside of this module (i.e. file)**
// 2 - WebAudio nodes that are part of our WebAudio audio routing graph
let _element, _sourceNode, analyserNode, _gainNode;

// 3 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
    gain            :       .5,
    numSamples      :       128,
    startingVolume   : .03
})

// 4 - create a new array of 8-bit integers (0-255)
// this is a typed array to hold the audio frequency data
let audioData = new Uint8Array(DEFAULTS.numSamples/2);


// **Next are "public" methods - we are going to export all of these at the bottom of this file**
function setupWebAudio(filePath){
    // 1 - The || is because WebAudio has not been standardized across browsers yet
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCTX = new AudioContext();
    // 2 - this creates an <audio> element
    _element = document.querySelector("audio");
    _element.volume = DEFAULTS.startingVolume;
    // 3 - have it point at a sound file
    loadSoundFile(filePath);

    // 4 - create an a source node that points at the <audio> element
    _sourceNode = audioCTX.createMediaElementSource(_element);

    // 5 - create an analyser node
    // note the UK spelling of "Analyser"
    analyserNode = audioCTX.createAnalyser();
    /*
    // 6
    We will request DEFAULTS.numSamples number of samples or "bins" spaced equally 
    across the sound spectrum.

    If DEFAULTS.numSamples (fftSize) is 256, then the first bin is 0 Hz, the second is 172 Hz, 
    the third is 344Hz, and so on. Each bin contains a number between 0-255 representing 
    the amplitude of that frequency.
    */ 

    // fft stands for Fast Fourier Transform
    analyserNode.fftSize = DEFAULTS.numSamples;

    // 7 - create a gain (volume) node
    _gainNode = audioCTX.createGain();
    _gainNode.gain.value = DEFAULTS.gain;


    // 8 - connect the nodes - we now have an audio graph
    _sourceNode.connect(analyserNode);
    analyserNode.connect(_gainNode);
    _gainNode.connect(audioCTX.destination);
}

function loadSoundFile(filePath)
{
    _element.src = filePath;
}

function playCurrentSound()
{
    _element.play();
}

function pauseCurrentSound()
{
    _element.pause();
}

function setVolume(value){
    value = Number(value);// make sure that it's a Number rather than a String
    _gainNode.gain.value = value;
}

export{audioCTX,setupWebAudio,playCurrentSound,pauseCurrentSound,loadSoundFile,setVolume,analyserNode};