var ctx;
var cheight;
var cwidth;
var chart;
var pts;

function main() {
    // ctx = document.getElementById('canvas').getContext('2d');
    // ctx.canvas.width = window.innerWidth;
    // ctx.canvas.height = window.innerHeight * 0.75;
    // cwidth = window.innerWidth;
    // cheight = window.innerHeight * 0.75;
    
    sim();
	makeGraph();
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
    var setpoint = isNaN(setpointinput) ? 2 : setpointinput;
    var kp = isNaN(kpinput) ? 0 : kpinput;
    var ki = isNaN(kiinput) ? 0 : kiinput;
    var kd = isNaN(kdinput) ? 0 : kdinput;
    var errorAccum = 0;
    var lastError = setpoint - x;
    
    pts = [];
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
        
        pts[t] = {
			"t": (t * timestep).toFixed(2),
			"x": x.toFixed(3),
			"setpoint": setpoint,
			"voltage": voltage
		};
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
	//ctx.clearRect(0, 0, cwidth, cheight);
	
	// draw setpoint
    // ctx.beginPath();
    // ctx.strokeStyle = 'blue';
    // var height = setpoint / maxheight * cheight * 0.75;
    // ctx.moveTo(0, cheight * 0.75 - height);
    // ctx.lineTo(cwidth, cheight * 0.75 - height);
    // ctx.stroke();
    
	// draw path
    // ctx.beginPath();
    // ctx.strokeStyle = 'black';
    // ctx.moveTo(0, cheight);
    // for (var t = 0; t < totalTime / timestep; t += 1) {
        // var height = pts[t] / maxheight * cheight * 0.75;
        // ctx.lineTo(t * cwidth * timestep / totalTime, cheight * 0.75 - height);
        
        //console.log(amps[t]);
    // }
    // ctx.stroke();
	if (chart) {
		chart.dataProvider = pts;
		chart.validateData();
	}
}

function makeGraph() {
	chart = new AmCharts.AmSerialChart();

	chart.dataProvider = pts;
	chart.marginLeft = 10;
	chart.categoryField = "t";
	//chart.synchronizeGrid = true;

	// AXES

	// value
	var voltageAxis = new AmCharts.ValueAxis();
	voltageAxis.id = "voltageAxis";
	voltageAxis.title = "Voltage";
	voltageAxis.minimum = -15;
	voltageAxis.maximum = 15;
	voltageAxis.position = "right";
	chart.addValueAxis(voltageAxis);
	
	var posAxis = new AmCharts.ValueAxis();
	posAxis.id = "posAxis";
	posAxis.title = "Position";
	posAxis.maximum = 2.5;
	posAxis.synchronizeWithAxis(voltageAxis);
	chart.addValueAxis(posAxis);

	// GRAPH
	
	var graphVoltage = new AmCharts.AmGraph();
	graphVoltage.title = "Voltage";
	graphVoltage.valueAxis = "voltageAxis";
	graphVoltage.type = "line";
	graphVoltage.lineColor = "#ff7777";
	graphVoltage.lineThickness = 2;
	graphVoltage.valueField = "voltage";
	chart.addGraph(graphVoltage);
	chart.hideGraph(graphVoltage);
	
	var graphPos = new AmCharts.AmGraph();
	graphPos.title = "Position";
	graphPos.valueAxis = "posAxis";
	graphPos.type = "line"; // this line makes the graph line.
	graphPos.lineColor = "#000000";
	graphPos.lineThickness = 2;
	graphPos.valueField = "x";
	chart.addGraph(graphPos);
	
	var graphSetpoint = new AmCharts.AmGraph();
	graphSetpoint.title = "Setpoint";
	graphSetpoint.valueAxis = "posAxis";
	graphSetpoint.type = "line"; // this line makes the graph line.
	graphSetpoint.lineColor = "blue";
	graphSetpoint.lineThickness = 1;
	graphSetpoint.valueField = "setpoint";
	chart.addGraph(graphSetpoint);
	
	legend = new AmCharts.AmLegend();
	legend.align = "left";
	legend.markerType = "line";
	legend.markerBorderThickness = 3;
	legend.valueText = "";
	chart.addLegend(legend);
	
	// CURSOR
	var chartCursor = new AmCharts.ChartCursor();
	chartCursor.cursorPosition = "mouse";
	//chart.addChartCursor(chartCursor);

	chart.creditsPosition = "bottom-right";

	// WRITE
	chart.write("chartdiv");
}