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
  showInvert    :false,
  showEmboss    :false,
  showGrayScale :false,
  drawType      :'pyre',
  hkIndex       :1,
  redFilter     :false,
  blueFilter    :false,
  greenFilter   :false
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
    else
    {
      drawParams.drawType = 'hk';
      drawParams.hkIndex = e.target.selectedIndex - 6;
    }
  };

  //check box controls
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
  const grayScaleCB = document.querySelector("#grayscaleCB");
    grayScaleCB.checked = drawParams.showGrayScale;
    grayScaleCB.onchange = e =>{
    drawParams.showGrayScale = e.target.checked;
  }	

  //radio button controls
  const redRB = document.querySelector("#redRB");
  redRB.checked = drawParams.redFilter;
  redRB.onchange = e =>{
    drawParams.redFilter = true;
    drawParams.blueFilter = false;
    drawParams.greenFilter = false;
  }

  const blueRB = document.querySelector("#blueRB");
  blueRB.checked = drawParams.blueFilter;
  blueRB.onchange = e =>{
    drawParams.redFilter = false;
    drawParams.blueFilter = true;
    drawParams.greenFilter = false;
  }
  const greenRB = document.querySelector("#greenRB");
  greenRB.checked = drawParams.greenFilter;
  greenRB.onchange = e =>{
    drawParams.redFilter = false;
    drawParams.blueFilter = false;
    drawParams.greenFilter = true;
  }
  const allRB = document.querySelector("#allRB");
  allRB.checked = !(drawParams.greenFilter || drawParams.redFilter || drawParams.blueFilter);
  allRB.onchange = e =>
  {
    drawParams.redFilter = false;
    drawParams.blueFilter = false;
    drawParams.greenFilter = false;
  }
} // end setupUI

function loop(){
    requestAnimationFrame(loop);

    canvas.draw(drawParams,importedImages);
  }

export {init};