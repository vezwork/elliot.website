//document.getElementsByClassName("error")[0].innerHTML = "no days specified";


var times_array = [[],[],[],[],[]];
var names_array = [];
var days_array = [[],[],[],[],[]];
var output_array = [];
var counter = 0;
var minTime = 1440;
var maxTime = 0;

var classTimeAmmount = [1, 1];

function submit() {
	
	times_array = [];
	names_array = [];
	days_array = [];
	output_array = [];
	counter = 0;
	minTime = 1440;
	maxTime = 0;
	
	if (storeDays() && storeTimes() && storeNames()) {
		if (calculateCalander(8)) {
			if (counter == 0) {
				displayError("no viable timetables found :(");
			} else {
				updateTimeMinAndMax(0);
				displayTimeTable(0);
				putTimeOptions();
				document.getElementsByClassName("right-panel")[0].scrollIntoView();
			}
		}
	}
	
}

function add_class_div() {
	var div = document.createElement('div');
	div.innerHTML = "<input type='text' placeholder='Class name' class='class-name-input'></input><br></br><div style='clear:both;'><input type='text' placeholder='time 1 start' class='time-input'></input><input type='text' placeholder='time 1 end' class='time-input'></input></div><div class='days'><div style='clear:both;'><label><input type='checkbox' class='day-input'><text>&nbsp;sun&nbsp;</text></label><label><input type='checkbox' class='day-input'><text>&nbsp;mon&nbsp;</text></label><label><input type='checkbox' class='day-input'><text>&nbsp;tue&nbsp;</text></label><label><input type='checkbox' class='day-input'><text>&nbsp;wed&nbsp;</text></label><label><input type='checkbox' class='day-input'><text>&nbsp;thu&nbsp;</text></label><label><input type='checkbox' class='day-input'><text>&nbsp;fri&nbsp;</text></label><label><input type='checkbox' class='day-input'><text>&nbsp;sat&nbsp;</text></label></div></div><button onclick='add_time_div(" + (classTimeAmmount.length) + ")' style='position:absolute; bottom: 17px; left: 10%; width: 60%;'> add another time + </button>";
	div.className = "inputs";
	document.getElementsByClassName("left-panel")[0].appendChild(div);
	classTimeAmmount.push(1);
}

function add_time_div(arg) {
	var div = document.createElement('div');
	div.innerHTML = "<div style='clear:both;'><input type='text' placeholder='time 2 start' class='time-input'></input><input type='text' placeholder='time 2 end' class='time-input'></input></div><div class='days'><div style='clear:both;'><label><input type='checkbox' class='day-input'><text>&nbsp;sun&nbsp;</text></label><label><input type='checkbox' class='day-input'><text>&nbsp;mon&nbsp;</text></label><label><input type='checkbox' class='day-input'><text>&nbsp;tue&nbsp;</text></label><label><input type='checkbox' class='day-input'><text>&nbsp;wed&nbsp;</text></label><label><input type='checkbox' class='day-input'><text>&nbsp;thu&nbsp;</text></label><label><input type='checkbox' class='day-input'><text>&nbsp;fri&nbsp;</text></label><label><input type='checkbox' class='day-input'><text>&nbsp;sat&nbsp;</text></label></div></div>";
	div.className = "inner";
	document.getElementsByClassName("inputs")[arg].appendChild(div);
	classTimeAmmount[arg]++;
}

function putTimeOptions() {
	
	document.getElementsByClassName("time-options")[0].innerHTML = "";
	for (i = 0; i < Math.min(counter, 8); i++) {
		var div = document.createElement('div');
		div.innerHTML = "option " + (i + 1);
		div.className = "option";
		div.number = i;
		div.onclick = function(){ 
			minTime = 1440;
			maxTime = 0;
			updateTimeMinAndMax(this.number);
			displayTimeTable(this.number);
			
			for (j = 0; j < document.getElementsByClassName("option").length; j++) {
				document.getElementsByClassName("option")[j].style.boxShadow = "";
			}
			this.style.boxShadow = "0 -3px 0px #FFF inset";
		};
		document.getElementsByClassName("time-options")[0].appendChild(div); 
		document.getElementsByClassName("option")[0].style.boxShadow = "0 -3px 0px #FFF inset";
	}
}

function updateTimeMinAndMax(i) {
	for (j = 0; j < output_array[i].length; j++) {
		if (times_array[j][(output_array[i][j]-1)*2] < minTime) {
			minTime = times_array[j][(output_array[i][j]-1)*2];
		}
		if (times_array[j][output_array[i][j]*2-1] > maxTime) {
			maxTime = times_array[j][output_array[i][j]*2-1];
		}
	}

}

