var ctx;
var cheight;
var cwidth;

function main() {
    ctx = document.getElementById('canvas').getContext('2d');
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight * 0.75;
    cwidth = window.innerWidth;
    cheight = window.innerHeight * 0.75;
    
    sim();
}

function sim() {
	// user input
	var setpointinput = parseFloat(document.getElementById("setpoint").value);
    var kpinput = parseInt(document.getElementById("kp").value);
    var kiinput = parseInt(document.getElementById("ki").value);
    var kdinput = parseInt(document.getElementById("kd").value);
	var antiwindup = document.getElementById("anti-windup").checked;
	//console.log(setpointinput);
	
    // constants
    var mass = 2;
    var radius = .02;
    var g = 9.81;
    var resistance = 0.0902;
    var kt = 0.0182;
    var kv = 46.3;
    var timestep = 0.001;
    var totalTime = 2;
    
    // variables
    var x = 0;
    var dx = 0;
    
    // pid stuff
    var setpoint = isNaN(setpointinput) ? 0 : setpointinput;
    var kp = isNaN(kpinput) ? 0 : kpinput;
    var ki = isNaN(kiinput) ? 0 : kiinput;
    var kd = isNaN(kdinput) ? 0 : kdinput;
    var errorAccum = 0;
    var lastError = setpoint - x;
    
    var pts = [];
    var volts = [];
    var amps = [];
    for (var t = 0; t < totalTime / timestep; t += 1) {
        // pid
        var error = setpoint - x;
        var derror = (error - lastError) / timestep;
        lastError = error;
        
        var voltage = kp * error + ki * errorAccum + kd * derror;
		if (antiwindup) {
			if (voltage < 12 && voltage > -12) {
				errorAccum += error * timestep;
			}
		} else {
			errorAccum += error * timestep;
		}
		
        if (voltage > 12) {
            voltage = 12;
        } else if (voltage < -12) {
            voltage = -12;
        }
        volts[t] = voltage;
        
        // simulation
        var ddx = (kt / (resistance * mass * radius)) * (voltage - dx / (radius * kv) - (resistance * mass * radius * g) / kt);
        dx += ddx * timestep;
        x += dx * timestep;
        
        var torque = mass * radius * (ddx + g);
        amps[t] = torque / kt;
        
        pts[t] = x;
		
		//console.log(error);
    }
    
    var maxheight = 4;
    if (setpoint > maxheight) {
        maxheight = setpoint * 1.25;
    }
    for (var i = 0; i < pts.length; i += 1) {
        if (pts[i] > maxheight) {
            maxheight = pts[i] * 1.25;
        }
    }
	
	//clear graph
	ctx.clearRect(0, 0, cwidth, cheight);
	
	// draw setpoint
    ctx.beginPath();
    ctx.strokeStyle = 'blue';
    var height = setpoint / maxheight * cheight * 0.75;
    ctx.moveTo(0, cheight * 0.75 - height);
    ctx.lineTo(cwidth, cheight * 0.75 - height);
    ctx.stroke();
    
	// draw path
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.moveTo(0, cheight);
    for (var t = 0; t < totalTime / timestep; t += 1) {
        var height = pts[t] / maxheight * cheight * 0.75;
        ctx.lineTo(t * cwidth * timestep / totalTime, cheight * 0.75 - height);
        
        //console.log(amps[t]);
    }
    ctx.stroke();
	
}