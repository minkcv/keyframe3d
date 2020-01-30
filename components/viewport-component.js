layout.registerComponent( 'viewportComponent', function(container, componentState){
    var renderer = new THREE.WebGLRenderer({antialaias: true});
    var name = 'viewport' + componentState.viewportId;
    var scale = 10;
    var div = $('<div class="viewport" id="' + name + '"></div>');
    container.on('show', function() {
        var width = div.innerWidth();
        var height = div.innerHeight();
        renderer.setSize(width, height);
        var camera = new THREE.OrthographicCamera(
            -width / scale, width / scale,
            -height / scale, height / scale,
            0, 1000
        );
        viewports[componentState.viewportId].camera = camera;
    });
    container.on('resize', function() {
        var width = div.innerWidth();
        var height = div.innerHeight();
        renderer.setSize(width, height);
        var camera = new THREE.OrthographicCamera(
            -width / scale, width / scale,
            -height / scale, height / scale,
            0, 1000
        );
        viewports[componentState.viewportId].camera = camera;
    });
    div.append(renderer.domElement);
    container.getElement().append(div);
    viewports.push({
        renderer: renderer,
        camera: null
    });
});
