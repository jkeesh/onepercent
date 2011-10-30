var D = console;

var NUM_COUNTIES = 3193;
var min_percent = 0;
var max_percent = 1;
var checkbox = true;
var INITIAL_VAL = 32; // for the 1%

var data; // loaded later
// var svg = d3.select("body")
//   .append("svg:svg")
var svg = d3.select("#map")
	 .append("svg:svg")
     .call(d3.behavior.zoom()
     .on("zoom", redraw))
     .append("svg:g");

var counties = svg.append("svg:g")
    .attr("id", "counties")
    .attr("class", "Blues");

var states = svg.append("svg:g")
    .attr("id", "states");

var path = d3.geo.path();

d3.json("income.json", function(json) {
  
  data = json;

  var max = 0;
  var min = 100000;
  var maxloc, minloc;
  for(var loc in data){
	if(data[loc]['income'] > max){
		max = data[loc].income;
		maxloc = loc;
	}
	if(data[loc]['income'] < min){
		min = data[loc].income;
		minloc = loc;
	}
	
	data[loc]['highlight'] = data[loc].numgreater <= INITIAL_VAL;
  }
  
	d3.json("./us-counties.json", function(json) {
	  counties.selectAll("path")
	      .data(json.features)
	      .enter().append("svg:path")
	      .attr("class", quantize)
	      .attr("d", path)
		  .on('mouseover', function(d){
				$("#name").html(data[d.id].name);
				$("#median_income").html(format_income(data[d.id].income));
				
				$('#percent').html("The " + percent(d) + " percent.");
				$('#details').html(data[d.id].numgreater + ' counties have a higher median income.');
			})
		  .on('mouseout', function(d){
				$("#name").html('');
				$('#median_income').html('');
                $('#percent').html('');
                $('#details').html('');
			})
		  .attr('highlight', should_highlight);
	});
	

	d3.json("./us-states.json", function(json) {
	  states.selectAll("path")
	      .data(json.features)
	      .enter().append("svg:path")
	      .attr("d", path);
	});
	
});


function redraw() {
  svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function quantize(d) {
  if(data == undefined) return null;
  var val = data[d.id];
  if(val == undefined) return "q0-9";
  var val = val.income;
  if(val == undefined) return "q0-9";

  var MAX = 115000;
  var MIN = 18000;
  var BUCKETS = 9;
  var percent = (val - MIN)/ (MAX - MIN);
  var bucket = Math.round(percent * BUCKETS);
  
  if(data[d.id].highlight && checkbox){
      return '';
  }else{
      return "q"+bucket+"-"+BUCKETS;
  }
}

function format_income(income){
	var thou = Math.floor(income / 1000);
	var rest = income % 1000;
	return "$" + thou + "," + rest;
}

function percent(cur){
    var result = Math.round(data[cur.id].numgreater / NUM_COUNTIES * 100);
    if(result == 0){ // Even though they are the 0%, call it the 1%.
        result = 1;
    }
    return result;
}


/// Highlight all counties between the min and max percentage.
/// min must be less than max
///
/// Example: hightlight(10, 33);
/// This should highlight the top third excluding the top ten percent, 
/// meaning the number of cities with a median income which less than
/// a third of the cities have a higher median income, but one where at
/// least ten percent have a higher median income.
function highlight(min, max){
    // The 'min' percentage corresponds to the upper bound on the count
    var mincount = NUM_COUNTIES * (min) / 100; 
    // The 'max' percentage corresponds to the lower bound on the count.
    var maxcount = NUM_COUNTIES * (max) / 100;
    
    for(loc in data){
        if(data[loc].numgreater >= mincount &&
           data[loc].numgreater <= maxcount){
               data[loc].highlight = true;
           }else{
               data[loc].highlight = false;
           }
    }
    
    update_colors();
}

function should_highlight(d){
    // The 'min' percentage corresponds to the upper bound on the count
    var mincount = Math.round(NUM_COUNTIES * (min_percent) / 100); 
    // The 'max' percentage corresponds to the lower bound on the count.
    var maxcount = Math.round(NUM_COUNTIES * (max_percent) / 100);
    if(data[d.id] == undefined) return false;

    var val =  data[d.id].numgreater >= mincount &&
            data[d.id].numgreater <= maxcount;

    return val;
}

function update_colors(){
    counties.selectAll("path")
        .attr('class', quantize);
}
