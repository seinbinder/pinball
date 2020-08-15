//  TODO:
//      Friction
//      Stationary 'ball' (such as a peg or a bumper)
//      ??? WHY ARE MY COLLISIONS ADDING ENERGY? (e.g. watch 1 ball with a bit of gravity)
//          added some 'friction' to collisions. 
//          this is a table, not air. So add instead to every position update, lessening velocity slightly 
//  still double counting any collisions?
//  Timing, FPS
//  NEXT UP: Add A Flipper
//      rectangle-to-ball collision (non axis-aligned)
//      draw and rotate the flipper
//      user input (see hangout from joel)

var object = [];    // array of objects on the play field
canvW = 300;
canvH = 400;
var canvCtx;
FPS = 120;
MPF = 1000/FPS; //millisec per frame 
friction = .9;
console.log(MPF);
// var gravity = 9.8; / (MPF*1000);  // if px = 1 meter, then 9.8 m/s
   var gravity = .00021;

function startPinball() {
    pinballCanvas.start();
    console.log(canvW, canvH);
    // why "new". as opposed to ?
    
    i= 0;
    object[i] = new Ball(canvW*0.6, 0, 15, "silver") // x, y, radius, color
    object[i].velX = -.1
    object[i].velY = 0.05;

    i=object.push();  // .push returns current length of an array. with an argument, it pushes the arg, then returns length.

    // wallThickness = 10;
    // object.push( new wallStatic(0, canvH-wallThickness, canvW, wallThickness, "lightblue") );   // x, y, width, height, color
    // object.push( new wallStatic(0, 0, canvW, wallThickness, "lightblue") ); 
    // object.push( new wallStatic(0, wallThickness, wallThickness, canvH-2*wallThickness, "lightblue") );
    // object.push( new wallStatic(canvW-wallThickness, wallThickness, wallThickness, canvH-2*wallThickness, "lightblue") ); 

    var perRow = 2;
    var rows = 4;
    
    for(i=0; i<rows*perRow; i++) {
        var j=object.push( new Ball((canvW/perRow*(i+.5)%canvW), canvH/rows*(Math.floor(i/perRow)+.5), 4,"darkgrey") ); // x, y, radius, color
        object[j-1].subType = 'fixed';
    }

    i = object.push( new Flipper(100, 100, 150, 150, 'black'));
}
function f2(x) {
    // for console.log 2 decimal places. What's the right way to format console output?  
    var numb = Math.floor(x * 100);
    return numb/10000;
}
var pinballCanvas = {
    canvas : document.createElement("canvas"),
    start: function() {
        this.context = this.canvas.getContext("2d");
        canvCtx = this.context;
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(canvasGameLoop, 1000/FPS) //msec
        this.canvas.width = canvW;
        this.canvas.height = canvH;
    },
    clear: function() {
        this.context.clearRect(0,0, this.canvas.width, this.canvas.height);
    }
}
class Flipper {
    constructor(x1, y1, x2, y2, color) {
        this.type = 'flipper'; //CHEATING till collision is ready
        this.x1 = x1; 
        this.y1 = y1;
        this.x2 = x2; 
        this.y2 = y2;
        this.mass = 1;     // creator can overwrite this. (could make it an arg)
        this.color = color;
    }
    position() {
        // TBD
    }
    draw() {
        canvCtx.strokeStyle = this.color; 
        canvCtx.beginPath();
        canvCtx.moveTo(this.x1, this.y1);
        canvCtx.lineTo(this.x2, this.y2);
        canvCtx.stroke();
    }
}
class Ball {                                // convention: classes start w/ Capital
    constructor(x, y, radius, color) {
        this.type = 'ball';
        this.subType = 'unfixed';
        
        this.x = x; 
        this.y = y;
        this.radius = radius;
        this.mass = radius;     // creator can overwrite this. (could make it an arg)
        this.color = color;
        
        this.velX = 0;
        this.velY = 0;
        this.accelX = 0;
        this.accelY = gravity;

        // bounding box for collision check
        this.left = this.x-this.radius;   
        this.right = this.x+this.radius;    
        this.bottom = this.y+this.radius; 
        this.top = this.y-this.radius;
    }
    position(){
        if(this.subType === 'unfixed'){
            // position
            this.x += this.velX * MPF;
            this.y += this.velY * MPF;

            // velocity
            this.velX += this.accelX * MPF;
            this.velY += (this.accelY + gravity) * MPF;
            
            // update bounding box for collision check
            this.left = this.x-this.radius;   
            this.right = this.x+this.radius;    
            this.bottom = this.y+this.radius; 
            this.top = this.y-this.radius;
        }
    }        
    draw(){
        // ctx = pinballCanvas.context;
        canvCtx.fillStyle = this.color;
        canvCtx.strokeStyle = this.color; 
        canvCtx.beginPath();
        canvCtx.arc(this.x, this.y, this.radius, 0, 2*Math.PI); // x, y, radius, start angle, end angle
        canvCtx.stroke();
        canvCtx.fill();
    }
}
function wallStatic(x, y, width, height, color) {
    this.type = 'wallStatic'
    this.x = x; 
    this.y = y;
    this.width = width;  
    this.height = height;

    this.velX = 0;
    this.velY = 0;

    this.left = x;       // for collision check
    this.right = x+width;  
    this.bottom = y+height;
    this.top = y;

    this.position = function(){
        // wallStatics are static
    }        
    this.draw = function(){
        ctx = pinballCanvas.context;
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
} 
function resolveCollision(obj1, obj2) {
    
// console.log("collision", obj1, obj2);  
// obj1.color = 'black'; obj1.draw();
// obj2.color = 'yellow'; obj2.draw(); 
// console.log('velocities ', f4(obj1.velX), f4(obj1.velY), f4(obj2.velX), f4(obj2.velY) );

    if(obj1.type != 'ball' || obj2.type != 'ball') {
        // TODO
        console.log("%cNOT YET SUPPORTING ANYTHING BUT BALL-BALL COLLISION","color:red");
        return;
    }
    // www.youtube.com/watch?v=LPzyNOHY3A4
    // en.wikipedia.org/wiki/Elastic_collision

    // move the objects apart
    // displace each by 1/2 of the overlap. overlap is rad1+rad2 - dist_between_centers.
    var collisionAngle = Math.atan2( (obj2.y - obj1.y) , (obj2.x - obj1.x) ); // atan2(opposite , adjacent)
    // console.log('collision angle (degrees) ', collisionAngle*(180/Math.PI));
    var distance = Math.sqrt( (obj1.x-obj2.x)*(obj1.x-obj2.x) + (obj1.y-obj2.y)*(obj1.y-obj2.y) );
    var displace = 0.5 * ( (obj1.radius + obj2.radius) - distance);
    // TODO: displace distance in proportion to masses

    if(obj2.subtype === 'unfixed') {
        obj1.x -= Math.cos(collisionAngle) * displace;
        obj1.y -= Math.sin(collisionAngle) * displace;
        obj2.x += Math.cos(collisionAngle) * displace;
        obj2.y += Math.sin(collisionAngle) * displace;
    } 
    else {
        obj1.x -= Math.cos(collisionAngle) * 2 * displace;
        obj1.y -= Math.sin(collisionAngle) * 2 * displace;
    }  

// obj1.color = 'orange'; obj1.draw(); 
// obj2.color = 'purple'; obj2.draw(); 
    
    // we moved the objects, so recalc the distance
    distance = Math.sqrt( (obj1.x-obj2.x)*(obj1.x-obj2.x) + (obj1.y-obj2.y)*(obj1.y-obj2.y) );
    
    if(obj2.subType === 'unfixed'){
        // 'normal' vector (along the axis of the collision)    
        var normX = ( obj2.x - obj1.x ) / distance;
        var normY = ( obj2.y - obj1.y ) / distance;
        // tangential vector is 90deg to the normal
        var tanX = -normY;
        var tanY = normX;

        //how much of the velocity goes along the tangent? dot product between tangent vector and velocity vector.
        var dpTan1 = obj1.velX * tanX + obj1.velY * tanY;
        var dpTan2 = obj2.velX * tanX + obj2.velY * tanY;
        
        //how much of the velocity goes along the normal? dot product between normal vector and velocity vector.
        var dpNorm1 = obj1.velX * normX + obj1.velY * normY;
        var dpNorm2 = obj2.velX * normX + obj2.velY * normY;

        // conservation of momentum
        var m1 = ( dpNorm1 * (obj1.mass - obj2.mass) + (2.0 * obj2.mass * dpNorm2) ) / (obj1.mass + obj2.mass);
        var m2 = ( dpNorm2 * (obj2.mass - obj1.mass) + (2.0 * obj1.mass * dpNorm1) ) / (obj1.mass + obj2.mass);
        
        // new velocities along tangent
        obj1.velX = (tanX * dpTan1 + normX * m1) * friction;
        obj1.velY = (tanY * dpTan1 + normY * m1) * friction;
        obj2.velX = (tanX * dpTan2 + normX * m2) * friction;
        obj2.velY = (tanY * dpTan2 + normY * m2) * friction;

        // //Alternate math
        // var kx = obj1.velX - obj2.velX;
        // var ky = obj1.velY - obj2.velY;
        // var p = 2.0 * (normX * kx + normY * ky) / (obj1.mass + obj2.mass);
        // obj1.velX = obj1.velX - p * obj2.mass * normX;
        // obj1.velY = obj1.velY - p * obj2.mass * normY;
        // obj2.velX = obj2.velX + p * obj1.mass * normX;
        // obj2.velY = obj2.velY + p * obj1.mass * normY;   

        // console.log('new velocities', obj1.velX,(obj1.velY),(obj2.velX),(obj2.velY) );
    } else {
        var vel = Math.sqrt( (obj1.velX * obj1.velX) + (obj1.velY * obj1.velY) );
        var obj1VelocityDirection = Math.atan2(obj1.velY , obj1.velX ) ; // atan2(opposite , adjacent)
        var newVelocityDirection = 180 - 2 * collisionAngle - 3 * obj1VelocityDirection;
        obj1.velX = vel * Math.cos(newVelocityDirection);
        obj1.velY = vel * Math.sin(newVelocityDirection);
        // console.log(vel, obj1VelocityDirection, newVelocityDirection, obj1.velX, obj1.velY)
    }


}
function detectWall(obj) {

    // ASSUMES OBJ IS A BALL

    // detect collision with wall
    // resolve static collision (e.g. move the object out of the wall)
    // resolve dynamic collision (adjust velocity)
    if (obj.right > canvW ) {
        obj.x = canvW - obj.radius;
        obj.velX = -obj.velX * friction;
    }
    if (obj.left < 0) {
        obj.x = obj.radius;
        obj.velX = -obj.velX * friction;
    }
    if (obj.bottom > canvH ) {
        obj.y = canvH - obj.radius;
        obj.velY = -obj.velY * friction;
    }
    if (obj.top < 0) {
        obj.y = obj.radius;
        obj.velY = -obj.velY * friction;
    }


}
function detectCollision(obj1, obj2) {
    /* TODO: check rectangles vs rectangle differently than circle vs circle, and circle vs rectangle
     * need to know what type of objs we have, and which method to use        */
    
    // if obj1 & obj2 are both rectangles
    if(0) {
        
        if( (obj1.right < obj2.left || obj1.left > obj2.right) ||
            (obj1.bottom < obj2.top || obj1.top > obj2.bottom) )   {
            
            // no collision
            return 0;
        } else { 
            // collision
            //console.log("collide 1L 1R 2L 2R; 1T 1B 2T 2B", obj1.left, obj1.right, obj2.left, obj2.right, obj1.top, obj1.bottom, obj2.top, obj2.bottom);
            return 1;
        }
    }

    // if obj1 & obj2 are both circles
    if(obj1.type === 'ball' && obj2.type === 'ball') {
        
        var deltaX, deltaY, radiSum;
        deltaX = obj1.x - obj2.x;
        deltaY = obj1.y - obj2.y;
        radiSum = obj1.radius + obj2.radius;

        if( (radiSum * radiSum) < (deltaX * deltaX + deltaY * deltaY) ) {
            // no collision
            return 0;
        }
        else { 
            // collision
            return 1;
        }
    }

    if(obj1.type === 'ball' && obj2.type === 'flipper') {
        // see notebook 8/8/2020 for the math and diagram, and trigonometry.xlsx for math mockup
        var a0, a1, hyp, alpha, opp, adj, pNx, pNy;
        // determine alpha (angle between the endpoint-of-line and center of ball)
        a0 = Math.atan2(obj2.y2 - obj2.y1, obj2.x2 - obj2.x1);
        a1 = Math.atan2(obj1.x - obj2.x1, obj1.y - obj2.y1);
        alpha = Math.abs(a0 - a1);

        // var a0Deg = a0 * (180/Math.PI);
        // var a1Deg = a1 * (180/Math.PI);
        // var alphaDeg = alpha * (180/Math.PI);

        // determine hypotenuse (distance from endpoint-of-line to center of ball)
        hyp = Math.sqrt( (obj1.x - obj2.x1) * (obj1.x - obj2.x1) + (obj1.y - obj2.y1)*(obj1.y - obj2.y1));

        // determine Opposite (distance from ball to the line at 90 degrees)
        opp = Math.sin(alpha) * hyp;
        adj = Math.cos(alpha) * hyp;

        // adj becomes hypotenuse of a0 to the x axis. use this to determine pNx,pNy where the shortest distance intersects the line
        pNx = obj2.x1 + Math.cos(a0) * adj;
        pNy = obj2.y1 + Math.sin(a0) * adj;

        // Two collision conditions to check for:
        //  - if point where Ball-to-line shortest path falls within the line, and that path length < radius
        //  - if ball close to either line endpoint

        if (opp < obj1.radius) {
            if ( ( (obj2.x2 > obj2.x1) && (pNx >= obj2.x1) && (pNx <= obj2.x2) )  || ( obj2.x2 < obj2.x1 && pNx >= obj2.x2 && pNx <= obj2.x1 )  ){
            console.log('FLIPPER COLLISION')
            }
        }


    }
}
function canvasGameLoop() {
    
    // pinballCanvas.clear();

    for (var obj1 of object) {
        // no point checking fixed objects vs other objects, but we do have to draw them
        if(obj1.subType != 'fixed') {
            obj1.position();
            
            // Collision checks 
            detectWall(obj1);
            for (var obj2 of object){
                // skip self
                if(obj1 != obj2) {
                    if (detectCollision(obj1, obj2) ===1) {
                        // console.log('collide ', obj1, obj2);
                        resolveCollision(obj1, obj2);
                    }
                }
            }
        }
        obj1.draw();
    }
}