layout.registerComponent( 'viewportComponent', function(container, componentState){
    var renderer = new THREE.WebGLRenderer({antialias: true});
    var name = 'viewport' + componentState.viewportId;
    var div = $('<div class="viewport" id="' + name + '" viewportId=' + componentState.viewportId + '>' + 
    `
        <div class='view-controls'>
            <div class='view-angle-controls'>
                <button type='button' class='btn btn-dark btn-sm' onclick='viewTop(` + componentState.viewportId + `)'>Top</button><br>
                <button type='button' class='btn btn-dark btn-sm' onclick='viewFront(` + componentState.viewportId + `)'>Front</button><br>
                <button type='button' class='btn btn-dark btn-sm' onclick='viewSide(` + componentState.viewportId + `)'>Side</button><br>
                <button type='button' class='btn btn-dark btn-sm' onclick='viewIso(` + componentState.viewportId + `)'>Iso</button><br>
            </div>
            <div class='view-position-controls'>
                <button type='button' class='btn btn-dark btn-sm' onclick='viewRecenter(` + componentState.viewportId + `)'>Recenter World</button><br>
                <button type='button' class='btn btn-dark btn-sm' onclick='viewRecenterSelected(` + componentState.viewportId + `)'>Recenter Selected</button><br>
            </div>
        </div>
        <div class='view-camera'>
            <select id='view-camera-select-` + componentState.viewportId + `' onchange='changeCamera(` + componentState.viewportId + `)'></select>
        </div>
    </div>`);
    container.on('tab', function() {
        updateViewport(div, renderer, componentState.viewportId);
        updateCameraLists();
    });
    container.on('resize', function() {
        updateViewport(div, renderer, componentState.viewportId);
        updateCameraLists();
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
        if (event.target.type != 'select-one')
            event.preventDefault();
        var id = parseInt(event.currentTarget.getAttribute('viewportId'));
        var viewport = getViewport(id);
        viewport.mouse.down = true;
        viewport.mouse.button = event.button;
        viewport.mouse.x = event.clientX;
        viewport.mouse.y = event.clientY;
        viewport.mouse.startX = event.clientX;
        viewport.mouse.startY = event.clientY;
    });
    div.mouseup(function(event) {
        event.preventDefault();
        var id = parseInt(event.currentTarget.getAttribute('viewportId'));
        var viewport = getViewport(id);
        viewport.mouse.down = false;
        viewport.mouse.button = -1;
        viewport.mouse.wasDown = true;
        viewport.mouse.x = event.clientX;
        viewport.mouse.y = event.clientY;
        viewport.mouse.moveAxis = AXIS.none;
        viewport.mouse.rotateAxis = AXIS.none;
        viewport.mouse.startPoint = null;
        viewport.mouse.currentPoint = null;
        viewport.mouse.pickedObject = null;
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
    div.on('wheel', function(event) {
        var id = parseInt(event.currentTarget.getAttribute('viewportId'));
        var viewport = getViewport(id);
        viewport.mouse.dz = event.originalEvent.deltaY || -event.originalEvent.wheelDelta;
    });
    div.append(renderer.domElement);
    // Disable right click context menu
    renderer.domElement.addEventListener('contextmenu', event => event.preventDefault());

    container.getElement().append(div);
    viewports.push({
        renderer: renderer,
        viewportId: componentState.viewportId,
        camera: null,
        cameraId: -1,
        div: div,
        mouse: {
            moveAxis: AXIS.none, 
            rotateAxis: AXIS.none,
            startX: 0,
            startY: 0,
            startTheta: null,
            startPoint: null,
            pickedObject: null
        }
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

function changeCamera(viewportId) {
    var viewport = getViewport(viewportId);
    var selectedCamera = $('#view-camera-select-' + viewportId).val();
    if (selectedCamera == 'free camera') {
        viewport.cameraId = CAMERA.free;
        $('#viewport' + viewportId + ' > .view-controls').show();
    }
    else if (selectedCamera == 'key camera') {
        viewport.cameraId = CAMERA.key;
        $('#viewport' + viewportId + ' > .view-controls').hide();
    }
    else {
        var cameraNode = findNodeByName(selectedCamera);
        viewport.cameraId = cameraNode.cameraId;
        $('#viewport' + viewportId + ' > .view-controls').hide();
    }
}

function viewSide(viewportId) {
    var viewport = getViewport(viewportId);
    viewport.camera.rotation.y = Math.PI / 2;
    viewport.camera.children[0].rotation.x = 0;
    viewport.camera.children[1].rotation.y = -Math.PI / 2;
}

function viewTop(viewportId) {
    var viewport = getViewport(viewportId);
    viewport.camera.rotation.y = 0;
    viewport.camera.children[0].rotation.x = -Math.PI / 2;
    viewport.camera.children[1].rotation.y = 0;
}

function viewFront(viewportId) {
    var viewport = getViewport(viewportId);
    viewport.camera.rotation.y = 0;
    viewport.camera.children[0].rotation.x = 0;
    viewport.camera.children[1].rotation.y = 0;
}

function viewIso(viewportId) {
    var viewport = getViewport(viewportId);
    viewport.camera.rotation.y = Math.PI / 4;
    viewport.camera.children[0].rotation.x = -Math.PI / 4;
    viewport.camera.children[1].rotation.y = -Math.PI / 4;
}

function viewRecenter(viewportId) {
    var viewport = getViewport(viewportId);
    viewport.camera.position.set(0, 0, 0);
}

function viewRecenterSelected(viewportId) {
    var viewport = getViewport(viewportId);
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    if (treeNode == false)
        return;
    var node = findNode(treeNode.id);
    viewport.camera.position.set(0, 0, 0);
    traverseTree(function(other) {
        var found = findNode(node.id, other);
        if (found != null)
            viewport.camera.position.add(other.threeObject.position);
    });
}
