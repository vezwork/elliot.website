//TODO: add faces and shading, pre-processing auto intersection correction, the drawing stack, objects

//TODO DAY 2: camera plane line cutting, faces / planes, live render intersection?, camera_rot_y+z
//add_object(), docs, movement acceleration, max draw distance, x-y-z coordinate lines, horizon gradient

//modify these vars for interesting results!
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
  [4,4.1,3.3],
  
  [-1,-1,16],
  [-1,-1,18],
  [-1,1,16],
  [-1,1,18],
  [1,-1,16],
  [1,-1,18],
  [1,1,16],
  [1,1,18],
  
  [1, 0, 17]
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
  [8,9],
  
  [10,11],
  [11,13],
  [13,12],
  [12,10],
  [14,15],
  [15,17],
  [17,16],
  [16,14],
  [10,14],
  [11,15],
  [12,16],
  [13,17],
  
  [6,16],
  [3,13],
];
var canvas = document.getElementById('canvas');

var horizontal_zoom = 400;	//artificial zooms
var vertical_zoom = 400;
var horizontal_offset = canvas.width/2; //camera center
var vertical_offset = canvas.height/2;
var vertex_radius = 60;	//edge and vertex draw preferences.
var edge_width = 1;
var vertex_color = "rgba(255,155,0,1)";
var edge_color = "rgba(50,20,75,1)"; // not working

var camera_z = 10;
var camera_x = 0;
var camera_y = 0;

var camera_rot_x = 0;
var camera_rot_y = Math.PI;
var camera_rot_z = 0;			

function draw() {
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var reqanim;
    
    var mouse_x = 0;
    var mouse_y = 0;
    
    var mouse_down = false;
    
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
      
	  var xshift = (e.webkitMovementX || e.mozMovementX || e.MovementX || mouse_x_prev-mouse_x)/200;
	  var yshift = (e.webkitMovementY || e.mozMovementY || e.MovementY || mouse_y_prev-mouse_y)/200;
	
      if (mouse_down) {
		camera_rot_y -= xshift;
		camera_rot_x -= yshift;
		if (camera_rot_x > Math.PI/2) {
			camera_rot_x = Math.PI/2;
		} else if (camera_rot_x < -Math.PI/2) {
			camera_rot_x = -Math.PI/2;
		}
      }
    });
    
    function ctx_draw() {
      ctx.clearRect(0,0, canvas.width, canvas.height);
	  //ctx.fillStyle = 'rgba(255,255,255,0.4)';
		//ctx.fillRect(0,0,canvas.width,canvas.height); motion blur
      
      ctx.strokeStyle = edge_color;
      ctx.lineWidth = edge_width;
      for (j = 0; j < edges.length; j++) {
        var edge_start = vertices[edges[j][0]];
        var edge_end = vertices[edges[j][1]];
		
		edge_start = rotatePointY(camera_rot_y, edge_start, [camera_x, camera_y, camera_z]);
		edge_start = rotatePointX(camera_rot_x, edge_start, [camera_x, -camera_y, camera_z]);
		
		edge_end = rotatePointY(camera_rot_y, edge_end, [camera_x, camera_y, camera_z]);
		edge_end = rotatePointX(camera_rot_x, edge_end, [camera_x, -camera_y, camera_z]);
		
		var start_dist_cam = distToCamPlane(edge_start[0],edge_start[1],edge_start[2]);
		var end_dist_cam = distToCamPlane(edge_end[0],edge_end[1],edge_end[2]);
		if (end_dist_cam > start_dist_cam) {
			var temp = end_dist_cam;
			end_dist_cam = start_dist_cam;
			start_dist_cam = temp;
			
			temp = edge_end;
			edge_end = edge_start;
			edge_start = temp;
		}
		
		if (start_dist_cam > 0) {
			
			if (end_dist_cam < 0) {	//this is not perfect at all. lines sometimes dont go all the way to the camera plane i think
				
				var dir_vector = [edge_end[0]-edge_start[0],
				edge_end[1]-edge_start[1],
				edge_end[2]-edge_start[2]]	//the directional vector for the line to draw
				
				coef = (camera_z - edge_start[2]) / dir_vector[2] - 0.01; //cut off 0.01 units in front of camera plane
				
				var edge_end_x = edge_start[0] + coef*dir_vector[0];
				var edge_end_y = edge_start[1] + coef*dir_vector[1];
				var edge_end_z = edge_start[2] + coef*dir_vector[2];
				
			} else {
				var edge_end_x = edge_end[0];
				var edge_end_y = edge_end[1];
				var edge_end_z = edge_end[2];
			}
			
			end_dist_cam = distToCamPlane(edge_end_x,edge_end_y,edge_end_z);
			
			var projection_start_x = (edge_start[0]-camera_x)*horizontal_zoom/Math.abs(start_dist_cam)+horizontal_offset;
			var projection_start_y = (edge_start[1]+camera_y)*vertical_zoom/Math.abs(start_dist_cam)+vertical_offset;
			
			var projection_end_x = (edge_end_x-camera_x)*horizontal_zoom/Math.abs(end_dist_cam)+horizontal_offset;
			var projection_end_y = (edge_end_y+camera_y)*vertical_zoom/Math.abs(end_dist_cam)+vertical_offset;
			
			var temp = rotatePointZ(camera_rot_z, [projection_start_x, projection_start_y], [horizontal_offset, vertical_offset]);
		
			projection_start_x = temp[0];
			projection_start_y = temp[1];
			
			temp = rotatePointZ(camera_rot_z, [projection_end_x, projection_end_y], [horizontal_offset, vertical_offset]);
		
			projection_end_x = temp[0];
			projection_end_y = temp[1];

			ctx.beginPath();
			ctx.moveTo(projection_start_x, projection_start_y);
			ctx.lineTo(projection_end_x, projection_end_y);
			ctx.closePath();
			ctx.stroke();
		}
      }

      ctx.fillStyle = vertex_color;
      for (i = 0; i < vertices.length; i++) {
        var point = vertices[i];
		
		point = rotatePointY(camera_rot_y, point, [camera_x, camera_y, camera_z]);
		point = rotatePointX(camera_rot_x, point, [camera_x, -camera_y, camera_z]);
		
		var point_dist_cam = distToCamPlane(point[0],point[1],point[2]);
		
		var projection_x = (point[0]-camera_x)*horizontal_zoom/point_dist_cam+horizontal_offset;
		var projection_y = (point[1]+camera_y)*vertical_zoom/point_dist_cam+vertical_offset;
		
		var temp = rotatePointZ(camera_rot_z, [projection_x, projection_y], [horizontal_offset, vertical_offset]);
		
		projection_x = temp[0];
		projection_y = temp[1];
		
		if (point_dist_cam > 0) {
			 
			ctx.beginPath();
			ctx.arc(projection_x, projection_y, vertex_radius/point_dist_cam/2, 0, Math.PI*2, true);
			ctx.fill();
		}
      }
	  keyHandler();
      reqanim = window.requestAnimationFrame(ctx_draw);
    }  
  }
}

	//rotates vec1 by theta about vec2 in the Y plane
