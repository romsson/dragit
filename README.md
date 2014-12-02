dragit.js
==========

**dragit** is an extension to the **D3** library to enable the direct manipulation of SVG data visualization. It is designed to be seamlessly included in an existing **D3** visualization and is aimed to be highly customizable.

### Examples

* Interactive [soccer bracket](http://romain.vuillemot.net/projects/worldcup14/)
* A series of [simple](http://romsson.github.io/dragit/example/test_single_point.html) [examples](http://romsson.github.io/dragit/example/test_multi_points.html)
* [Gapminder / Wealth of Nations](http://romsson.github.io/dragit/example/nations.html): drag countries to desired position ([original version](http://bost.ocks.org/mike/nations/))

#### Coming soon

* Ranking tables
* Standard charts ([Bar chart](http://romsson.github.io/dragit/example/test_barchart.html), pie chart, scatterplot, ..)

### Getting Started

To use it, insert the following snippets in the header of your code, right after **D3**:

```html
<script src="http://d3js.org/d3.v3.min.js" charset="utf-8"></script>
<script src="dragit.js" charset="utf-8"></script>
```

One of the library design goal to be indluded quasi-seamlessly in a current data visualization, i.e. without much change. You are, however, very likely to structure the chart as follows to make sure **dragit** is informed on the existing temporal data and the current state of the visualization:

* Two functions (names don't matter) `init()` (called only once during startup), and `update()` (called once time has changed). Those two functions will make sure the library's internal state is always up to date, regardless how you udpate the data visualization (using regular slider or direct manipulation).

* Crate an internal data structure (namely a time cube) where each row is a data point, and each column a time point.

Below a few concepts that are important to undersdant and that we'll refer to later on:

* **Object of Interest**: the graphical marks (SVG node, div, ..) that can be dragged and will indirectly update the visualization.
* **Trajectory**: the visual path along which the **Object of Interest** can be dragged. It is represented as a line.
* **Focus**: the visual element that is being dragged (can be a simplified simplified such as into a point or shadow).
* **Time points**: series of points the focus can reach along its trajectory.

#### dragit.data

* `dragit.data`: is a time-cube defined where each row are data points and columns time steps.

Example:

```
[ d0 [ t0 ] [ t1 ] ... [ tm ] ]
[ d1 [ t0 ] [ t1 ] ... [ tm ] ]
...
[ dn [ t0 ] [ t1 ] ... [ tm ] ]
```

Where d<sub>i</sub> are dimensions, as t<sub>i</sub> are time points. You may want to generate a random time cube as follow:

```
var timecube = d3.range(nb_data_points).map(function(d, i) {
	return d3.range(nb_time_steps).map(function(e, j) { 
		return {x:i, y:Math.random(), t: j};
	});
})
```

### dragit.time

* `dragit.time.current` : 	the current time (default: 0)
* `dragit.time.min`		: 	the minimal time point (default: 0)
* `dragit.time.max`		: 	the maximal time point (default: 0)
* `dragit.time.step`	: 	increment (default: 1)
* `dragit.time.speed`	: 	for the playback (default:1)

Example:

```
dragit.time = {min: d3.min(data, function(d) { return parseInt(d[i]);}), 
							 max: d3.max(data, function(d) { return parseInt(d[i]);}), 
							 step:1, 
							 current:0
							}
```

### dragit.object

It concerns the object of interest or handle, i.e. the object the user interact with to start the interaction and thus starts the time change.


* `dragit.object.activate` activates dragging for the selected element. It creates the necessary mouse events (drag). Example: `.call(dragit.object.activate)`.

#### dragit.mouse.dragging

* `horizontal` similar as a time
* `vertical`
* `curvilinear`
* `flow` flow dragging method. Usually well suited for background * motion.
* `free` dragging with no constraints on the activated element, returns to its original position

#### dragit.focus

* Functions related to the focus manipulation

### dragit.trajectory

* `dragit.trajectory.display` displays the currently dragged element's trajectory
* `dragit.trajectory.displayAll` displays all trajectories
* `dragit.trajectory.remove` removes the created trajectory
* `dragit.trajectory.removeAll` removes all trajectories
