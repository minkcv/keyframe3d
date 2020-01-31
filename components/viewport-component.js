layout.registerComponent( 'viewportComponent', function(container, componentState){
    var renderer = new THREE.WebGLRenderer({antialaias: true});
    var name = 'viewport' + componentState.viewportId;
    var div = $('<div class="viewport" id="' + name + '"></div>');
    container.on('tab', function() {
        updateViewport(div, renderer, componentState.viewportId);
    });
    container.on('resize', function() {
        updateViewport(div, renderer, componentState.viewportId);
    });
    div.append(renderer.domElement);
    container.getElement().append(div);
    viewports.push({
        renderer: renderer,
        camera: null
    });
});

function updateViewport(div, renderer, id) {
    var scale = 10;
    var width = div.innerWidth() - 2; // -2 from 1px border
    var height = div.innerHeight() - 2;
    if (width < 0 || height < 0)
        return;
    renderer.setSize(width, height);
    var camera = new THREE.OrthographicCamera(
        -width / scale, width / scale,
        -height / scale, height / scale,
        0, 1000
    );
    viewports[id].camera = camera;
}