function rotatePointY(theta, vec1, vec2) {
	var x0 = vec2[0] || 0;
	var y0 = vec2[1] || 0;
	var z0 = vec2[2] || 0;	
	
	var sinTheta = Math.sin(theta);
	var cosTheta = Math.cos(theta);
	
	var x = vec1[0] - x0;
    var z = vec1[2] - z0;
    
	return [
		x*cosTheta-z*sinTheta + x0,
		vec1[1],
		z*cosTheta+x*sinTheta + z0
	];
}

function rotatePointX(theta, vec1, vec2) {
	var x0 = vec2[0] || 0;
	var y0 = vec2[1] || 0;
	var z0 = vec2[2] || 0;	
	
	var sinTheta = Math.sin(theta);
	var cosTheta = Math.cos(theta);
	
	var y = vec1[1] - y0;
    var z = vec1[2] - z0;
    
	return [
		vec1[0],
		y*cosTheta-z*sinTheta + y0,
		z*cosTheta+y*sinTheta + z0
	];
}

function rotatePointZ(theta, vec1, vec2) {
	var x0 = vec2[0] || 0;
	var y0 = vec2[1] || 0;
	var z0 = vec2[2] || 0;	
	
	var sinTheta = Math.sin(theta);
	var cosTheta = Math.cos(theta);
	
	var x = vec1[0] - x0;
    var y = vec1[1] - y0;
    
	return [
		x*cosTheta-y*sinTheta + x0,
		y*cosTheta+x*sinTheta + y0,
		vec1[2]
	];
}

function rotateZ(theta, x0, y0, z0) {
	var x0 = x0 || 0;
	var y0 = y0 || 0;
	var z0 = z0 || 0;
	
  var sinTheta = Math.sin(theta);
  var cosTheta = Math.cos(theta);
  for (i = 0; i < vertices.length; i++) {
    var x = vertices[i][0] - x0;
    var y = vertices[i][1] - y0;
    
    vertices[i][0] = x*cosTheta-y*sinTheta + x0;
    vertices[i][1] = y*cosTheta+x*sinTheta + y0;
  }
}