function displayTimeTable(i) {
	document.getElementsByClassName("calander")[0].style.display = "block"; 
	var ratio = Math.abs(document.getElementsByClassName("right-panel")[0].clientHeight/(maxTime - minTime + 120));
	
	document.getElementsByClassName("right-panel")[0].innerHTML = "<div class='day-title'>saturday</div><div class='day-title'>friday</div><div class='day-title'>thursday</div><div class='day-title'>wednesday</div><div class='day-title'>tuesday</div><div class='day-title'>monday</div><div class='day-title'>sunday</div>";	
	
	for (n = 0; ((60 - (minTime)%60) + 60 * (n-1)) * ratio < 540 ; n++) {	//place hour rows
		var div = document.createElement('div');
		div.className = "hourRow";
		div.innerHTML = "&nbsp;" + MinutesToString(Math.floor((minTime - 60 + (n*60))/60)*60);
		if (n == 0) {
			div.style.height =  (60 - (minTime)%60) * ratio + "px";
			div.style.top = "0px";
			if (!((60 - (minTime)%60) * ratio > 20)) {
				div.innerHTML = "";
			} 
		} else {
			div.style.height = 60 * ratio + "px"; (60 - (minTime)%60)
			div.style.top = ((60 - (minTime)%60) + 60 * (n-1)) * ratio + "px";
		}
		document.getElementsByClassName("right-panel")[0].appendChild(div);
	}
	for (j = 0; j < output_array[i].length; j++) {		//place time slots
		for(k = 0; k < 7; k++) {
			if (days_array[j][output_array[i][j]-1][k] == "1") {
				var div = document.createElement('div');
				div.innerHTML = "<div>" + names_array[j] + "<br>" + MinutesToString(times_array[j][(output_array[i][j]-1)*2]) + "-" + MinutesToString(times_array[j][output_array[i][j]*2-1]) + "</div>";
				div.style.top = (times_array[j][(output_array[i][j]-1)*2] - minTime + 60) * ratio + "px";
				div.style.left = (k+1)*12.5+"%";
				div.style.height = (times_array[j][output_array[i][j]*2-1] - times_array[j][(output_array[i][j]-1)*2]) * ratio + "px";
				div.style.fontSize = Math.min(14, (times_array[j][output_array[i][j]*2-1] - times_array[j][(output_array[i][j]-1)*2]) * ratio/3) + "px";
				div.className = "timeSlot";
				
				switch (j) {
					case 0:
						div.style.backgroundColor = "#C5E1A5"; 
						break;
					case 1:
						div.style.backgroundColor = "#FFF59D"; 
						break;
					case 2:
						div.style.backgroundColor = "#E6EE9C"; 
						break;
					case 3:
						div.style.backgroundColor = "#FFE082"; 
						break;
					case 4:
						div.style.backgroundColor = "#A5D6A7"; 
						break;
				}
				document.getElementsByClassName("right-panel")[0].appendChild(div);
			}
		}
	}
	
}

function timeConflictCheck(you, them, x, y) {
	if ((times_array[you][x-1] >= times_array[them][y-1] && times_array[you][x-1] < times_array[them][y]) || (times_array[you][x] > times_array[them][y-1] && times_array[you][x] <= times_array[them][y]) || (times_array[you][x-1] <= times_array[them][y-1] && times_array[you][x] >= times_array[them][y])) {
		for (n = 0; n < 7; n++) {
			if (days_array[you][Math.floor(x/2)][n] == 1 && days_array[them][Math.floor(y/2)][n] == 1) {
				return true;
			}
		}
	}     
	return false;	
}

function calculateCalander(max_counter) {
	if (times_array[1].length == 0 || times_array[0] == 0) {
		displayError("Please enter times for at least 2 classes.");
		return false;
	}
	
	var counter_array = [];
	
	for (i = 0; i < times_array.length; i++) { //init counter array to 0
		if (times_array[i].length != 0) {
			counter_array[i] = 1;
		} else {
			break;
		}
	}
	
	while (counter_array[0] <= times_array[0].length && counter <= max_counter) {
		var fail = false;
		var temp_array = [];
		
		for (i = 1; i < counter_array.length && !fail; i++) {
			for (j = 0; j < i; j++) {
				if (timeConflictCheck(i,j,counter_array[i],counter_array[j])) {
					fail = true;
					
					counter_array[i] = (counter_array[i] + 2)%times_array[i].length;
					while (counter_array[i] == 1) {
						i--;
						if (i == 0) {
							counter_array[i] = counter_array[i] + 2;
						} else {
							counter_array[i] = (counter_array[i] + 2)%times_array[i].length;
						}
					}
					
					break;
				}
			}
		}
		if (!fail) {
			for (k = 0; k < counter_array.length; k++) {
				temp_array.push((counter_array[k]+1)/2);
			}
			output_array.push(temp_array);
			counter++;
			var i = counter_array.length-1;
			counter_array[i] = (counter_array[i] + 2)%times_array[i].length;
			while (counter_array[i] == 1) {
				i--;
				if (i == 0) {
					counter_array[i] = counter_array[i] + 2;
				} else {
					counter_array[i] = (counter_array[i] + 2)%times_array[i].length;
				}
			}
		}
	}
	return true;
}

function storeDays() {
	var sum = 0;
	
	for (i = 0; i < document.getElementsByClassName("class-name-input").length; i++) {		//for each class input
		if (i != 0) {
			sum += (classTimeAmmount[i-1]) * 7;
		}
		days_array[i] = [];
		for (j = 0; j < classTimeAmmount[i]; j++) {	//for each day checkbox in a class input
			days_array[i][j] = "";
			for (k = 0; k < 7; k++) {
				days_array[i][j] += (document.getElementsByClassName("day-input")[(sum)+(j*7)+k].checked)? "1":"0";
			}
		}
	}
	return true;
}

