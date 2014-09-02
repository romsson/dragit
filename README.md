dragit.js
==========

**dragit** is an extension to the **D3** library to enable the direct manipulation of SVG data graphics. 

### Getting Started

Examples:

To use it, insert the following snippets:

```html
<script src="http://d3js.org/d3.v3.min.js" charset="utf-8"></script>
<script src="dragit.js" charset="utf-8"></script>
```

Below a few concepts that are important to undersdant and that we'll refer to later on:

* **Object of Interest**: the DOM element (SVG node, div, ..) that can be dragged.
* **Trajectory**: the visual path along which the **Object of Interest** can be dragged along.
* **Focus**: the visual element that is being dragged. The **Object of Interest** can be used as **Focus**, but it can also be simplified such as into a point or shadow. 
* **Data points**: series of focus points that can be reached, over time.


###`dragit.data`


* `dragit.data`: is a time-cube defined as follows:


```
[ d0 [ t0 ] [ t1 ] ... [ tm ] ]
[ d1 [ t0 ] [ t1 ] ... [ tm ] ]
...
[ dn [ t0 ] [ t1 ] ... [ tm ] ]
```

Where di are dimensions, as ti time points.

###`dragit.time`


* `dragit.time.current`: the current time (default: 0)
* `dragit.time.min`: the minimal time point (0)
* `dragit.time.max`: the maximal time point (0)
* `dragit.time.step`: increment (1)

* `dragit.time.speed`: for the playback (default:1)

Here is how to get the min/max data:

```
dragit.time = {min: d3.min(data, function(d) { return parseInt(d[5]);}), 
								 max: d3.max(data, function(d) { return parseInt(d[5]);}), 
								 step:1, 
								 current:0
								}
```