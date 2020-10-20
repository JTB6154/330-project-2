/*
	The purpose of this file is to take in the analyser node and a <canvas> element: 
	  - the module will create a drawing context that points at the <canvas> 
	  - it will store the reference to the analyser node
	  - in draw(), it will loop through the data in the analyser node
	  - and then draw something representative on the canvas
	  - maybe a better name for this file/module would be *visualizer.js* ?
*/

import * as utils from './utils.js';

let ctx,canvasWidth,canvasHeight,gradient,analyserNode,audioData;

const pyreInfo = 
{
    spacing : 4,
    margin : 5,
    startpos: 270,
    endpos: 795,
    width : 0,
    barWidth : 0,
    barHeight :300,
    topSpacing: 440,
    travelDistance: 100,
    fillStyle : 'rgba(202,23,62,1)',
    strokeStyle: 'rgba(0,0,0,0.50)',
    backgroundColor: 'rgb(9,13,33)',

};

const ror2Info = 
{
    spacing : 5,
    centerX: 500,
    centerY: 500,
    innerRadius: 150,
    outerRadius: 600,
    minTheta: 0,
    maxTheta: Math.PI,
    width : 0,
    barWidth : 0,
    fillStyle : 'rgb(72,33,73)',
    strokeStyle: 'rgba(0,0,0,0.50)',
    backgroundColor: 'rgb(72,33,73)',
};


function setupCanvas(canvasElement,analyserNodeRef){
	// create drawing context
	ctx = canvasElement.getContext("2d");
	canvasWidth = canvasElement.width;
	canvasHeight = canvasElement.height;
	// create a gradient that runs top to bottom
	gradient = utils.getLinearGradient(ctx,0,0,0,canvasHeight,[{percent:0,color:"#e26d5c"},{percent:.5,color:"#F7F7FF"},{percent:1,color:"#279AF1"}]);
	// keep a reference to the analyser node
	analyserNode = analyserNodeRef;
	// this is the array where the analyser data will be stored
    audioData = new Uint8Array(analyserNode.fftSize/2);
    

    pyreInfo.width = (pyreInfo.endpos - pyreInfo.startpos) - (audioData.length * pyreInfo.spacing) - pyreInfo.margin * 2;
    pyreInfo.barWidth = pyreInfo.width / audioData.length;
    ror2Info.width = (ror2Info.outerRadius - ror2Info.innerRadius) - (audioData.length * ror2Info.spacing);
    ror2Info.barWidth = ror2Info.width / audioData.length;
}


function draw(params={},imageArray){
  // 1 - populate the audioData array with the frequency data from the analyserNode
	// notice these arrays are passed "by reference" 
	analyserNode.getByteFrequencyData(audioData);
	// OR
	//analyserNode.getByteTimeDomainData(audioData); // waveform data
    if(params.drawType == 'pyre')
    {
        drawPyre(imageArray);
    }

    if(params.drawType == 'ror2')
    {
        drawROR2(imageArray);
    }
	
    


    // 6 - bitmap manipulation
	// TODO: right now. we are looping though every pixel of the canvas (320,000 of them!), 
	// regardless of whether or not we are applying a pixel effect
	// At some point, refactor this code so that we are looping though the image data only if
	// it is necessary

	// A) grab all of the pixels on the canvas and put them in the `data` array
	// `imageData.data` is a `Uint8ClampedArray()` typed array that has 1.28 million elements!
    // the variable `data` below is a reference to that array 
    let imageData = ctx.getImageData(0,0,canvasWidth,canvasHeight);
    let data = imageData.data;
    let length = data.length;
    let width = imageData.width
    
	// B) Iterate through each pixel, stepping 4 elements at a time (which is the RGBA for 1 pixel)
    for(let i=0 ; i<length; i+=4){
		// C) randomly change every 20th pixel to red
        if(params.showNoise && Math.random() < 0.05){
			// data[i] is the red channel
			// data[i+1] is the green channel
			// data[i+2] is the blue channel
			// data[i+3] is the alpha channel
			data[i] = data[i + 1] = data[i+2] = 0;// zero out the red and green and blue channels
			data[i] = 255;// make the red channel 100% red
        
        } // end if
        
        if(params.showInvert){
            let red = data[i], green = data[i+1], blue = data[i+2]
            data[i] = 255-red;
            data[i+1] = 255-green;
            data[i+2] = 255-blue;
        }//end if
    }// end for
    



    if(params.showEmboss)
    {
        for(let i=0; i<length;i++)
        {
            if(i%4 == 3) continue;
            data[i] = 127 + 2*data[i] - data[i+4] - data[i + width*4];
        }
    }
	
	// D) copy image data back to canvas
	ctx.putImageData(imageData,0,0);
}

