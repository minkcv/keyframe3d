# Distributing Animations

The file [player.html](../player.html) contains the example HTML and JavaScript for displaying an animation in a web page.

### Scripts to include

Include three.js, BufferGeometryUtils.js, and player.js. The latter two are available in this repo. Change the paths to the scripts to match your folder structure.

```
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/110/three.min.js"></script>
<script src="js/BufferGeometryUtils.js"></script>
<script src="player.js"></script>
```

### Elements in the page

Create a div with an id. You may also want to give it a width and height.

```
<div id='player1' style='width: 100%; height: 500px;'></div>
```

Optionally create some controls. Pass the id of the div to the playPlayer and pausePlayer functions.

```
<button onclick='playPlayer("player1")'>Play</button>
<button onclick='pausePlayer("player1")'>Pause</button>
```

### Script to load the animation

Create a player context and pass in the id of the div.
Call loadProjectPlayer with a URL to your project JSON file and pass in the context.

```
var pc1 = createContext('player1');
loadProjectPlayer('https://minkcv.github.io/keyframe3d/demos/logo.json', pc1);
```

To create multiple players in one page, make sure to use different ids for the divs, and create a separate context for each of them.