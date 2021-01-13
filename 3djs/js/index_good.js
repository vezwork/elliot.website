//modify these vars for interesting results!

//TODO: camera rot and coords, fix points behind cam, add faces and shading, pre-processing auto intersection correction, the drawing stack, objects

var vertices = [
  [-1,-1,-1],
  [-1,-1,1],
  [-1,1,-1],
  [-1,1,1],
  [1,-1,-1],
  [1,-1,1],
  [1,1,-1],
  [1,1,1],
  [3,3,3],
  [4,4.1,3.3]
];
var edges = [
  [0,1],
  [1,3],
  [3,2],
  [2,0],
  [4,5],
  [5,7],
  [7,6],
  [6,4],
  [0,4],
  [1,5],
  [2,6],
  [3,7],
  [0,8],
  [8,9]
];
var canvas = document.getElementById('canvas');

var horizontal_zoom = 480;	//artificial zooms
var vertical_zoom = 480;
var horizontal_offset = canvas.width/2; //camera center
var vertical_offset = canvas.height/2;
var vertex_radius = 60;	//edge and vertex draw preferences.
var edge_width = 1;
var vertex_color = "rgba(255,165,0,1)";
var edge_color = "rgba(25,25,25,1)"; // not working

var camera_z = 10;
var camera_x = 0;
var camera_y = 0;

function draw() {
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var reqanim;
    
    var mouse_x = 0;
    var mouse_y = 0;
    
    var mouse_down = false;
    
    rotateZ(Math.PI/4);
    rotateX(Math.PI/4);
    ctx_draw();
    
    canvas.addEventListener('mouseover', function(e){
	  reqanim = window.requestAnimationFrame(ctx_draw);
	});

	canvas.addEventListener("mouseout",function(e){
	  window.cancelAnimationFrame(reqanim);
	});
	canvas.addEventListener("mousedown",function(e){
	  mouse_down = true;
	});
	canvas.addEventListener("mouseup",function(e){
	  mouse_down = false;
	});
    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };
      }
    canvas.addEventListener('mousemove', function(e) {
      var mousePos = getMousePos(canvas, e);

      var mouse_x_prev = mouse_x;
      var mouse_y_prev = mouse_y;

      mouse_x = mousePos.x;
      mouse_y = mousePos.y;
      
      if (mouse_down) {
        rotateY((mouse_x_prev-mouse_x)/100);
        rotateX((mouse_y_prev-mouse_y)/100);
      }
    });
    
    function ctx_draw() {
      ctx.clearRect(0,0, canvas.width, canvas.height);
      
      //rotateY(0.001);
      //rotateX(0.0001);
	  //camera_z -= 0.01;
      
      ctx.fillStyle = edge_color;
      ctx.lineWidth = edge_width;
      for (j = 0; j < edges.length; j++) {
        var edge_start = vertices[edges[j][0]];
        var edge_end = vertices[edges[j][1]];

        ctx.beginPath();
        ctx.moveTo(edge_start[0]*horizontal_zoom/distBetPoints(camera_x,camera_y,camera_z,edge_start[0],edge_start[1],edge_start[2])+horizontal_offset,
			edge_start[1]*vertical_zoom/distBetPoints(camera_x,camera_y,camera_z,edge_start[0],edge_start[1],edge_start[2])+vertical_offset);
        ctx.lineTo(edge_end[0]*horizontal_zoom/distBetPoints(camera_x,camera_y,camera_z,edge_end[0],edge_end[1],edge_end[2])+horizontal_offset,
			edge_end[1]*vertical_zoom/distBetPoints(camera_x,camera_y,camera_z,edge_end[0],edge_end[1],edge_end[2])+vertical_offset);
        ctx.closePath();
        ctx.stroke();
      }

      ctx.fillStyle = vertex_color;
      for (i = 0; i < vertices.length; i++) {
        var point = vertices[i];
        ctx.beginPath();
        ctx.arc(point[0]*horizontal_zoom/distBetPoints(camera_x,camera_y,camera_z,point[0],point[1],point[2])+horizontal_offset,
			point[1]*vertical_zoom/distBetPoints(camera_x,camera_y,camera_z,point[0],point[1],point[2])+vertical_offset,
			vertex_radius/distBetPoints(camera_x,camera_y,camera_z,point[0],point[1],point[2])/2,
			0,Math.PI*2,true);
        ctx.fill();
        }
      reqanim = window.requestAnimationFrame(ctx_draw);
     }  
  }
}

function rotateZ(theta) {
  var sinTheta = Math.sin(theta);
  var cosTheta = Math.cos(theta);
  for (i = 0; i < vertices.length; i++) {
    var x = vertices[i][0];
    var y = vertices[i][1];
    
    vertices[i][0] = x*cosTheta-y*sinTheta;
    vertices[i][1] = y*cosTheta+x*sinTheta;
  }
}

function rotateY(theta) {
  var sinTheta = Math.sin(theta);
  var cosTheta = Math.cos(theta);
  for (i = 0; i < vertices.length; i++) {
    var x = vertices[i][0];
    var z = vertices[i][2];
    
    vertices[i][0] = x*cosTheta-z*sinTheta;
    vertices[i][2] = z*cosTheta+x*sinTheta;
  }
}

function rotateX(theta) {
  var sinTheta = Math.sin(theta);
  var cosTheta = Math.cos(theta);
  for (i = 0; i < vertices.length; i++) {
	var y = vertices[i][1];
	var z = vertices[i][2];
	
	vertices[i][1] = y*cosTheta-z*sinTheta;
	vertices[i][2] = z*cosTheta+y*sinTheta;
  }
}

function distBetPoints(x1,y1,z1,x2,y2,z2) {
	return Math.sqrt(
		(x1-x2)*(x1-x2) +
		(y1-y2)*(y1-y2) +
		(z1-z2)*(z1-z2)
	);
}

canvas.addEventListener("mousewheel", MouseWheelHandler, false);
	// Firefox
canvas.addEventListener("DOMMouseScroll", MouseWheelHandler, false);

function MouseWheelHandler(e) {
	var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
	camera_z -= delta/10;
}