function storeTimes() {
	var success = true;
	var errorMessage = "";
	var sum = 0;
	
	for (i = 0; i < document.getElementsByClassName("class-name-input").length; i++) {		//for each class input
		if (i != 0) {
			sum += classTimeAmmount[i-1] * 2;
		}
		times_array[i] = [];
		for (j = 0; j < classTimeAmmount[i] * 2; j++) {	//for each time input in a class input
			var tmp = parseTimeString(document.getElementsByClassName("time-input")[sum+j].value);

			if (tmp !== false) {
				times_array[i][j] = tmp;
				if (j%2 == 1) { 
					if (times_array[i][j-1] === undefined || times_array[i][j-1] >= times_array[i][j]) {
						document.getElementsByClassName("time-input")[sum+j].style.backgroundColor = "#673AB7";
						document.getElementsByClassName("time-input")[sum+j].style.color = "#FFF";
						errorMessage = "Invalid start time.";
						success = false;
					}
					else if (days_array[i][Math.floor(j/2)] == "0000000") {
						document.getElementsByClassName("time-input")[sum+j].style.backgroundColor = "#673AB7";
						document.getElementsByClassName("time-input")[sum+j].style.color = "#FFF";
						errorMessage = "Please specify days for your times.";
						success = false;
					} else {
						document.getElementsByClassName("time-input")[sum+j].style.backgroundColor = "transparent";
						document.getElementsByClassName("time-input")[sum+j].style.color = "#000";
					}
				} 
			} else {
				if ((j+1)%2 == 0) { 
					if (times_array[i][j-1] != null) {
						document.getElementsByClassName("time-input")[sum+j].style.backgroundColor = "#673AB7";
						document.getElementsByClassName("time-input")[sum+j].style.color = "#FFF";
						errorMessage = "Invalid end time.";
						success = false;
					} else {
						document.getElementsByClassName("time-input")[sum+j].style.backgroundColor = "transparent";
						document.getElementsByClassName("time-input")[sum+j].style.color = "#000";
						//break; dont scan other times in a class following an empty pair of times.
					}
				} 
			}
		}
	}
	if (!success) {
		displayError(errorMessage);
	} else {
		displayError(false);
	}
	return success;
}

function displayError(msg) {
	if (msg === false) {
		document.getElementsByClassName("error")[0].style.bottom = "-60px";
	} else {
		document.getElementsByClassName("error")[0].style.bottom = "5px";
		document.getElementsByClassName("error")[0].innerHTML = msg;
		document.getElementsByClassName("calander")[0].style.display = "none";
	}
}

function storeNames() {
	for (i = 0; i < document.getElementsByClassName("class-name-input").length; i++) {		//for each class input
		if (document.getElementsByClassName("class-name-input")[i].value != "") {
			names_array[i] = document.getElementsByClassName("class-name-input")[i].value;
		} else {
			names_array[i] = "class " + (i + 1);
		}
	}
	return true;
}

function MinutesToString (mins) {
	mins = mins%1440;
	if (mins < 0) {
		mins = 1440 + mins;
	} 
	
	if (mins >= 720) {
		if (Math.floor(mins/60) == 12) {
			if (mins%60 < 10) {
				return "12:" + mins%60 + "0 PM";
			} else {
				return "12:" + mins%60 + " PM";
			}
		} else if (mins%60 < 10) {
			return Math.floor(mins/60) - 12 + ":0" + mins%60 + " PM";
		} else {
			return Math.floor(mins/60) - 12 + ":" + mins%60 + " PM";
		}
	} else {
		if (Math.floor(mins/60) == 0) {
			if (mins < 10) {
				return "12:" + mins%60 + "0 AM";
			} else {
				return "12:" + mins%60 + " AM";
			}
		} else if (mins%60 < 10) {
			return Math.floor(mins/60) + ":0" + mins%60 + " AM";
		} else {
			return Math.floor(mins/60) + ":" + mins%60 + " AM";
		}
	}
}

//parses a string in the form 3:00 PM or 3:00 or 3:00 P.M. and returns the time in minutes.
//returns false if the string is not in the specified form.
function parseTimeString(str) {
	try {
		if (str.split(" ")[1].toUpperCase() == "PM" || str.split(" ")[1].toUpperCase() == "P.M.") {
			var PM = true;
		} else { var PM = false; }
	}
	catch(err){
		var PM = false;
	}
	
	
	try {
		var hour = parseInt(str.split(":")[0]);
		var min = parseInt(str.split(":")[1]);
		
	}
	catch(err) {
		return false;
	}
	
	if (PM) {
		if (hour >= 0 && hour <= 11 && min >= 0 && min <= 59) {
			return (hour*60) + min + 720;
		} else { return false; }
	} else {
		if (hour >= 0 && hour <= 23 && min >= 0 && min <= 59) {
			return (hour*60) + min;
		} else { return false; }
	}
}
