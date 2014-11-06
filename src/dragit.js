(function(){

  var dragit = window.dragit || {};
  window.dragit = dragit;

  dragit.version = "0.1";

   var vars = {
      "dev": false
    };

  dragit.statemachine = {current_state:"idle", current_id:-1};
  dragit.time = {min:0, max:0, current:0, step:1}
  dragit.utils = {};
  dragit.mouse = {dragging:"closest"};
  dragit.object = {update: function() {}, accesor: function() {}, offsetX:0, offsetY:0}
  dragit.partition = {};
  dragit.data = [];

  dragit.evt = {};                // List of events binded to states
  dragit.evt.dragstart = [];      // dragstart: end of dragging
  dragit.evt.drag = [];           // dragend: end of dragging
  dragit.evt.dragend = [];        // dragend: end of dragging

  dragit.guide = {};

  dragit.trajectory = {interpolate: "linear"};

dragit.trajectory.init = function(tc) {  

  this.tc = tc;

}

dragit.trajectory.display = function(d, i) {

  // Making sure we do not display twice the same trajectory.
  if(dragit.statemachine.current_state == "drag" && dragit.statemachine.current_id == i)
    return;

  if(vars.dev) console.log("display", dragit.statemachine.current_state, dragit.statemachine.current_id, i)

  dragit.statemachine.current_id = i;

  var svgLine = d3.svg.line()
                      .x(function(d) {return d[0]; })
                      .y(function(d) { return d[1]; })
                      .interpolate(dragit.trajectory.interpolate);

  gDragit = svg.insert("g").attr("class", "gDragit")

  dragit.lineGraph = gDragit.selectAll(".lineTrail")
                  .data([dragit.data[i]])
                .enter().append("path")
                  .attr("d", svgLine)
                  .attr("class", "lineTrail")

  dragit.pointsGraph  = gDragit.selectAll(".pointsTrail")
                    .data(dragit.data[i].filter(function(e, j) { 
                      return e!==dragit.data[i][dragit.time.current-dragit.time.min]; 
                    }))
                  .enter().append("svg:circle")
                    .attr("class", "pointsTrail")
                    .attr('cx', function(d) { return d[0]; })
                    .attr('cy', function(d) { return d[1]; })
                    .attr('r', 3);

  dragit.lineSimple = gDragit.selectAll(".lineSimple")
                  .data([dragit.data[i]])
                .enter().append("path")
                  .attr("class", "lineSimple")
                  .attr("d", svgLine.interpolate("monotone"));

}

dragit.trajectory.toggle = function() {

  // Test if already visible or not

  // Test if dragit object exists

}

dragit.trajectory.toggleAll = function() {
  if(d3.selectAll(".gDragit")[0].length > 0)
    dragit.trajectory.removeAll();
  else
    dragit.trajectory.displayAll();
}

dragit.trajectory.displayAll = function() { 
  dragit.data.map(function(d, i) {
    dragit.trajectory.display({}, i)    
  })
} 

dragit.trajectory.remove = function(d, i) {
  if(dragit.statemachine.current_state != "drag")
    d3.select(".gDragit").remove();
}

dragit.trajectory.removeAll = function() { 
  d3.selectAll(".gDragit").remove();
}

// Automatically add an HTML slider to navigate in the timecube
// TODO: <input type="range" name="points" min="0" max="20" step="1" value="0" id="slider-time" oninput="update(this.value, 100)"> <span id="max-time">0</span>
dragit.utils.slider = function(el) {

  d3.select(el).append("p").style("clear", "both");
  d3.select(el).append("span").attr("id", "min-time").text(dragit.time.min);
  d3.select(el).append("input").attr("type", "range")
  d3.select(el).append("span").attr("id", "max-time").text(dragit.time.max);

}

// Calculate the centroif of a given SVG element
dragit.utils.centroid = function(s) {
  var e = selection.node(),
  bbox = e.getBBox();
  return [bbox.x + bbox.width/2, bbox.y + bbox.height/2];
}

// Main function that binds drag callbacks to the current element
dragit.object.activate = function(d, i) {

  if (vars.dev) console.log("Activate", d, i)

  d.call(d3.behavior.drag()
    .on("dragstart", function(d, i) {

      // Init coordinates for the dragged object of interest
      d.x = 0;
      d.y = 0;

      // Create elements for trajectories
      dragit.lineGuide = gDragit.append("line").attr("class", "lineGuide")
      dragit.valueGuide = gDragit.append("line").attr("class", "valueGuide")
      dragit.pointGuide = gDragit.append("circle").attr({cx: -10, cy: -10, r: 3.5}).attr("class", "pointGuide")
      dragit.focusGuide = gDragit.append("circle").attr({cx: -10, cy: -10, r: 5.5}).attr("class", "focusGuide")

      dragit.statemachine.current_state = "drag";

      // Call dragend events
      dragit.evt.dragstart.forEach(function(e, j) {
        if(vars.dev) console.log("dragstart", d, i)
        
        if(typeof(e) != "undefined")
          e(d, i)
          //setTimeout(e(d, i), 100) 
      });


    })
    .on("drag", function(d,i) {

      switch(dragit.mouse.dragging) {

        case "free":

          d.x += d3.event.dx
          d.y += d3.event.dy

          d3.select(this).attr("transform", function(d,i){
            return "translate(" + [ d.x,d.y ] + ")"
          })  

      }

      list_distances = [], list_times = [], list_lines = [], list_p = [], list_q = [];

      var m = [d3.event.x+dragit.object.offsetX, d3.event.y+dragit.object.offsetY];

//      case "closestpoint":
//      case "closestcurve":

      // Browse all the .lineTrail trajectories
      d3.selectAll(".lineTrail")[0].forEach(function(e, j) {

        dragit.lineGraph = d3.select(e);

        var  p = dragit.utils.closestPoint(dragit.lineGraph.node(), m);
        closest = dragit.utils.closestValue(m, dragit.data[i]);

        // Find the closest data point
        q = dragit.data[i][[closest.indexOf(Math.min.apply(Math, closest))]];

        list_p.push(p);
        list_q.push(q);

        // Store all the distances
        list_distances.push(Math.sqrt((p[0] - m[0]) * (p[0] - m[0]) + (p[1] - m[1]) * (p[1] - m[1])));

        var new_time = closest.indexOf(Math.min.apply(Math, closest)) + dragit.time.min;

        // Store the closest time
        list_times.push(new_time);

        // Store the current line
        list_lines.push(j);
      })

      // Find the index for the shortest distance
      var index_min = list_distances.indexOf(d3.min(list_distances));

      var new_time = list_times[index_min];

      // Draw guides
      dragit.lineGuide.attr("x1", list_p[index_min][0]).attr("y1", list_p[index_min][1]).attr("x2", m[0]).attr("y2", m[1]);
      dragit.pointGuide.attr("cx", list_p[index_min][0]).attr("cy", list_p[index_min][1]);
      dragit.valueGuide.attr("x1", list_q[index_min][0]).attr("y1", list_q[index_min][1]).attr("x2", m[0]).attr("y2", m[1]);
      
      // Focus follows the mouse cursor
      dragit.focusGuide.attr("cx", m[0]).attr("cy", m[1]);

      // Update to the closest snapshot
      if(dragit.time.current != new_time || dragit.trajectory.index_min != index_min) {
        dragit.trajectory.index_min = index_min;
        dragit.time.current = new_time;
        dragit.object.update();
      }

      dragit.evt.drag.forEach(function(e, j) {
        if(typeof(e) != "undefined")
          e(d, i)
      });

    })
    .on("dragend", function(d,i) {

      dragit.lineGuide.remove();
      dragit.valueGuide.remove();
      dragit.pointGuide.remove();
      dragit.focusGuide.remove();

      // Remove trajectory
      d3.selectAll(".gDragit").remove();

      // Snapping
      switch(dragit.mouse.dragging) {

        case "free":
          d.x = 0;
          d.y = 0;

          d3.select(this).transition().duration(200).attr("transform", function(d,i){
              return "translate(" + [ d.x, d.y ] + ")"
          })
          //.attr("cx", q[0])
          //.attr("cy", q[1])

      }

      // Call dragend events
      dragit.evt.dragend.forEach(function(e, j) {
        if(typeof(e) != "undefined")
          e(d, i)
          //setTimeout(e(d, i), 100) 
      });     

        dragit.statemachine.current_state = "idle";
        dragit.statemachine.current_id = -1;
      })
  )
  } 
  
})()

