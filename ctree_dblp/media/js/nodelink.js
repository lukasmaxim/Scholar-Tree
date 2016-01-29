var width = 1200,
    height = 1200;

var color = d3.scale.category20(); // stander color scale

// var force = d3.layout.force()
//     .charge(-120)
//     .linkDistance(30)
//     .size([width, height]);

var svg = d3.select("#nl_canvas").append("svg")
    .attr("width", width)
    .attr("height", height);

// var mydata = {}
// var scale = d3.scale.linear()
//     .domain([0, 500])
//     .range([0,100]);

var mydata = {};
var force = d3.layout.force();
var nodes, links;
d3.json("../data/research_graph.json", function(error, alldata) {
  if (error) throw error;
  mydata = alldata;
  
  init();
  draw_graph(mydata.KLM);
  click_event();
});

var click_event = function(){
  $("#tree1").click(function(){
    console.log("click tree1 in nodelink");
    d3.select("svg").remove(); 
    svg = d3.select("#nl_canvas").append("svg")
    .attr("width", width)
    .attr("height", height);
    // render(mydata.Wijk, svg);
    draw_graph(mydata.KLM);
  });
  $("#tree2").click(function(){
    console.log("click tree2 in nodelink");
    d3.select("svg").remove(); 
    svg = d3.select("#nl_canvas").append("svg")
    .attr("width", width)
    .attr("height", height);
    // render(mydata.KLM, svg);
    draw_graph(mydata.Wijk);
  });
  $("#tree3").click(function(){
    console.log("click tree3 in nodelink");
    d3.select("svg").remove(); 
    svg = d3.select("#nl_canvas").append("svg")
    .attr("width", width)
    .attr("height", height);
    // render(mydata.BenS, svg);
    draw_graph(mydata.BenS);
  });
  $("#tree4").click(function(){
    console.log("click tree4 in nodelink");
    d3.select("svg").remove(); 
    svg = d3.select("#nl_canvas").append("svg")
    .attr("width", width)
    .attr("height", height);
    // render(mydata.JHeer, svg);
    draw_graph(mydata.JHeer);
  });
};

function init(){
  force
    .charge(-120)
    .size([width, height])
    .linkDistance(80);
    // .start();

  var drag = force.drag()
    .on("dragstart", dragstart);
  
  // nodes = graph.nodes;
  // links = graph.links;
}

function draw_graph(graph){
  // graph = mydata.Wijk
  force
    .nodes(graph.nodes)
    .links(graph.links)
    .start();

  var link = svg.selectAll(".link")
      .data(graph.links);
  link
    .enter().append("line")
      .attr("class", "link")
      .style("stroke", function(d) { return d.value; });
      // .style("stroke-width", 3);

  link.exit().remove();

  var node = svg.selectAll(".node")
      // .data(nodes);
      .data(graph.nodes);
    // .enter().append("circle")
  node
    .enter().append("g")
      .attr("class", "node")
      // .attr("r", function(d) { return d.size/10;} )
      // .style("fill", function(d) { return color(d.group); });
      // .style("fill", function(d) { return d.group;})
      .call(force.drag);
      // .call(drag);

  node.append("title")
      .text(function(d) { return d.label; });

  node.append("path")
      .attr("d", d3.svg.symbol()
        .size(function(d) { return d.size*10; })
        .type(function(d) { return d.type; }))
      .style("fill", function(d) { return d.group;});

  node.exit().remove();

  
  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    // node.attr("cx", function(d) { return d.x; })
    //     .attr("cy", function(d) { return d.y; });
      node.attr("transform", function setPosition(d) {
        return "translate(" + d.x + "," + d.y +")";
      });
  });

}



function render(graph, svg){
  // graph = mydata.Wijk
  var force = d3.layout.force()
    .charge(-120)
    .linkDistance(30)
    .size([width, height]);

  var drag = force.drag()
    .on("dragstart", dragstart);
  
  force
      .nodes(graph.nodes)
      .links(graph.links)
      .linkDistance(80)
      .start();

  var link = svg.selectAll(".link")
      .data(graph.links)
    .enter().append("line")
      .attr("class", "link")
      .style("stroke", function(d) { return d.value; });
      // .style("stroke-width", 3);

  var node = svg.selectAll(".node")
      .data(graph.nodes)
    // .enter().append("circle")
    .enter().append("g")
      .attr("class", "node")
      // .attr("r", function(d) { return d.size/10;} )
      // .style("fill", function(d) { return color(d.group); });
      // .style("fill", function(d) { return d.group;})
      .call(force.drag);
      // .call(drag);

  node.append("title")
      .text(function(d) { return d.label; });

  node.append("path")
      .attr("d", d3.svg.symbol()
        .size(function(d) { return d.size*10; })
        .type(function(d) { return d.type; }))
      .style("fill", function(d) { return d.group;});
  
  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    // node.attr("cx", function(d) { return d.x; })
    //     .attr("cy", function(d) { return d.y; });
      node.attr("transform", function setPosition(d) {
        return "translate(" + d.x + "," + d.y +")";
      });
  });
}

function dragstart(d) {
  d3.select(this).classed("fixed", d.fixed = true);
}
