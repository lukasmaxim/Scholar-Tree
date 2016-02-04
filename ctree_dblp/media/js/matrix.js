var margin = { top: 0, right: 0, bottom: 50, left: 50 },
// width = 750 - margin.left - margin.right,
// height = 900 - margin.top - margin.bottom;
width = 1000 - margin.left - margin.right,
height = 1000 - margin.top - margin.bottom;

/* Public variable */
var scaleNumber = 1;

// Input file name for row
// var ROW_VALUE_FILE = "new_wave/Thomas_E_matrix_1_row.csv";

// Input file name for column
// var COL_VALUE_FILE = "new_wave/Thomas_E_matrix_1_col.csv";

// Input file name for each cell
// var CELL_VALUE_FILE = "new_wave/Thomas_E_matrix_1_color.csv";



// Length between matrix and legend
var LEGENG_MARING_TOP = 40;

var colors = ["#ffffff","#e39ac5","#b04d84","#821b54","#b04d84","#e39ac5", "#e39ac5","#FFFFFF"];
// var colors = ["#ffffd9","#7fa2c7","#4c7db1", "#004690","#f0a9ab","#e5686c","#ce1141","#FFFFFF"]; // case2 yellow, b1, b2, b3, r1, r2 ,r3
// var colors = ['#FFFFD9', '#D8DAEB', '#998EC3', '#542788']
var range = [0, 1, 2, 3, 4, 5, 6];


/* Private variable */
var matrixWidth = 0;
var matrixHeight = 0;

var rowValue = new Array();
var rowName = new Array();
var rowMark = new Array();
var rowNumber = 0;

var colValue = new Array();
var colName = new Array();
var colNumber = 0;

var cellValue = new Array();
// var cellNumber = 0;
var egos;
var ipaddress = "";
var fn;
function get_ip(){
  $.getJSON("http://jsonip.com?callback=?", function (data) {
      // alert("Your ip: " + data.ip);
      ipaddress = data.ip.replace(/\./g, '');
      fn = "../data/research_matrix_" + ipaddress + ".json";
      get_data();
  });
}

function get_data(){
  d3.json(fn, function(error, mydata) {
    if (error) throw error;
    egos = mydata
    ego_matrix = mydata.tree1;
    set_color_value(ego_matrix);
    set_row_value(ego_matrix);
    set_col_value(ego_matrix);
    draw_matrix();
    click_event()
  });
}

get_ip();


var click_event = function(){
  $("#tree1").click(function(){
    console.log("click tree1 in matrix");
    d3.select("svg").remove(); 
    svg = d3.select("#nl_canvas").append("svg")
    .attr("width", width)
    .attr("height", height);
   
    set_color_value(egos.tree1);
    set_row_value(egos.tree1);
    set_col_value(egos.tree1);
    draw_matrix();
  });
  $("#tree2").click(function(){
    console.log("click tree2 in matrix");
    d3.select("svg").remove(); 
    svg = d3.select("#nl_canvas").append("svg")
    .attr("width", width)
    .attr("height", height);
    
    set_color_value(egos.tree2);
    set_row_value(egos.tree2);
    set_col_value(egos.tree2);
    draw_matrix();
  });
  $("#tree3").click(function(){
    console.log("click tree3 in matrix");
    d3.select("svg").remove(); 
    svg = d3.select("#nl_canvas").append("svg")
    .attr("width", width)
    .attr("height", height);
    
    set_color_value(egos.tree1);
    set_row_value(egos.tree1);
    set_col_value(egos.tree1);
    draw_matrix();
  });
  $("#tree4").click(function(){
    console.log("click tree4 in matrix");
    d3.select("svg").remove(); 
    svg = d3.select("#nl_canvas").append("svg")
    .attr("width", width)
    .attr("height", height);
    set_color_value(egos.tree2);
    set_row_value(egos.tree2);
    set_col_value(egos.tree2);
    draw_matrix();
  });
};