// Credits: http://bl.ocks.org/mbostock/8027637
dragit.utils.closestPoint  = function(pathNode, point) {

  var pathLength = pathNode.getTotalLength(),
      precision = pathLength / pathNode.pathSegList.numberOfItems * .125,
      best,
      bestLength,
      bestDistance = Infinity;

  // linear scan for coarse approximation
  for (var scan, scanLength = 0, scanDistance; scanLength <= pathLength; scanLength += precision) {
    if ((scanDistance = distance2(scan = pathNode.getPointAtLength(scanLength))) < bestDistance) {
      best = scan, bestLength = scanLength, bestDistance = scanDistance;
    }
  }

  // binary search for precise estimate
  precision *= .5;
  while (precision > .5) {
    var before,
        after,
        beforeLength,
        afterLength,
        beforeDistance,
        afterDistance;
    if ((beforeLength = bestLength - precision) >= 0 && (beforeDistance = distance2(before = pathNode.getPointAtLength(beforeLength))) < bestDistance) {
      best = before, bestLength = beforeLength, bestDistance = beforeDistance;
    } else if ((afterLength = bestLength + precision) <= pathLength && (afterDistance = distance2(after = pathNode.getPointAtLength(afterLength))) < bestDistance) {
      best = after, bestLength = afterLength, bestDistance = afterDistance;
    } else {
      precision *= .5;
    }
  }

  best = [best.x, best.y];
  best.distance = Math.sqrt(bestDistance);
  return best;

  function distance2(p) {
    var dx = p.x - point[0],
        dy = p.y - point[1];
    return dx * dx + dy * dy;
  }
}

dragit.utils.closestValue  = function(p, points) {
  //console.log("closest", points)
  var distances = points.map(function(d, i) { 
    var dx = d[0]-p[0];
    var dy = d[1]-p[1];
    return Math.sqrt(dx*dx + dy*dy);
  })
  return distances;
}