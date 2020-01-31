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
        var newViewportId = viewports[i].viewportId + 1;
        for (var j = 0; j < viewports.length; j++) {
            if (viewports[j].viewportId == newViewportId)
                newViewportId = -1;
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

    viewports.forEach(function(viewport) {
        if (viewport.camera != null)
            viewport.renderer.render(scene, viewport.camera);
    })
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
    update();
});