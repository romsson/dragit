dragit.js
==========

**dragit** is an extension to the **[D3.js](http://d3js.org/)** library to enable the [direct manipulation](https://en.wikipedia.org/wiki/Direct_manipulation_interface) of SVG data visualization. It is designed to be seamlessly included in an existing **D3** visualization and is aimed to be highly customizable.

### Examples

* Interactive [soccer bracket](http://romain.vuillemot.net/projects/worldcup14/)
* A series of [simple](http://romsson.github.io/dragit/example/test_single_point.html) [examples](http://romsson.github.io/dragit/example/test_multi_points.html)
* [A Re-Recreation of Gapminder's Wealth of Nations](http://romsson.github.io/dragit/example/nations.html) to drag countries to desired position instead of using the time slider

#### Coming soon

* Ranking tables
* Standard charts: [Bar chart](http://romsson.github.io/dragit/example/test_barchart.html), pie chart, scatterplot, ..
* Node link diagrams

### Getting Started

#### Code Organization

One of the library design goal to be included quasi-seamlessly in a current data visualization, i.e. without much change. To use it, insert the following snippets in the header of your code, right after **D3**:

```html
<script src="http://d3js.org/d3.v3.min.js" charset="utf-8"></script>
<script src="dragit.js" charset="utf-8"></script>
```

You are, however, very likely to structure the chart as follows to make sure **dragit** is informed on the existing temporal data and the current state of the visualization. Two functions (names don't matter) are to be created:

* `init()` which is called only once during startup
* `update()` which is called once time has changed

Those two functions will make sure the library's internal state is always up to date, regardless how you update the data visualization (using regular slider or direct manipulation).

#### Time Cube

Then create an internal data structure (namely a time cube) where each row is a data point, and each column a time point.You may want to generate a random time cube (of `nb_data_points` by `nb_time_steps`) as below:

```
var timecube = d3.range(nb_data_points).map(function(d, i) {
	return d3.range(nb_time_steps).map(function(e, j) { 
		return {x: i, y: Math.random(), t: j};
	});
})
```

#### Combination Cube

(to be detailed soon)

#### Core Concepts

Here are a few concepts that are important to grasp:

* **Object (of Interest)**: the graphical marks (SVG node, div, ..) that can be dragged and will indirectly update the visualization.
* **Focus**: the visual element that is being dragged (can be a simplified simplified such as into a point or shadow).
* **Trajectory**: the visual path along which the **Object of Interest** can be dragged. It is represented as a line.
* **Data points**: series of points the focus can reach along its trajectory.

Here are the names using for the various objects:

<p align="center">
	<img src="img/points-trajectories-naming.png" width=600/>
</p>

#### dragit.data

* `dragit.data`: is a time-cube defined where each row are data points and columns time steps.

Example (rows are data, columns are time steps):

```
[ d0 [ t0 ] [ t1 ] ... [ tm ] ]
[ d1 [ t0 ] [ t1 ] ... [ tm ] ]
...
[ dn [ t0 ] [ t1 ] ... [ tm ] ]
```

Where d<sub>i</sub> are dimensions, as t<sub>i</sub> are time points.

### dragit.vars

A series of private variables for internal use. Can be set using publication functions, such as:

* `dragit.init(container)`  :  set the DOM element containing all the trajectories (can be shared with the visualization)   

### dragit.time

* `dragit.time.current` 	: 	the current time (default: 0)
* `dragit.time.min`		    : 	the minimal time point (default: 0)
* `dragit.time.max`		    : 	the maximal time point (default: 0)
* `dragit.time.step`	  	: 	increment (default: 1)
* `dragit.time.speed`		  : 	for the playback (default)

Example:

```
dragit.time = {min: 		d3.min(data, function(d) { return parseInt(d[i]);}), 
							 max: 		d3.max(data, function(d) { return parseInt(d[i]);}), 
							 step: 		1, 
							 current: 0
							}
```

### dragit.object

The object of interest, the handle the user interacts with to start the interaction and thus start the time change.

* `dragit.object.activate` activates dragging for the selected element. It creates the necessary mouse events (drag). Example: `.call(dragit.object.activate)`.

### dragit.mouse

#### dragit.mouse.dragging

* `horizontal`
* `vertical`
* `curvilinear`
* `flow` flow dragging method. Usually well suited for background * motion.
* `free` dragging with no constraints on the activated element, returns to its original position

### dragit.focus

* Functions related to the focus that is being 

### dragit.trajectory

* `dragit.trajectory.display`          : displays the currently dragged element's trajectory
* `dragit.trajectory.displayUpdate`    : update the trajectory
* `dragit.trajectory.displayAll`       : displays all trajectories
* `dragit.trajectory.toggle`           : toggle the display of current trajectory
* `dragit.trajectory.toggleAll`        : toggle the display of all trajectories
* `dragit.trajectory.remove`           : removes the created trajectory
* `dragit.trajectory.removeAll`        : removes all trajectories

### dragit.evt

Events management mechanism to register and trigger functions.

* `dragit.evt.register(event, function, context)`    : register a function for a given `event` 
* `dragit.evt.call(event)`                           : trigger registered functions


### dragit.statemachine

<p align="center">
	<img src="img/diagram-state-machine.png" width=600/>
</p>

(not fully implemented yet)

* `dragit.statemachine.current_state`                  : return the current state of the interaction (e.g mouseenter, dragstart)
* `dragit.statemachine.current_id`                     : return the id of the currently manipulated element
* `dragit.statemachine.setState(event)`                : set the current state of the state machine
