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

Below a few concepts that are important to undersdant and that we'll refer to later on:

* **Object of Interest**: the DOM element (SVG node, div, ..) that can be dragged.
* **Trajectory**: the visual path along which the **Object of Interest** can be dragged along.
* **Target**: the visual element that is selected before dragging dragged.
* **Focus**: the visual element that is being dragged (can be a simplified simplified such as into a point or shadow).
* **Intermediate points**: series of focus points that can be reached, over time.

###`dragit.data`

* `dragit.data`: is a time-cube defined as follows:

```
[ d0 [ t0 ] [ t1 ] ... [ tm ] ]
[ d1 [ t0 ] [ t1 ] ... [ tm ] ]
...
[ dn [ t0 ] [ t1 ] ... [ tm ] ]
```

Where di are dimensions, as ti are time points.

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

####`dragit.mouse.dragging`

* `horizontal` similar as a time
* `vertical`
* `curvilinear`
* `flow` flow dragging method. Usually well suited for background * motion.
* `free` dragging with no constraints on the activated element, returns to its original position

####`dragit.target`

* Functions related to the target manipulation

####`dragit.focus`

* Functiosn related to the focus manipulation