function rotateY(theta, x0, y0, z0) {
	var x0 = x0 || 0;
	var y0 = y0 || 0;
	var z0 = z0 || 0;	
	
  var sinTheta = Math.sin(theta);
  var cosTheta = Math.cos(theta);
  for (i = 0; i < vertices.length; i++) {
    var x = vertices[i][0] - x0;
    var z = vertices[i][2] - z0;
    
    vertices[i][0] = x*cosTheta-z*sinTheta + x0;
    vertices[i][2] = z*cosTheta+x*sinTheta + z0;
  }
}

function rotateX(theta, x0, y0, z0) {
	var x0 = x0 || 0;
	var y0 = y0 || 0;
	var z0 = z0 || 0;	
	
  var sinTheta = Math.sin(theta);
  var cosTheta = Math.cos(theta);
  for (i = 0; i < vertices.length; i++) {
	var y = vertices[i][1] - y0;
	var z = vertices[i][2] - z0;
	
	vertices[i][1] = y*cosTheta-z*sinTheta + y0;
	vertices[i][2] = z*cosTheta+y*sinTheta + z0;
  }
}

function translate(x0, y0, z0) {
	var x0 = x0 || 0;
	var y0 = y0 || 0;
	var z0 = z0 || 0;	
	
  for (i = 0; i < vertices.length; i++) {
	vertices[i][0] = vertices[i][0] + x0;
	vertices[i][1] = vertices[i][1] + y0;
	vertices[i][2] = vertices[i][2] + z0;
  }
}

function distBetPoints(x1,y1,z1,x2,y2,z2) {
	var x2 = x2 || 0;
	var y2 = y2 || 0;
	var z2 = z2 || 0;
	return Math.sqrt(
		(x1-x2)*(x1-x2) +
		(y1-y2)*(y1-y2) +
		(z1-z2)*(z1-z2)
	);
}

function distToCamPlane(x,y,z){
	var xthing = x - camera_x;
	var ything = y - camera_y;
	var zthing = z - camera_z;
	
	var normal = [0,0,1];
	
	xthing = normal[0] * xthing;
	ything = normal[1] * ything;
	zthing = normal[2] * zthing;
	
	if (xthing + ything + zthing > 0) {
		return -1*distBetPoints(xthing, ything, zthing);
	} else {
		return distBetPoints(xthing, ything, zthing);
	}
	
}

canvas.addEventListener("mousewheel", MouseWheelHandler, false);
	// Firefox
canvas.addEventListener("DOMMouseScroll", MouseWheelHandler, false);

function MouseWheelHandler(e) {
	var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
	camera_rot_z -= delta/10;
	//rotateZ(delta/40, camera_x, camera_y, camera_z);
}

document.onkeydown = checkKeyDown;
document.onkeyup = checkKeyUp;

var up_pressed = false;
var down_pressed = false;
var right_pressed = false;
var left_pressed = false;
var space_pressed = false;

function checkKeyUp(e) {
	e = e || window.event;

    if (e.keyCode == '38' || e.keyCode == '87') {
		up_pressed = false;
    }
    if (e.keyCode == '40' || e.keyCode == '83') {
		down_pressed = false;
    }
    if (e.keyCode == '37' || e.keyCode == '65') {
		left_pressed = false;
    }
    if (e.keyCode == '39' || e.keyCode == '68') {
		right_pressed = false;
    }
	if (e.keyCode == '32') {
		space_pressed = false;
    }
}

function checkKeyDown(e) {
    e = e || window.event;

    if (e.keyCode == '38' || e.keyCode == '87') {
		up_pressed = true;
    }
    if (e.keyCode == '40' || e.keyCode == '83') {
		down_pressed = true;
    }
    if (e.keyCode == '37' || e.keyCode == '65') {
		left_pressed = true;
    }
    if (e.keyCode == '39' || e.keyCode == '68') {
		right_pressed = true;
    }
	if (e.keyCode == '32') {
		space_pressed = true;
    }
}

var vertical_speed = 0;

function keyHandler() {
	
	var sinTheta = Math.sin(camera_rot_y);
	var cosTheta = Math.cos(camera_rot_y);
	
	if (up_pressed) {
        camera_x -= sinTheta * 0.04;
		camera_z -= cosTheta * 0.04;
    }
    if (down_pressed) {
        camera_x += sinTheta * 0.04;
		camera_z += cosTheta * 0.04;
    }
    if (left_pressed) {
		camera_z += sinTheta * 0.04;
		camera_x -= cosTheta * 0.04;
    }
    if (right_pressed) {
		camera_z -= sinTheta * 0.04;
		camera_x += cosTheta * 0.04;
    }
	
	if (space_pressed && camera_y == 0) {
		vertical_speed = 0.1;
	}
	
	camera_y += vertical_speed;
	
	if (camera_y <= 0) {
		vertical_speed = 0;
		camera_y = 0;
	} else {
		vertical_speed -= 0.002;
	}
}