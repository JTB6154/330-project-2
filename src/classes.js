class Sprite{
    constructor(x=0,y=0,span=10,fwd={x:1,y:0},speed=0,color="black"){
        this.x = x;
        this.y = y;
        this.span = span;
        this.fwd = fwd;
        this.speed = speed;
        this.color = color;
        
        // #2 - Here's a cooler idiom to accomplish the same property assignment as above, 
        // with one line of code!
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
        //Object.assign(this,{x,y,span,fwd,speed,color});
    }

    draw(ctx){
        ctx.save();
        ctx.translate(this.x,this.y);
        ctx.beginPath();
        ctx.rect(-this.span/2,-this.span/2,this.span, this.span);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }

    move(){
        this.x += this.fwd.x * this.speed;
        this.y += this.fwd.y * this.speed;
    }
}

class ImageSprite extends Sprite{
    constructor(image,x=0,y=0,span=10,fwd={x:1,y:0},speed=0){
        super(x,y,span,fwd,speed);
        this.image = image;
        
        // #2 - Here's a cooler idiom to accomplish the same property assignment as above, 
        // with one line of code!
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
        //Object.assign(this,{x,y,span,fwd,speed,color});
    }

    draw(ctx){
        ctx.save();
        
        ctx.translate(this.x,this.y);
        
        ctx.drawImage(this.image,-this.span/2,-this.span/2,this.span,this.span);

        ctx.restore();
    }
}

export{Sprite, ImageSprite};