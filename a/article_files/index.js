var flatTrans = 0;

"use strict";
var c = document.getElementById("c");
var ctx = c.getContext("2d");

function strokeQuarter(planet, xsign1, ysign1, xsign2, ysign2) {
    var p = 0.551915024494; //magic number: http://spencermortensen.com/articles/bezier-circle/
    var iflatTrans = (1 - flatTrans)

    var sl = Math.sqrt(planet.radius**2/2);
    var bsl = Math.sqrt((planet.radius*p)**2/2);

    var p1 = { x: planet.origin.x+sl*xsign1*(flatTrans**(5)+1), y: planet.origin.y+sl*ysign1 };
    var p2 = { x: planet.origin.x+sl*xsign2*(flatTrans**(5)+1), y: planet.origin.y+sl*ysign2 };

    ctx.moveTo(p1.x, p1.y);
    ctx.bezierCurveTo(
        p1.x + bsl*xsign2*iflatTrans, p1.y + bsl*ysign2*iflatTrans, 
        p2.x + bsl*xsign1*iflatTrans, p2.y + bsl*ysign1*iflatTrans, 
        p2.x, p2.y
    );
}

function drawPlanet(planet) {
    //ctx.arc(planet.origin.x, //x origin
    //    planet.origin.y, //y origin
    //    planet.radius, //radius
    //    0, Math.PI * 2, false);
    //ctx.fill();
    ctx.beginPath();
    strokeQuarter(planet, 1, 1, -1, 1);
    strokeQuarter(planet, -1, 1, -1, -1);
    strokeQuarter(planet, -1, -1, 1, -1);
    strokeQuarter(planet, 1, -1, 1, 1);
    ctx.fillStyle = '#43C0EE';
    var sl = Math.sqrt(planet.radius**2/2);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(planet.origin.x-sl*(flatTrans**(5)+1)-1, planet.origin.y-sl-1, sl*2*(flatTrans**(5)+1)+2, sl*2+2)
    
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(planet.origin.x, //x origin
            planet.origin.y, //y origin
            Math.sqrt((sl*(flatTrans**(5)+1))**2+(sl)**2), //radius
            0, (Math.PI * 2), false);
    ctx.closePath();
    ctx.fill();
}