// Read in cell value
function set_color_value(ego) {
  cellValue = [];
  var s = 0;
  for(s = 0; s < ego.color.length; s++){
    cellValue[s] = ego.color[s];
  } 
}

var colScaleNumber = 2;
var rowScaleNumber = 3;
// Read in row value
function set_row_value(ego) {
  colName = [];
  colValue = [];
  colMark = [];
 
  for(colNumber = 0; colNumber < ego.column.length; colNumber++){
    // colName[colNumber] = "";
    colName[colNumber] = ego.column[colNumber][0];
    colValue[colNumber] = ego.column[colNumber][1] * colScaleNumber;
    colMark[colNumber] = ego.column[colNumber][2] * 3;
    
  }
}

// Read in column value
function set_col_value(ego) {
  rowName = [];
  rowValue = [];
  
  for(rowNumber = 0; rowNumber < ego.row.length; rowNumber++){
    rowName[rowNumber] = ego.row[rowNumber][0];
    // if(ego.row[rowNumber][0] == 'None')
    //   rowName[rowNumber] = 30;
    rowValue[rowNumber] = ego.row[rowNumber][1] * rowScaleNumber;
  }

}

function draw_matrix(){
  for (var i = 0; i < rowNumber; ++i)
      matrixHeight += rowValue[i];

    for (var i = 0; i < colNumber; ++i)
      matrixWidth += colValue[i];

  width = matrixWidth + 100;
  height = matrixHeight;
  var svg = d3.select("#chart").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  // .attr("id", "diagram")
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Append column labels
  var rowLabels = svg.selectAll(".rowLabel")
  .data(rowName)
  // .enter().append("text")
  .enter().append("circle")
  .text(function(d) {return d;})
  .attr("cx", 0)
  .attr("cy", function(d, i) {
   var len = 30;
   for (var t = 0; t < i; ++t) {
    len += rowValue[t];
  }
  len += 0.5 * rowValue[t];
  return len;
  })
  .attr("r", function(d, i) {
    if(rowName[i] == 'self')
      return 3;
    else
      return 0
  })
  .attr("transform", "translate(-17, 0)")
  .style("stroke", "#f45e00")
  .style("fill", "#f45e00");
  

  // Append column mark
  var colLabels = svg.selectAll(".colLabel")
  .data(colMark)
  .enter().append("circle")
  .text(function(d) {return d;})
  .attr("cx", function(d, i) {
    var len = 0;
    for (var t = 0; t < i; ++t) {
     len += colValue[t];
    }
    len += 0.5 * colValue[t];
    return len;
  })
  .attr("cy", 0)
  .attr("r", function(d, i) {return colMark[i];})
  .attr("transform", "translate(0, 17)")
  .style("stroke", "#f45e00")
  .style("fill", "#f45e00");


  // Draw the matrix
  var heatMap = svg.selectAll(".hit")
  .data(cellValue)
  .enter().append("rect")
  .attr("x", function(d, i) {
    var len = 0;
    for (var t = 0; t < (i%colNumber); ++t) {
      len += colValue[t];
    }
    return len;
  })
  .attr("y", function(d, i) {
    var len = 30;
    for (var t = 0; t < (Math.floor(i/colNumber)); ++t) {
      len += rowValue[t];
    }
    return len;
  })
  .attr("class", "hour bordered")
  // .attr("class", "legend")
  .attr("width", function(d, i) {return colValue[i%colNumber]; })
  .attr("height", function(d, i) {return rowValue[Math.floor(i/colNumber)]; })
  // .style("stroke", colors[0])
  .style("stroke-width", 1 )
  .style("stroke", '#dddddd')
  .style("fill", colors[0]);

  heatMap //.transition().duration(1000)
  .style("fill", function(d, i) {
    return colors[d];
  });

  heatMap.append("title")
    .text(function(d, i) { return colName[i%colNumber] + " (" + rowName[Math.floor(i/colNumber)] + ")"; });
}