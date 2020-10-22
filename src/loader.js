import * as main from "./main.js";

window.onload = ()=>{
	let imageUrls = ["media/pyre-logo-cutout.png","media/pyre-star-cutout.png","media/risk-of-rain-2-cutout.png","media/risk-of-rain-2-switch-hero.jpg","media/Hollow-Knight-Banner.png","media/Hollow-Knight-Cutout.png"];
	console.log("window.onload called");
	// 1 - do preload here - load fonts, images, additional sounds, etc...

	// 2 - start up app
	main.init(preloadImages(imageUrls));
}

function preloadImages(ImageUrls)
{	
	let Images = [];
	ImageUrls.forEach(url => {
		let img = new Image;
		img.src = url;
		img.onerror = _=>{
			console.log(`Image at url "${url}" wouldn't load! Check your URL!`);
		};
		Images.push(img);
	});

	return Images;

}