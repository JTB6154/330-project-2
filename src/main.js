/*
	main.js is primarily responsible for hooking up the UI to the rest of the application 
	and setting up the main event loop
*/

// We will write the functions in this file in the traditional ES5 way
// In this instance, we feel the code is more readable if written this way
// If you want to re-write these as ES6 arrow functions, to be consistent with the other files, go ahead!

import * as utils from './utils.js';
import * as audio from './audio.js';
import * as canvas from './canvas.js';

const drawParams = {
  showGradient  :true,
  showBars      :true,
  showCircles   :true,
  showNoise     :false,
  showInvert    :false,
  showEmboss    :false,
  drawType      :'pyre'
}

// 1 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
	sound1  :  "media/Thrash Pack.mp3"
});

let importedImages;

function init(Images){
  importedImages = Images;
  audio.setupWebAudio(DEFAULTS.sound1)
	console.log("init called");
	//console.log(`Testing utils.getRandomColor() import: ${utils.getRandomColor()}`);
	let canvasElement = document.querySelector("canvas"); // hookup <canvas> element
  setupUI(canvasElement); //hookup ui elements
  canvas.setupCanvas(canvasElement,audio.analyserNode);
  loop();
}

function setupUI(canvasElement){
  // A - hookup fullscreen button
  const fsButton = document.querySelector("#fsButton");
	
  // add .onclick event to button
  fsButton.onclick = e => {
    console.log("init called");
    utils.goFullscreen(canvasElement);
  };


  const playbutton = document.querySelector("#playButton")

  playbutton.onclick = e =>{
    console.log(`audioCTX.sate before = ${audio.audioCTX.state}`);
    if(audio.audioCTX.state == "suspended"){ audio.audioCTX.resume(); }

    console.log(`audioCTX.sate after = ${audio.audioCTX.state}`);
    

    if(e.target.dataset.playing == "no")
    {
      audio.playCurrentSound();
      e.target.dataset.playing= "yes";
    }else{
      audio.pauseCurrentSound();
      e.target.dataset.playing = "no";
    }
  };

  //get the slider and label
  const volumeSlider = document.querySelector("#volumeSlider");
  const volumeLabel = document.querySelector("#volumeLabel");

  //add oninput to the slider
  volumeSlider.oninput = e => {
    //set the gain
    audio.setVolume(e.target.value);
    //update the label
    volumeLabel.innerHTML = Math.round((e.target.value/2*100));
  };

  volumeSlider.dispatchEvent(new Event("input"));

  //D - hookup track <select>
  let trackSelect = document.querySelector("#trackSelect");

  trackSelect.onchange = e => {
    audio.loadSoundFile(e.target.value)

    if(e.target.selectedIndex < 3)
    {
      drawParams.drawType = 'pyre';
    }
    else if(e.target.selectedIndex < 6)
    {
      drawParams.drawType = 'ror2';
    }
    

    // canvas.updateDrawParams(drawParams);
    if(playbutton.dataset.playing = "yes")
    {
      playbutton.dispatchEvent(new MouseEvent("click"));
    }
  };

  const noiseCB = document.querySelector("#noiseCB");
    noiseCB.checked = drawParams.showNoise;
    noiseCB.onchange = e =>{
    drawParams.showNoise = e.target.checked;
  }

  const invertCB = document.querySelector("#invertCB");
    invertCB.checked = drawParams.showInvert;
    invertCB.onchange = e =>{
    drawParams.showInvert = e.target.checked;
  }
  
  const embossCB = document.querySelector("#embossCB");
    embossCB.checked = drawParams.showEmboss;
    embossCB.onchange = e =>{
    drawParams.showEmboss = e.target.checked;
  }
  
	
} // end setupUI

function loop(){
    requestAnimationFrame(loop);

    canvas.draw(drawParams,importedImages);
  }

export {init};