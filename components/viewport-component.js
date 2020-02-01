layout.registerComponent( 'viewportComponent', function(container, componentState){
    var renderer = new THREE.WebGLRenderer({antialias: true});
    var name = 'viewport' + componentState.viewportId;
    var div = $('<div class="viewport" id="' + name + '" viewportId=' + componentState.viewportId + '></div>');
    container.on('tab', function() {
        updateViewport(div, renderer, componentState.viewportId);
    });
    container.on('resize', function() {
        updateViewport(div, renderer, componentState.viewportId);
    });
    container.on('destroy', function() {
        for (var i = 0; i < viewports.length; i++) {
            if (viewports[i].viewportId == componentState.viewportId) {
                viewports[i].div.remove();
                scene.remove(viewports[i].camera);
                viewports.splice(i, 1);
                break;
            }
        }
    })
    div.mousedown(function(event) {
        event.preventDefault();
        var id = parseInt(event.currentTarget.getAttribute('viewportId'));
        var viewport = getViewport(id);
        viewport.mouse.down = true;
        viewport.mouse.button = event.button;
        viewport.mouse.x = event.clientX;
        viewport.mouse.y = event.clientY;
    });
    div.mouseup(function(event) {
        event.preventDefault();
        var id = parseInt(event.currentTarget.getAttribute('viewportId'));
        var viewport = getViewport(id);
        viewport.mouse.down = false;
        viewport.mouse.wasDown = true;
        viewport.mouse.x = event.clientX;
        viewport.mouse.y = event.clientY;
        viewport.mouse.moveAxis = AXIS.none;
    });
    div.mousemove(function(event) {
        event.preventDefault();
        var id = parseInt(event.currentTarget.getAttribute('viewportId'));
        var viewport = getViewport(id);
        if (viewport.mouse.down) {
            viewport.mouse.dx = viewport.mouse.x - event.clientX;
            viewport.mouse.dy = viewport.mouse.y - event.clientY;
        }
        viewport.mouse.x = event.clientX;
        viewport.mouse.y = event.clientY;
    });
    div.bind('mousewheel', function(event) {
        var id = parseInt(event.currentTarget.getAttribute('viewportId'));
        var viewport = getViewport(id);
        viewport.mouse.dz = -event.originalEvent.wheelDelta;
    });
    div.append(renderer.domElement);
    // Disable right click context menu
    renderer.domElement.addEventListener('contextmenu', event => event.preventDefault());

    container.getElement().append(div);
    viewports.push({
        renderer: renderer,
        viewportId: componentState.viewportId,
        camera: null,
        div: div,
        mouse: {}
    });
});

function updateViewport(div, renderer, id) {
    var viewport = getViewport(id);
    scene.remove(viewport.camera);
    var scale = 2;
    var renderDistance = 16000;
    var width = div.innerWidth() - 2; // -2 from 1px border
    var height = div.innerHeight() - 2;
    if (width < 0 || height < 0)
        return;
    renderer.setSize(width, height);
    var metaCamera = new THREE.OrthographicCamera(
        -width / scale, width / scale,
        height / scale, -height / scale,
        0, renderDistance
    );
    var cameraX = new THREE.Object3D(); // Parent for camera
    var cameraY = new THREE.Object3D(); // Parent for realCamera
    cameraY.add(metaCamera);
    metaCamera.translateZ(renderDistance / 2);
    metaCamera.zoom = 0.8;
    cameraX.add(cameraY);
    var camAxes = new THREE.AxesHelper(10);
    var colors = camAxes.geometry.attributes.color;
    for (var i = 0; i < 6; i++) {
        colors.setXYZ( i, 0.5, 0.5, 0.5 ); // index, R, G, B
    }
    cameraX.add(camAxes);
    // Start in iso view.
    cameraX.rotation.y = Math.PI / 4;
    cameraY.rotation.x = -Math.PI / 4;
    camAxes.rotation.y = -Math.PI / 4;
    scene.add(cameraX);
    if (viewport.camera != null) {
        cameraX.rotation.copy(viewport.camera.rotation);
        cameraX.position.copy(viewport.camera.position);
        cameraY.rotation.copy(viewport.camera.children[0].rotation);
        camAxes.rotation.copy(viewport.camera.children[1].rotation);
        metaCamera.zoom = viewport.camera.children[0].children[0].zoom;
    }
    metaCamera.updateProjectionMatrix();
    viewport.camera = cameraX;
}