function projectOnPlanet(planet, coord) {
    var rad = planet.radius;
    var x = coord.x + planet.rot.x;
    var y = coord.y;
    var cx = rad * Math.sin(x) * Math.sin(y);
    var icy = rad * Math.cos(y);
    var icz = rad * Math.cos(x) * Math.sin(y);
    //do a cartesian rotation on the x axis for planet y rot
    var cy = icy * Math.cos(planet.rot.y) + icz * Math.sin(planet.rot.y);
    var cz = icz * Math.cos(planet.rot.y) - icy * Math.sin(planet.rot.y);
    return { 
        x: cx*(1-flatTrans) + (coord.x-Math.PI)*(planet.radius/2.3)*flatTrans, 
        y: cy*(1-flatTrans) - (coord.y-Math.PI/2)*(planet.radius/2.3)*flatTrans, 
        z: cz*(1-flatTrans) + 100*flatTrans 
    };
}
function projectOnPlanetZInvert(planet, coord) {
    var _a = projectOnPlanet(planet, coord), x = _a.x, y = _a.y, z = _a.z;
    var rad = planet.radius;
    if (z < 0) {
        var r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        var r_ = 2 * rad - r;
        x = (x / r) * r_;
        y = (y / r) * r_;
    }
    return { x: x, y: y, z: z };
}
function drawPathOnPlanet(planet, coords) {
    if (coords.length > 1) {
        ctx.beginPath();
        var next_1 = projectOnPlanetZInvert(planet, coords[0]);
        var resolve_1 = undefined;
        var resolveAtEnd_1 = undefined;
        coords.forEach(function (coord, i) {
            var cur = next_1;
            if (coords[i + 1] !== undefined)
                next_1 = projectOnPlanetZInvert(planet, coords[i + 1]);
            else
                next_1 = projectOnPlanetZInvert(planet, coords[0]);
            //do stuff here
            if (cur.z >= 0 && next_1.z >= 0) {
                ctx.lineTo(planet.origin.x + cur.x, planet.origin.y + cur.y);
            }
            else if (cur.z >= 0 && next_1.z <= 0) {
                ctx.lineTo(planet.origin.x + cur.x, planet.origin.y + cur.y);
                ctx.lineTo(planet.origin.x + next_1.x, planet.origin.y + next_1.y);
                resolve_1 = next_1;
            }
            else if (cur.z <= 0 && next_1.z >= 0) {
                if (resolve_1 === undefined)
                    resolveAtEnd_1 = cur;
                else {
                    //draw point between cur and resolve
                    var avg = {
                        x: (cur.x + resolve_1.x) / 2,
                        y: (cur.y + resolve_1.y) / 2
                    };
                    var r = Math.sqrt(Math.pow(avg.x, 2) + Math.pow(avg.y, 2));
                    var r_ = 2 * planet.radius;
                    avg.x = avg.x / r * r_;
                    avg.y = avg.y / r * r_;
                    ctx.lineTo(planet.origin.x + avg.x, planet.origin.y + avg.y);
                }
                ctx.lineTo(planet.origin.x + cur.x, planet.origin.y + cur.y);
            }
        });
        if (resolveAtEnd_1 !== undefined) {
            var avg = {
                x: (resolveAtEnd_1.x + resolve_1.x) / 2,
                y: (resolveAtEnd_1.y + resolve_1.y) / 2
            };
            var r = Math.sqrt(Math.pow(avg.x, 2) + Math.pow(avg.y, 2));
            var r_ = 2 * planet.radius;
            avg.x = avg.x / r * r_;
            avg.y = avg.y / r * r_;
            ctx.lineTo(planet.origin.x + avg.x, planet.origin.y + avg.y);
        }
        ctx.closePath();
        ctx.fillStyle = "#B5C57C";
        ctx.fill();
    }
}

function drawPathOnPlanetDebug(planet, coords) {
    if (coords.length > 1) {
        ctx.beginPath();
        let next = projectOnPlanetZInvert(planet, coords[0]);
        let p1 = [], p2 = [], p3 = [], p4 = [], p5 = [], p6 = [];
        let resolve = undefined;
        let resolveAtEnd = undefined;
        coords.forEach((coord, i)=>{

        var cur = next;
        if (coords[i+1] !== undefined)
            next = projectOnPlanetZInvert(planet, coords[i+1]);
        else
            next = projectOnPlanetZInvert(planet, coords[0]);
        if (i===0) p6.push(cur);
        
        //do stuff here
        if (cur.z >= 0 && next.z >= 0) { //inside
            ctx.lineTo(planet.origin.x + cur.x, planet.origin.y + cur.y);
        } else if (cur.z >= 0 && next.z <= 0) { //move out
            ctx.lineTo(planet.origin.x + cur.x, planet.origin.y + cur.y);
            ctx.lineTo(planet.origin.x + next.x, planet.origin.y + next.y);
            resolve = next;
            
            p3.push(next); p4.push(cur);
        } else if (cur.z <= 0 && next.z >= 0) { //move in
            
            
            if (resolve === undefined) resolveAtEnd = cur;
            else {
            //draw point between cur and resolve
            const avg = {
                x: (cur.x + resolve.x) / 2,
                y: (cur.y + resolve.y) / 2
            };
            const r = Math.sqrt(avg.x ** 2 + avg.y ** 2);
            const r_ = 2 * planet.radius;
            avg.x = avg.x / r * r_;
            avg.y = avg.y / r * r_;
            ctx.lineTo(planet.origin.x + avg.x, planet.origin.y + avg.y);
            }
            ctx.lineTo(planet.origin.x + cur.x, planet.origin.y + cur.y);
            p1.push(next); p2.push(cur);
            
        } else {
            p5.push(cur);
        }
        });
        if (resolveAtEnd !== undefined) {
        const avg = {
                x: (resolveAtEnd.x + resolve.x) / 2,
                y: (resolveAtEnd.y + resolve.y) / 2
            };
            const r = Math.sqrt(avg.x ** 2 + avg.y ** 2);
            const r_ = 2 * planet.radius;
            avg.x = avg.x / r * r_;
            avg.y = avg.y / r * r_;
            ctx.lineTo(planet.origin.x + avg.x, planet.origin.y + avg.y);
        }

        ctx.closePath();
        ctx.fillStyle = "#B5C57C";
        ctx.fill();
        function drawColor(col, s=5) {
            return ({ x, y }) => {
                ctx.fillStyle = col;
                ctx.fillRect(planet.origin.x + x, planet.origin.y + y, s, s);
            };
        }
        p6.forEach(drawColor("black",10));
        p1.forEach(drawColor("red")); p2.forEach(drawColor("orange"));
        p3.forEach(drawColor("blue"),4); p4.forEach(drawColor("purple"));
    }
}