function drawPyre(imageArray)
{
    //draw background
    cls(pyreInfo.backgroundColor);


    // draw circles
    let maxRadius = canvasHeight/3;
    ctx.save();
    ctx.globalAlpha = 0.5;
    for(let i=0; i<audioData.length; i++)
    {
        let percent = audioData[i] / 255;
        let circleRadius = percent * maxRadius;
        //blue circles
        ctx.beginPath();
        ctx.fillStyle = utils.makeColor(0,138,239,.25 - percent /3.0);
        ctx.arc(125,500, circleRadius * 1.5 ,0,2*Math.PI,false);
        ctx.fill();
        ctx.closePath();
    }
    ctx.restore()

    //draw logo cutout
    ctx.save();
    ctx.drawImage(imageArray[0],0,0,canvasWidth,canvasHeight);
    ctx.restore();

    //draw bars
    ctx.save();
    ctx.fillStyle = pyreInfo.fillStyle;
    ctx.strokeStyle = pyreInfo.strokeStyle;

    for(let i=0; i < audioData.length; i++)
    {
        ctx.fillRect(pyreInfo.startpos + pyreInfo.margin + i * (pyreInfo.barWidth + pyreInfo.spacing), pyreInfo.topSpacing + pyreInfo.travelDistance * (256-audioData[i])/256,pyreInfo.barWidth,pyreInfo.barHeight);
        ctx.strokeRect(pyreInfo.startpos + pyreInfo.margin + i * (pyreInfo.barWidth + pyreInfo.spacing), pyreInfo.topSpacing + pyreInfo.travelDistance * (256-audioData[i]),pyreInfo.barWidth,pyreInfo.barHeight);
    }
    ctx.restore();

    //draw star cutout
    ctx.save();
    ctx.drawImage(imageArray[1],0,0,canvasWidth,canvasHeight);
    ctx.restore();

}

function drawROR2(imageArray)
{
    //draw the background color
    cls(ror2Info.backgroundColor)
    ctx.drawImage(imageArray[3],0,0,canvasWidth,canvasHeight);
    ctx.save();
    ctx.fillStyle = ror2Info.fillStyle;

    for(let i=0; i <audioData.length; i++)
    {
        //draw outer circle
        let percent = audioData[i]/256;
        //ctx.arc(x,y,radius,start angle,end angle , false = ccw);
        let outerRadius = ror2Info.innerRadius + i * (ror2Info.barWidth + ror2Info.spacing);
        let innerRadius = outerRadius - ror2Info.spacing;
        let angle = percent * ror2Info.maxTheta + ror2Info.minTheta;
        ctx.beginPath();
        ctx.arc(ror2Info.centerX,ror2Info.centerY,innerRadius, Math.PI,angle + Math.PI,false);
        ctx.arc(ror2Info.centerX,ror2Info.centerY,outerRadius, angle + Math.PI,Math.PI,true);
        ctx.fill();
        ctx.closePath();
        //clip with inner circle
    }
    ctx.restore();
    ctx.drawImage(imageArray[2],0,0,canvasWidth,canvasHeight);


}

function cls(backgroundColor = 'black')
{    //draw background
    ctx.save();
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0,0,canvasWidth,canvasHeight);
    ctx.restore();
}

export {setupCanvas,draw};