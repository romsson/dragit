dragit.js
==========

**dragit** is an extension to the **D3** library to enable the direct manipulation of SVG data graphics. 

### Examples

* [Interactive soccer bracket](http://romain.vuillemot.net/projects/worldcup14/)
* Standard charts (bar chart, pie chart, scatterplot, ..)
* Ranking tables
* Advanced data visualizations


### Getting Started

To use it, insert the following snippets:

```html
<script src="http://d3js.org/d3.v3.min.js" charset="utf-8"></script>
<script src="dragit.js" charset="utf-8"></script>
```

Your code should contain two functions (names don't matter) `init()` (called only once during startup), and `update()` (called once time has changed).

Below a few concepts that are important to undersdant and that we'll refer to later on:

* **Object of Interest**: the DOM element (SVG node, div, ..) that can be dragged.
* **Trajectory**: the visual path along which the **Object of Interest** can be dragged along.
* **Target**: the visual element that is selected before dragging dragged.
* **Focus**: the visual element that is being dragged (can be a simplified simplified such as into a point or shadow).
* **Intermediate points**: series of focus points that can be reached, over time.

###`dragit.data`

* `dragit.data`: is a time-cube defined where each row are data points and columns time steps.

Example:

```
[ d0 [ t0 ] [ t1 ] ... [ tm ] ]
[ d1 [ t0 ] [ t1 ] ... [ tm ] ]
...
[ dn [ t0 ] [ t1 ] ... [ tm ] ]
```

Where di are dimensions, as ti are time points. You may want to generate a random time cube as follow:

```
var timecube = d3.range(nb_data_points).map(function(d, i) {
	return d3.range(nb_time_steps).map(function(e, j) { 
		return {x:j, y:Math.random(), t: j};
	});
})
```

###`dragit.time`

* `dragit.time.current`: the current time (default: 0)
* `dragit.time.min`: the minimal time point (default: 0)
* `dragit.time.max`: the maximal time point (default: 0)
* `dragit.time.step`: increment (default: 1)
* `dragit.time.speed`: for the playback (default:1)

Example:

```
dragit.time = {min: d3.min(data, function(d) { return parseInt(d[i]);}), 
							 max: d3.max(data, function(d) { return parseInt(d[i]);}), 
							 step:1, 
							 current:0
							}
```

### `dragit.object`

It concerns the object of interest or handle, i.e. the object the user interact with to start the interaction and thus starts the time change.


* `dragit.object.activate` activates dragging for the selected element. It creates the necessary mouse events (drag). Example: `.call(dragit.object.activate)`.

####`dragit.mouse.dragging`

* `horizontal` similar as a time
* `vertical`
* `curvilinear`
* `flow` flow dragging method. Usually well suited for background * motion.
* `free` dragging with no constraints on the activated element, returns to its original position

####`dragit.target`

* Functions related to the target manipulation
* Transition between focus and target

####`dragit.focus`

* Functions related to the focus manipulation

### `dragit.trajectory`


* `dragit.trajectory.display` displays the currently dragged element's trajectory
* `dragit.trajectory.displayAll` displays all trajectories
* `dragit.trajectory.remove` removes the created trajectory
* `dragit.trajectory.removeAll` removes all trajectories

