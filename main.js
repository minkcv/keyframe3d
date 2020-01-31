var viewports = [];
var scene = new THREE.Scene();

layout.init();

var settings = {
    length: 36000,
    framerate: 60
};

var models = [];

function addViewport() {
    for (var i = 0; i < viewports.length; i++) {
        var newViewportId = i + 1;
        for (var j = 0; j < viewports.length; j++) {
            if (viewports[j].viewportId == newViewportId) {
                newViewportId = -1;
                break;
            }
        }
        if (newViewportId != -1)
            break;
    }
    var viewportConfig = {
        type: 'component',
        componentName: 'viewportComponent',
        componentState: { viewportId: newViewportId },
        title: 'Viewport ' + (newViewportId)
    }
    layout.root.contentItems[0].contentItems[1].contentItems[0].addChild(viewportConfig);

}

function getViewport(id) {
    for (var i = 0; i < viewports.length; i++) {
        if (viewports[i].viewportId == id)
            return viewports[i];
    }
}

function loadSettings(newSettings) {
    settings = newSettings;
    var options = timeline.options;
    options.max = new Date(settings.length);
    timeline.setOptions(options);
    $('#length').val(settings.length);
    $('#framerate').val(settings.framerate);
}

function loadModel(files) {
    for (var i = 0; i < files.length; i++) {
        var duplicate = false;
        models.forEach(function(model) {
            if (model.name == files[i].name)
                duplicate = true;
        });
        if (duplicate) {
            alert('Model with that name already exists');
            log('Attempt to load model with same name as existing model', 'warning');
            continue;
        }
        (function(file){
            var reader = new FileReader();
            reader.onloadend = function () {
                var data = JSON.parse(reader.result);
                var model = {
                    name: file.name,
                    data: data
                }
                models.push(model);
                log('Loaded model "' + model.name + '"');
                $('#model-select').append($('<option id=' + file.name + '></option>').text(file.name));
                if ($('#model-select').attr('size') < models.length)
                    $('#model-select').attr('size', models.length);
            }
            if (files[i])
                reader.readAsText(files[i]);
        })(files[i]);
    }
    // Clear the value on the file input so it can still fire onchange again
    // even if loading the same file
    if (files.length > 0)
        document.getElementById('load-model').value = '';
}

function unloadModel() {
    var name = $('#model-select option:selected').text();
    if (!name) {
        alert('Select a model to unload');
        return;
    }
    for (var i = 0; i < models.length; i++) {
        if (models[i].name == name) {
            models.splice(i, 1);
            break;
        }
    }
    $('#model-select option[id="' + name + '"]').remove();
    log('Unloaded model "' + name + '"');
}

function update() {
    requestAnimationFrame(update);

    var rotateFactor = 50;
    var zoomSpeed = 0.2;
    viewports.forEach(function(viewport) {
        if (viewport.camera != null) {
            var cameraX = viewport.camera;
            var cameraY = cameraX.children[0];
            var metaCamera = cameraY.children[0];
            var mouse = viewport.mouse;
            if (mouse.button == 2) { // Right click
                cameraX.rotation.y += mouse.dx / rotateFactor;
                cameraY.rotation.x += mouse.dy / rotateFactor;
                cameraX.children[1].rotation.y -= mouse.dx / rotateFactor;
                if (cameraX.rotation.x > Math.PI / 2)
                    cameraX.rotation.x = Math.PI / 2;
                if (cameraX.rotation.x < -Math.PI / 2)
                    cameraX.rotation.x = -Math.PI / 2;
            }
            else if (mouse.button == 1) { // Pan view - Middle click
                var translate = getScreenTranslation(cameraX, cameraY, metaCamera, mouse);
                cameraX.position.add(translate);
            }
            if (mouse.dz < 0) { // Scroll wheel
                metaCamera.zoom *= 1 + zoomSpeed;
                metaCamera.updateProjectionMatrix();
            }
            else if (mouse.dz > 0) {
                metaCamera.zoom *= 1 - zoomSpeed;
                metaCamera.updateProjectionMatrix();
            }
            viewport.renderer.render(scene, metaCamera);
            
            mouse.dx = 0;
            mouse.dy = 0;
            mouse.dz = 0;
        }
    })
}

function getScreenTranslation(cameraX, cameraY, metaCamera, mouse) {
    // Translate 2D screen movement into the appropriate 3D movement.
    // Holy crap this was difficult to figure out.
    var dir = new THREE.Vector3();
    cameraY.getWorldDirection(dir);
    dir.normalize();
    var viewUp = getUpVector(dir, cameraY.rotation.x, cameraX.rotation.y);
    var viewRight = new THREE.Vector3();
    viewRight.crossVectors(dir, viewUp);
    var translate = new THREE.Vector3(
        viewRight.x * -mouse.dx + viewUp.x * -mouse.dy,
        viewUp.y * -mouse.dy,
        viewUp.z * -mouse.dy + viewRight.z * -mouse.dx);
    translate.multiplyScalar(1 / metaCamera.zoom);
    return translate;
}

function getUpVector(dir, xr, yr) {
    var ob = new THREE.Object3D();
    ob.rotateY(yr);
    ob.rotateX(xr - Math.PI / 2);
    var up = new THREE.Vector3();
    ob.getWorldDirection(up);
    return up;
}

$(function() {
    loadSettings(settings);

    // test geometry
    var boxGeom = new THREE.TetrahedronGeometry(5, 2);
    var wgeom = new THREE.WireframeGeometry(boxGeom);
    var lines = new THREE.LineSegments(wgeom);
    lines.material.color = {r: 1, g: 1, b: 1};
    lines.material.depthTest = false;
    lines.material.opacity = 0.5;
    lines.material.transparent = true;
    scene.add(lines);
    var gridHelper = new THREE.GridHelper(1000, 10, 0x555555, 0x555555);
    scene.add(gridHelper);
    update();
});