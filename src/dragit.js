(function() {

  var dragit = window.dragit || {};
  window.dragit = dragit;

  dragit.version = "0.1.3";

  var vars = {
      "dev": false,
      evt: [],
      tc: [],
      list_q: [],
      trajectory: {interpolate: "linear"},
      svgLine: null,
      container: null
    };

  vars.svgLine = d3.svg.line()
                      .x(function(d) {return d[0]; })
                      .y(function(d) { return d[1]; })
                      .interpolate(vars.trajectory.interpolate);

  dragit.trajectory = {};

  dragit.statemachine = {current_state: "idle", current_id: -1};
  dragit.time = {min: 0, max: 0, current: 0, step: 1};
  dragit.utils = {};
  dragit.mouse = {dragging: "closest"};
  dragit.object = {update: function() {}, accesor: function() {}, offsetX: 0, offsetY: 0};
  dragit.partition = {};
  dragit.data = [];

  dragit.evt = {};                            // events manager

  dragit.evt.register = null;
  dragit.evt.run = null;

  dragit.evt.update = [];                     // update
  dragit.evt.dragstart = [];                  // start dragging
  dragit.evt.drag = [];                       // during dragging
  dragit.evt.dragend = [];                    // end dragging
          
  dragit.evt.closestPoint = [];               // new closest point current element
  dragit.evt.closestAllPoints = [];           // new closest point globally

  dragit.evt.closestTrajectory = [];          // new closest trajectory current element
  dragit.evt.closestAllTrajectories = [];     // new closest trajectory globally

  dragit.guide = {};

dragit.evt.register = function(evt, f, d) {

  if(typeof vars.evt[evt] == "undefined")
    vars.evt[evt] = [];
  
  vars.evt[evt].push([f,d]);
}

dragit.evt.call = function(evt) {

  if(typeof vars.evt[evt] == "undefined") {
    console.warn("No callback for event", evt)
    return;
  }

  vars.evt[evt].forEach(function(e) {
    if(vars.dev) console.log("update", e)
    if(typeof(e[0]) != "undefined")
      e[0](e[1])
  });
}

dragit.init = function(container) {
  
  vars.container = d3.select(container);
} 

dragit.trajectory.display = function(d, i) {

  // Making sure we do not display twice the same trajectory
  if(dragit.statemachine.current_state == "drag" && dragit.statemachine.current_id == i)
    return;

  if(vars.dev) console.log("[display]", dragit.statemachine.current_state, dragit.statemachine.current_id, i)

  gDragit = vars.container.insert("g", ":first-child").attr("class", "gDragit")

  dragit.lineTrajectory = gDragit.selectAll(".lineTrajectory")
                  .data([dragit.data[i]])
                .enter().append("path")
                  .attr("d", vars.svgLine)
                  .attr("class", "lineTrajectory")

  dragit.pointTrajectory  = gDragit.selectAll(".pointTrajectory")
                    .data(dragit.data[i])
                  .enter().append("svg:circle")
                    .attr("class", "pointTrajectory")
                    .attr('cx', function(d) { return d[0]; })
                    .attr('cy', function(d) { return d[1]; })
                    .attr('r', 3);
}

dragit.trajectory.displayUpdate = function(d, i) {

  dragit.lineTrajectory.data([dragit.data[i]])
                  .transition()
                  .duration(0)
                  .attr("d", vars.svgLine);

  dragit.pointTrajectory.data(dragit.data[i])
                    .transition()
                    .duration(0)
                    .attr('cx', function(d) { return d[0]; })
                    .attr('cy', function(d) { return d[1]; })
                    .attr('r', 3);

  dragit.lineTrajectoryMonotone.data([dragit.data[i]])
                  .transition()
                  .duration(0)
                  .attr("d", vars.svgLine.interpolate("monotone"));
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

// Main function that binds drag callbacks to the current element
dragit.object.activate = function(d, i) {

  if (vars.dev) console.log("Activate", d, i)

  d3.select(this)[0][0].node().addEventListener("mouseenter", function() {
    if(dragit.statemachine.current_state == "idle") {
      dragit.statemachine.setState("mouseenter");
      dragit.statemachine.current_id = i;
    }
  }, false)

  d3.select(this)[0][0].node().addEventListener("mouseleave", function() {
    if(dragit.statemachine.current_state == "idle")
      dragit.statemachine.setState("mouseleave");
  }, false)

  d.call(d3.behavior.drag()
    .on("dragstart", function(d, i) {

      dragit.statemachine.setState("dragstart");
      if (vars.dev) console.log("[dragstart]", d, i)

      dragit.statemachine.current_id = i;

      // Initial coordinates for the dragged object of interest
      d.x = 0;
      d.y = 0;

      switch(dragit.mouse.dragging) {
        case "free":
        case "horizontal":
      }

      // Create the line guide to closest trajectory
      dragit.lineClosestTrajectory = gDragit.append("line")
                                            .attr("class", "lineClosestTrajectory");

      // Create the line guide to closest point
      dragit.lineClosestPoint = gDragit.append("line")
                                       .attr("class", "lineClosestPoint");

      // Create the point interesting guide line and closest trajectory
      dragit.pointClosestTrajectory = gDragit.append("circle")
                                              .attr({cx: -10, cy: -10, r: 3.5})
                                              .attr("class", "pointClosestTrajectory")

      // Create the focus that follows the mouse cursor
      dragit.focusGuide = gDragit.append("circle")
                                 .attr({cx: -10, cy: -10, r: 5.5})
                                 .attr("class", "focusGuide")

      // Calling registered drastart events
      dragit.evt.dragstart.forEach(function(e, j) {
        if(vars.dev) console.log("dragstart", d, i)
        if(typeof(e) != "undefined")
          e(d, i)
      });

    })
    .on("drag", function(d,i) {
      dragit.statemachine.setState("drag");
      if (vars.dev) console.log("[drag]", d, i)

      switch(dragit.mouse.dragging) {

        case "free":

          d.x += d3.event.dx
          d.y += d3.event.dy

          d3.select(this).attr("transform", function(d,i) {
            return "translate(" + [ d.x,d.y ] + ")";
          })  
          return;
          break;

        case "horizontal":

          d.x += d3.event.dx
          d.y = dragit.utils.findYgivenX(d.x, dragit.lineTrajectory)

          d3.select(this).attr("transform", function(d,i) {
            return "translate(" + [ d.x, d.y ] + ")";
          })  

          break;

        return
      }

      var list_distances = [], list_times = [], list_lines = [], list_p = [], list_q = [];

      var m = [d3.event.x+dragit.object.offsetX, d3.event.y+dragit.object.offsetY];

      // Browse all the .lineTrajectory trajectories
      d3.selectAll(".lineTrajectory")[0].forEach(function(e, j) {

        dragit.lineGraph = d3.select(e);

        var  p = dragit.utils.closestPoint(dragit.lineGraph.node(), m);

        var closest = dragit.utils.closestValue(m, dragit.data[i]);

        // Find the closest data point
        var q = dragit.data[i][[closest.indexOf(Math.min.apply(Math, closest))]];

        // List of closest distances to trajectory
        list_p.push(p);

        // List of closest distances to points
        list_q.push(q);

        // Store all the distances
        list_distances.push(Math.sqrt((p[0] - m[0]) * (p[0] - m[0]) + (p[1] - m[1]) * (p[1] - m[1])));

        var new_time = closest.indexOf(Math.min.apply(Math, closest)) + dragit.time.min;

        // Store the closest time
        list_times.push(new_time);

        // Store the current line
        list_lines.push(j);

        // Calling registered closestPoint events
        //if(!list_q.equals(vars.list_q)) {
        //  dragit.evt.closestPoint.forEach(function(e, j) {
        //    if(vars.dev) console.log("closestPoint", d, i)
        //    if(typeof(e) != "undefined")
        //      e(d, i, list_q, new_time)
        //  });
        //}

        vars.list_q = list_q;
      })

      // Find the index for the shortest distance
      var index_min = list_distances.indexOf(d3.min(list_distances));

      var new_time = list_times[index_min];

      dragit.time.current = new_time;

      // Update the line guide to closest trajectory
      dragit.lineClosestTrajectory.attr("x1", list_p[index_min][0])
                                  .attr("y1", list_p[index_min][1])
                                  .attr("x2", m[0])
                                  .attr("y2", m[1]);

      // Update the point interesting guide line and closest trajectory
      dragit.pointClosestTrajectory.attr("cx", list_p[index_min][0])
                                   .attr("cy", list_p[index_min][1]);

      // Update line guide to closest point
      dragit.lineClosestPoint.attr("x1", list_q[index_min][0])
                             .attr("y1", list_q[index_min][1])
                             .attr("x2", m[0])
                             .attr("y2", m[1]);
      
      // Update the focus that follows the mouse cursor
      dragit.focusGuide.attr("cx", m[0])
                       .attr("cy", m[1]);

      // Update to the closest snapshot
      if(dragit.time.current != new_time || dragit.trajectory.index_min != index_min) {
        dragit.trajectory.index_min = index_min;
        dragit.time.current = new_time;
        dragit.evt.call("update", new_time, 0); 
      }

      // Call drag events
      dragit.evt.drag.forEach(function(e, j) {
        if(typeof(e) != "undefined")
          e(d, i);
      });

    })
    .on("dragend", function(d,i) {
      dragit.statemachine.setState("dragend");
      if (vars.dev) console.log("[dragend]", d, i)

      switch(dragit.mouse.dragging) {

        case "free":
          d.x = 0;
          d.y = 0;

          d3.select(this).transition()
                         .duration(200)
                         .attr("transform", function(d,i) {
                            return "translate(" + [ d.x, d.y ] + ")"
                          })
                         //.attr("cx", q[0])
                         //.attr("cy", q[1])
          break;

        case "horizontal":
          break;
          
      }

      dragit.lineClosestTrajectory.remove();
      dragit.lineClosestPoint.remove();
      dragit.pointClosestTrajectory.remove();
      dragit.focusGuide.remove();

      // Remove trajectory
      d3.selectAll(".gDragit").remove();

      // Call dragend events
      dragit.evt.dragend.forEach(function(e, j) {
        if(typeof(e) != "undefined")
          e(d, i)
      });     

      dragit.statemachine.current_id = -1;
      dragit.statemachine.current_state = "idle";
    })

  )} 
  
})()

dragit.statemachine.addEventListener = function(state, evt) {

}

dragit.statemachine.setState = function(state) {
  dragit.statemachine.current_state = state;
}

// Create and add a DOM HTML slider for time navigation
dragit.utils.slider = function(el) {

  d3.select(el).append("p")
               .style("clear", "both");

  d3.select(el).append("span")
               .attr("id", "min-time")
               .text(dragit.time.min);

  d3.select(el).append("input")
                .attr("type", "range")
                .attr("class", "slider-time")
                .property("min", dragit.time.min)
                .property("max", dragit.time.max)
                .property("value", 10)
                .property("step", 1)
                .on("input", function() { 
                  dragit.time.current = parseInt(this.value)-dragit.time.min;
                  dragit.evt.call("update", this.value, 0); 
                })

  d3.select(el).append("span")
               .attr("id", "max-time")
               .text(dragit.time.max);
}

// Calculate the centroid of a given SVG element
dragit.utils.centroid = function(s) {
  var e = selection.node(),
  bbox = e.getBBox();
  return [bbox.x + bbox.width/2, bbox.y + bbox.height/2];
}

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
  var distances = points.map(function(d, i) { 
    var dx = d[0]-p[0];
    var dy = d[1]-p[1];
    return Math.sqrt(dx*dx + dy*dy);
  })
  return distances;
}

// Code from http://bl.ocks.org/duopixel/3824661
dragit.utils.findYgivenX = function(x, path) {
  var pathEl = path.node();
  var pathLength = pathEl.getTotalLength();
  var BBox = pathEl.getBBox();
  var scale = pathLength/BBox.width;
  var offsetLeft = document.getElementsByClassName("lineTrajectory")[0].offsetLeft;

  x = x - offsetLeft; 

  var beginning = x, end = pathLength, target;

  while (true) {
    target = Math.floor((beginning + end) / 2);
    pos = pathEl.getPointAtLength(target);
    if ((target === end || target === beginning) && pos.x !== x) {
      break;
    }
    if (pos.x > x)      
      end = target;
    else if (pos.x < x) 
      beginning = target;
    else                
      break;
  }
  return pos.y-200;
},

Array.prototype.equals = function (b) {
    var a = this;
    var i = a.length;
    if (i != b.length) return false;
    while (i--) {
        if (a[i] !== b[i]) return false;
    }
    return true;
};