function drawCircleOnPlanet(planet, circle) {
    var _a = projectOnPlanet(planet, circle.coord), x = _a.x, y = _a.y, z = _a.z;
    var rad = planet.radius
    ctx.fillStyle = "red"
    if (_a.z > 0)
        ctx.fillRect(_a.x+planet.origin.x, _a.y+planet.origin.y, 10, 10);
}

var planet = {
    radius: 200,
    origin: { x: c.width/2, y: c.height/2, z: 0 },
    rot: { x: Math.PI , y: 0 }
};
var circles = [];

function drawPathOnPlanetOld(planet, coords) {
    ctx.beginPath();
    coords.forEach(coord=>{
        var {x,y,z} = projectOnPlanetZInvert(planet, coord);
        
        ctx.lineTo(planet.origin.x + x, planet.origin.y + y);
    });
    ctx.closePath();
    ctx.fillStyle = "#B5C57C";
    ctx.fill();
}

function drawPathOnPlanetReallyOldHideBack(planet, coords) {
    ctx.beginPath();
    coords.forEach(coord=>{
        var {x,y,z} = projectOnPlanet(planet, coord);
        
        if (z > 0) {
            ctx.lineTo(planet.origin.x + x, planet.origin.y + y);
        }
    });
    ctx.closePath();
    ctx.fillStyle = "#B5C57C";
    ctx.fill();
}

var current3Max = 0;
const globe_img = document.getElementById("source");
let globe_img_loaded = false;
let mapWidth = 0;
let mapHeight = 0;

globe_img.addEventListener('load', e => {
    globe_img_loaded = true;
    mapWidth = globe_img.width * 3;
    mapHeight = globe_img.height * 3;
    console.log('image loaded');
});

function draw() {
    ctx.clearRect(0,0,c.width,c.height);
    
    if (current === 0 || current === 6) {
        drawPlanet(planet);
        ctx.globalCompositeOperation = 'source-atop';
        paths.forEach(p=>drawPathOnPlanet(planet, p));

        circles.forEach(c=>drawCircleOnPlanet(planet, c));

        //ctx.globalCompositeOperation = 'destination-over';
        //ctx.fillStyle= "#B5C57C"
        //ctx.fillRect(0,0,c.width,c.height);
        ctx.globalCompositeOperation = 'source-over';

        ctx.beginPath();
        ctx.arc(
        planet.origin.x, //x origin
        planet.origin.y, //y origin
        planet.radius,   //radius
        0, Math.PI*2, false
        );
    } else if (current === 1) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle='black'
        ctx.beginPath();
        ctx.arc(
        planet.origin.x, //x origin
        planet.origin.y, //y origin
        planet.radius,   //radius
        0, Math.PI*2, false
        );
        ctx.stroke();

        [{x: Math.PI, y: Math.PI/2}, {x: Math.PI+0.1, y: Math.PI/2+0.1}, {x: Math.PI+0.1, y: Math.PI/2-0.4}, {x: Math.PI+0.2, y: Math.PI-0.2}]
        .forEach(point=>{  
            var proj = projectOnPlanet(planet, point)
            ctx.fillText('long: ' + point.x.toPrecision(3), planet.origin.x + proj.x + 10, planet.origin.y + proj.y)
            ctx.fillText('lat: ' + point.y.toPrecision(3), planet.origin.x + proj.x + 10, planet.origin.y + proj.y + 12)
            ctx.beginPath();
            ctx.arc(planet.origin.x + proj.x, planet.origin.y + proj.y, 5, 0, Math.PI*2, false);
            ctx.stroke();
        });

        ctx.fillText('world.horizontal_rotation: ' + planet.rot.x.toPrecision(3), 500, 640);
        ctx.fillText('world.vertical_rotation: ' + planet.rot.y.toPrecision(3), 500, 610);
    } else if (current === 2) {
        if (globe_img_loaded) {
            ctx.drawImage(globe_img, planet.origin.x+mapWidth/2*planet.rot.x/Math.PI, planet.origin.y+mapHeight/2*(-Math.PI*2+planet.rot.y)/Math.PI-mapHeight/4, mapWidth, mapHeight/2);
        }
        ctx.fillStyle='black'
        ctx.beginPath();
        ctx.arc(
        planet.origin.x, //x origin
        planet.origin.y, //y origin
        planet.radius,   //radius
        0, Math.PI*2, false
        );
        ctx.stroke();

        ctx.fillStyle='black'
        ctx.beginPath();
        ctx.arc(
        planet.origin.x, //x origin
        planet.origin.y, //y origin
        10,   //radius
        0, Math.PI*2, false
        );
        ctx.stroke();

        ctx.beginPath();
        for (var i = 0; i < current3Max; i++) {
            var proj = projectOnPlanet(planet, paths[0][i])
            if (proj.z > 0) {
                ctx.lineTo(planet.origin.x + proj.x, planet.origin.y + proj.y)
            }
        }
        ctx.stroke();
        
        planet.rot.x -= (planet.rot.x - -paths[0][current3Max|0].x) * 0.2
        planet.rot.y -= (planet.rot.y - (Math.PI*3/2+paths[0][current3Max|0].y)) * 0.2

        current3Max += 0.13;
        if (current3Max > paths[0].length)
            current3Max = 0;
    } else if (current == 3) {
        drawPlanet(planet);
        ctx.globalCompositeOperation = 'source-over';
        paths.forEach(p=>drawPathOnPlanetReallyOldHideBack(planet,p));
    } else if (current === 4) {
        drawPlanet(planet);
        ctx.globalCompositeOperation = 'source-over';
        paths.forEach(p=>drawPathOnPlanetOld(planet,p));
    } 
    else if (current === 5) {
        drawPlanet(planet);
        ctx.globalCompositeOperation = 'source-over';
        paths.forEach(p=>drawPathOnPlanetDebug(planet,p));
    }
    if (current === 6) {
        planet.rot.y -= (planet.rot.y) * 0.05;
        if (planet.rot.y < 0.1 && planet.rot.y > -0.1) {
            planet.rot.x -= (planet.rot.x - Math.PI) * 0.05;
        }

        if (planet.rot.x - Math.PI < 0.1 && planet.rot.x - Math.PI > -0.1 && planet.rot.y < 0.1 && planet.rot.y > -0.1) {
            flatTrans -= (flatTrans - 1) * 0.05;
        }
    } else {
        flatTrans -= (flatTrans) * 0.05;
    }

    //planet.radius -= (planet.radius - 150) * 0.02;
    if (current !== 2)
        planet.rot.x -= 0.003;
    
    requestAnimationFrame(draw);
}
draw();
var offsetPrev = { x: 0, y: 0 };

var mouseDown = false;

window.addEventListener("mousedown", function(e) {
    mouseDown = true;
});

window.addEventListener("mouseup", function() {
    mouseDown = false;
});

window.addEventListener("mousemove", function (e) {
    if (mouseDown) {
        planet.rot.x -= (offsetPrev.x - e.clientX) * 0.002;
        planet.rot.y -= (offsetPrev.y - e.clientY) * 0.002;
    }
    if (e.altKey) {
        flatTrans -= (flatTrans - (e.clientX / window.innerWidth)) * 0.3;
    }
    offsetPrev.x = e.clientX;
    offsetPrev.y = e.clientY;
});