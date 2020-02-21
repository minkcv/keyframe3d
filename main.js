var viewports = [];
var scene = new THREE.Scene();
var gridHelper;
var precision = 3;
var pinkLineMat = new THREE.LineBasicMaterial({color: 0xdf3eff});
var darkPinkLineMat = new THREE.LineBasicMaterial({color: 0xa464b1});
var redLineMat = new THREE.LineBasicMaterial({color: 0xff0000});
var greenLineMat = new THREE.LineBasicMaterial({color: 0x00ff00});
var blueLineMat = new THREE.LineBasicMaterial({color: 0x0000ff});
var redMat = new THREE.MeshBasicMaterial({color: 0xff0000, side: THREE.DoubleSide});
var greenMat = new THREE.MeshBasicMaterial({color: 0x00ff00, side: THREE.DoubleSide});
var blueMat = new THREE.MeshBasicMaterial({color: 0x0000ff, side: THREE.DoubleSide});
var planeMat = new THREE.MeshBasicMaterial({visible: false, color: 0xcccccc, side: THREE.DoubleSide, opacity: 0.5, transparent: true});
var editorWallMat = new THREE.MeshBasicMaterial({color: 0xcccccc, side: THREE.DoubleSide, opacity: 0.5, transparent: true});
var gripPlaneGeom = new THREE.PlaneGeometry(10000, 10000, 1, 1);
var gripPlane = new THREE.Mesh(gripPlaneGeom, planeMat);
gripPlane.gripPlane = true;
scene.add(gripPlane);
var AXIS = {x: 0, y: 1, z: 2, none: 3};
var PLAY = {play: 0, stop: 1};
var playState = PLAY.stop;
var CONTROLMODE = {move: 0, rotate: 1};
var controlMode = CONTROLMODE.move;
var CAMERA = {free: -1, key: -2};
var raycaster = new THREE.Raycaster();
var timerId;

layout.init();

var settings = {
    length: 1000,
    framerate: 60,
    aspectRatio: '16:9',
    autoplay: false,
    loop: false
};

var models = [];
var keyframes = [];
var sceneTree = {
    id: 0, 
    name: 'root', 
    children:[], 
    threeObject: new THREE.Object3D()
};
scene.add(sceneTree.threeObject);

var grips = new THREE.Object3D();
var axesGrips = new THREE.Object3D();
axesGrips.visible = controlMode == CONTROLMODE.move;
axesGrips.axesGrips = true;
var xGripGeom = new THREE.Geometry();
xGripGeom.vertices.push(new THREE.Vector3(0, 0, 0));
xGripGeom.vertices.push(new THREE.Vector3(50, 0, 0));
var xGrip = new THREE.Line(xGripGeom, redLineMat);
xGrip.xGrip = true;
var yGripGeom = new THREE.Geometry();
yGripGeom.vertices.push(new THREE.Vector3(0, 0, 0));
yGripGeom.vertices.push(new THREE.Vector3(0, 50, 0));
var yGrip = new THREE.Line(yGripGeom, greenLineMat);
yGrip.yGrip = true;
var zGripGeom = new THREE.Geometry();
// Don't make the line in the +Z direction because then
// the object doesn't really point in a direction.
// This comes up when calling getWorldDirection
zGripGeom.vertices.push(new THREE.Vector3(0, 0, 0));
zGripGeom.vertices.push(new THREE.Vector3(50, 0, 0));
var zGrip = new THREE.Line(zGripGeom, blueLineMat);
zGrip.rotateY(-Math.PI / 2);
zGrip.rotateX(Math.PI / 2);
zGrip.zGrip = true;
axesGrips.add(xGrip);
axesGrips.add(yGrip);
axesGrips.add(zGrip);
var xGripConeGeom = new THREE.ConeGeometry(5, 10, 8);
var xGripCone = new THREE.Mesh(xGripConeGeom, redMat);
xGripCone.rotation.z = -Math.PI / 2;
xGripCone.position.x = 50;
xGripCone.xGrip = true;
var yGripConeGeom = new THREE.ConeGeometry(5, 10, 8);
var yGripCone = new THREE.Mesh(yGripConeGeom, greenMat);
yGripCone.position.y = 50;
yGripCone.yGrip = true;
var zGripConeGeom = new THREE.ConeGeometry(5, 10, 8);
var zGripCone = new THREE.Mesh(zGripConeGeom, blueMat);
zGripCone.rotation.x = Math.PI / 2;
zGripCone.position.z = 50;
zGripCone.zGrip = true;
axesGrips.add(xGripCone);
axesGrips.add(yGripCone);
axesGrips.add(zGripCone);
grips.add(axesGrips);
var rotationGrips = new THREE.Object3D();
rotationGrips.visible = controlMode == CONTROLMODE.rotate;
rotationGrips.rotGrips = true;
var xRotateGeom = new THREE.RingGeometry(60, 70, 10, 1, 0, Math.PI / 2);
var xRotate = new THREE.Mesh(xRotateGeom, redMat);
xRotate.rotation.y = -Math.PI / 2;
xRotate.xRotGrip = true;
var yRotateGeom = new THREE.RingGeometry(60, 70, 10, 1, 0, Math.PI / 2);
var yRotate = new THREE.Mesh(yRotateGeom, greenMat);
yRotate.rotation.x = Math.PI / 2;
yRotate.yRotGrip = true;
var zRotateGeom = new THREE.RingGeometry(60, 70, 10, 1, 0, Math.PI / 2);
var zRotate = new THREE.Mesh(zRotateGeom, blueMat);
zRotate.zRotGrip = true;
rotationGrips.add(xRotate);
rotationGrips.add(yRotate);
rotationGrips.add(zRotate);
grips.add(rotationGrips)
scene.add(grips);

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
    log('Opened new viewport with id "' + newViewportId + '"');
}

function loadSettings(newSettings) {
    settings = newSettings;
    var options = timeline.options;
    options.max = new Date(settings.length);
    timeline.setOptions(options);
    $('#length').val(settings.length);
    $('#framerate').val(settings.framerate);
    $('#aspect-ratio').val(settings.aspectRatio);
    var ar = getAspectRatio(settings.aspectRatio);
    traverseTree(function(node) {
        if (node.cameraId !== undefined) {
            node.cameraObject.aspec = ar;
            node.cameraObject.updateProjectionMatrix();
        }
    });
}

function selectNode(id) {
    var treeNode = $('#scene-tree').tree('getNodeById', id);
    $('#scene-tree').tree('selectNode', treeNode);
    updateGrips();
    updateProperties();
}

function findNodeByName(name, startNode) {
    if (!startNode)
        startNode = sceneTree;
    if (!startNode)
        return null;
    if (startNode.name == name)
        return startNode;
    var found = null;
    startNode.children.forEach(function(node) {
        var subFound = findNodeByName(name, node);
        if (subFound)
            found = subFound;
    });
    return found;
}

function getNextNodeId() {
    var nextId = 0;
    while (findNode(nextId) != null) {
        nextId++;
    }
    return nextId;
}

function getNextCameraId() {
    var nextId = 0;
    while (findCamera(nextId) != null) {
        nextId++;
    }
    return nextId;
}

function createEmptyNodeEditor(name, parent, id) {
    if (name.length < 1) {
        alert('Name for node cannot be blank');
        return null;
    }
    if (name == 'free camera') {
        alert('Node cannot be named "free camera"');
        return null;
    }
    if (name == 'key camera') {
        alert('Node cannot be named "key camera"');
        return null;
    }
    var existing = findNodeByName(name);
    if (existing) {
        alert('Node with that name already exists');
        return null;
    }
    var nodeId = id || getNextNodeId();
    var newNode = createEmptyNodePlayer(name, parent, nodeId);
    updateTree();
    selectNode(nodeId)
    log('Created empty node with name "' + name + '"');
    return newNode;
}

function renameNode() {
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    if (treeNode == false) {
        alert('Select a node to rename');
        return;
    }
    if (treeNode.id == 0) {
        alert('Cannot rename the root node');
        return;
    }
    var node = findNode(treeNode.id);
    if (node.cameraId == 0) {
        alert('Cannot rename the default camera');
        return;
    }
    var name = $('#rename-node-name').val();
    if (name.length < 1) {
        alert('Name for node cannot be blank');
        return;
    }
    var existing = findNodeByName(name);
    if (existing) {
        alert('Node with that name already exists');
        return;
    }
    log('Renamed node "' + node.name + '" to "' + name + '"');
    node.name = name;
    updateTree();
    selectNode(node.id);
}

function deleteNode() {
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    if (treeNode == false) {
        alert('Select a node to delete');
        return;
    }
    if (selectNode.id == 0) {
        alert('Cannot delete the root node');
        return;
    }
    var node = findNode(treeNode.id);
    if (node.cameraId == 0) {
        alert('Cannot delete the default camera');
        return;
    }
    var childNames = '';
    var containsDefaultCamera = false;
    traverseTree(function(child) {
        if (child.cameraId == 0)
            containsDefaultCamera = true;
        if (child.name != node.name)
            childNames += '"' + child.name + '", ';
    }, node);
    if (containsDefaultCamera) {
        alert('Cannot delete a node that has the default camera as a child');
        return;
    }
    if (childNames) {
        childNames = childNames.slice(0, childNames.length - 2);
    }
    var parent = getParentNode(node);
    for (var i = 0; i < parent.children.length; i++) {
        if (parent.children[i].id == node.id) {
            parent.children.splice(i, 1);
            parent.threeObject.remove(node.threeObject);
            break;
        }
    }
    updateTree();
    updateCameraLists();
    selectNode(parent.id);
    log('Deleted node "' + node.name + '" with children ' + childNames);
}

function updateCameraLists() {
    var cameras = [];
    traverseTree(function(node) {
        if (node.cameraId !== undefined)
            cameras.push(node);
    });
    var opts = '';
    for (var i = 0; i < cameras.length; i++) {
        opts += '<option value="' + cameras[i].name + '">' + cameras[i].name + '</option>';
    }
    $('#keyframe-camera').html(opts);
    opts = '<option value="free camera">free camera</option><option value="key camera">key camera</option>' + opts;
    for (var i = 0; i < viewports.length; i++) {
        var current = $('#view-camera-select-' + i).val();
        if (current == null) {
            current = 'free camera';
        }
        $('#view-camera-select-' + i).html(opts);
        $('#view-camera-select-' + i).val(current);
    }
}

function createModelEditor(modelName, nodeName, parent, id) {
    var model = getModel(modelName);
    if (!model) {
        alert('Select a model from the list of loaded models');
        return;
    };
    var node = createEmptyNodeEditor(nodeName, parent, id);
    if (node == null)
        return;
    createModelPlayer(node, modelName);
    log('Added model "' + modelName + '" to node "' + node.name + '"');
    selectNode(node.id);
    return node;
}

function createCameraEditor(name, parent, id, cameraId, fov) {
    var node = createEmptyNodeEditor(name, parent, id);
    if (node == null)
        return;
    cameraId = cameraId || getNextCameraId();
    fov = fov || 45;
    createCameraPlayer(node, cameraId, fov);
    var cameraGeometry = createModelGeometry(cameraModel);
    cameraGeometry.cameraModel = true;
    node.threeObject.add(cameraGeometry);
    log('Added camera with id ' + node.cameraId + ' to node "' + node.name + '"');
    updateCameraLists();
    selectNode(node.id);
    return node;
}

function createWallEditor(name, parent, id, width, height) {
    var node = createEmptyNodeEditor(name, parent, id);
    if (node == null)
        return;
    if (!width)
        width = 100;
    if (!height)
        height = 100;
    createWallPlayer(node, width, height);
    log('Added wall to node "' + node.name + '"');
    selectNode(node.id);
    return node;
}

function update() {
    requestAnimationFrame(update);

    var rotateFactor = 200;
    var zoomSpeed = 0.2;
    viewports.forEach(function(viewport) {
        for (var v = 0; v < viewports.length; v++) {
            // Hide camera center axes
            if (viewports[v].camera != null)
                viewports[v].camera.children[1].visible = false;
        }
        if (viewport.cameraId != CAMERA.free) {
            // Render camera
            gridHelper.visible = false;
            grips.visible = false;
            traverseTree(function(node) {
                node.threeObject.children.forEach(function(child) {
                    if (child.model)
                        child.material = whiteLineMat;
                    if (child.wallObj)
                        child.material = wallMat;
                    if (child.cameraModel)
                        child.visible = false;
                });
            });
            var camera;
            if (viewport.cameraId != CAMERA.key) {
                camera = findCamera(viewport.cameraId);
            }
            else {
                var time = timeline.getCustomTime('playhead').getTime();
                var exact = getKeyframe(time);
                if (exact && exact.cameraId !== undefined) {
                    camera = findCamera(exact.cameraId);
                }
                else {
                    var before = getKeyframeBefore(time, null, '', true);
                    if (before.kf != null)
                        camera = findCamera(before.kf.cameraId);
                    else
                        camera = findCamera(0);
                }
            }
            var ar  = getAspectRatio(settings.aspectRatio);
            if (camera.cameraObject.fov != camera.cameraFov || 
                camera.cameraObject.aspect != ar) {
                camera.cameraObject.fov = camera.cameraFov;
                camera.cameraObject.aspect = ar;
                camera.cameraObject.updateProjectionMatrix();
            }
            viewport.renderer.render(scene, camera.cameraObject);
        }
        else if (viewport.camera != null) {
            // Meta camera
            gridHelper.visible = true;
            traverseTree(function (node) {
                node.threeObject.visible = true;
                node.threeObject.children.forEach(function(child) {
                    if (child.model)
                        child.material = whiteLineMat;
                    if (child.cameraModel)
                        child.visible = true;
                    if (child.wallObj)
                        child.material = editorWallMat;
                });
            });
            var selectedNode = null;
            var treeNode = $('#scene-tree').tree('getSelectedNode');
            if (treeNode) {
                selectedNode = findNode(treeNode.id);
            }
            if (selectedNode) {
                grips.visible = true;
                if (selectedNode.id != 0) {
                    grips.children.forEach(function(child) {
                        if (child.axesGrips)
                            child.visible = controlMode == CONTROLMODE.move;
                        if (child.rotGrips)
                            child.visible = controlMode == CONTROLMODE.rotate;
                    });
                }
                traverseTree(function(subNode) {
                    subNode.threeObject.children.forEach(function(child) {
                        if (child.model)
                            child.material = darkPinkLineMat;
                    });
                }, selectedNode);
                selectedNode.threeObject.children.forEach(function(child) {
                    if (child.model)
                        child.material = pinkLineMat;
                });
            }
            else {
                grips.visible = false;
            }
            var cameraX = viewport.camera;
            var cameraY = cameraX.children[0];
            var metaCamera = cameraY.children[0];
            // Show this camera center axes
            viewport.camera.children[1].visible = true;
            
            var mouse = viewport.mouse;
            if (mouse.button == 2) { // Rotate view - Right click
                cameraX.rotation.y += mouse.dx / rotateFactor;
                cameraY.rotation.x += mouse.dy / rotateFactor;
                cameraX.children[1].rotation.y -= mouse.dx / rotateFactor;
                if (cameraX.rotation.x > Math.PI / 2)
                    cameraX.rotation.x = Math.PI / 2;
                if (cameraX.rotation.x < -Math.PI / 2)
                    cameraX.rotation.x = -Math.PI / 2;
            }
            else if (mouse.button == 1) { // Pan view - Middle click
                var translate = getScreenPan(mouse, cameraX, cameraY, metaCamera);
                cameraX.position.add(translate);
            }
            else if (mouse.button == 0) {
                if (selectedNode) {
                    var translate = getScreenTranslation(mouse);
                    var worldQ = new THREE.Quaternion();
                    selectedNode.threeObject.getWorldQuaternion(worldQ);
                    if (mouse.moveAxis == AXIS.x) {
                        var xDir = new THREE.Vector3(1, 0, 0);
                        var worldX = new THREE.Vector3(1, 0, 0);
                        worldX.applyQuaternion(worldQ);
                        xDir.applyQuaternion(selectedNode.threeObject.quaternion);
                        var angle = translate.angleTo(worldX);
                        if (Math.abs(angle) > Math.PI / 2)
                            xDir.negate();
                        translate.projectOnVector(worldX);
                        xDir.multiplyScalar(translate.length());
                        selectedNode.threeObject.position.addVectors(selectedNode.threeObject.position, xDir);
                    }
                    if (mouse.moveAxis == AXIS.y) {
                        var yDir = new THREE.Vector3(0, 1, 0);
                        var worldY = new THREE.Vector3(0, 1, 0);
                        worldY.applyQuaternion(worldQ);
                        yDir.applyQuaternion(selectedNode.threeObject.quaternion);
                        var angle = translate.angleTo(worldY);
                        if (Math.abs(angle) > Math.PI / 2)
                            yDir.negate();
                        translate.projectOnVector(worldY);
                        yDir.multiplyScalar(translate.length());
                        selectedNode.threeObject.position.addVectors(selectedNode.threeObject.position, yDir);
                    }
                    if (mouse.moveAxis == AXIS.z) {
                        var zDir = new THREE.Vector3(0, 0, 1);
                        var worldZ = new THREE.Vector3(0, 0, 1);
                        worldZ.applyQuaternion(worldQ);
                        zDir.applyQuaternion(selectedNode.threeObject.quaternion);
                        var angle = translate.angleTo(worldZ);
                        if (Math.abs(angle) > Math.PI / 2)
                            zDir.negate();
                        translate.projectOnVector(worldZ);
                        zDir.multiplyScalar(translate.length());
                        selectedNode.threeObject.position.addVectors(selectedNode.threeObject.position, zDir);
                    }
                    var rotation = getScreenRotation(selectedNode, mouse, worldQ, mouse.rotateAxis);
                    if (mouse.rotateAxis == AXIS.x) {
                        selectedNode.threeObject.rotateX(rotation);
                    }
                    if (mouse.rotateAxis == AXIS.y) {
                        selectedNode.threeObject.rotateY(rotation);

                    }
                    if (mouse.rotateAxis == AXIS.z) {
                        selectedNode.threeObject.rotateZ(rotation);
                    }
                    updateGrips();
                }
            }
            if (mouse.dz < 0) { // Scroll wheel
                metaCamera.zoom *= 1 + zoomSpeed;
                metaCamera.updateProjectionMatrix();
            }
            else if (mouse.dz > 0) {
                metaCamera.zoom *= 1 - zoomSpeed;
                metaCamera.updateProjectionMatrix();
            }

            if (mouse.down && mouse.button == 0) {
                var div = viewport.div[0];
                var mouseVec = new THREE.Vector2();
                mouseVec.x = ((mouse.x - div.parentElement.offsetLeft) / div.clientWidth) * 2 - 1;
                mouseVec.y = -((mouse.y - div.parentElement.offsetTop) / div.clientHeight) * 2 + 1;
                raycaster.setFromCamera(mouseVec, metaCamera);
                var intersects = raycaster.intersectObjects(scene.children, true);
                for (var i = 0; i < intersects.length; i++) {
                    if (mouse.pickedObject == null && mouse.down) {
                        if (mouse.moveAxis == AXIS.none) {
                            if (intersects[i].object.xGrip) {
                                mouse.moveAxis = AXIS.x;
                                mouse.pickedObject = intersects[i].object;
                            }
                            if (intersects[i].object.yGrip) {
                                mouse.moveAxis = AXIS.y;
                                mouse.pickedObject = intersects[i].object;
                            }
                            if (intersects[i].object.zGrip) {
                                mouse.moveAxis = AXIS.z;
                                mouse.pickedObject = intersects[i].object;
                            }
                        }
                        if (mouse.rotateAxis == AXIS.none) {
                            if (intersects[i].object.xRotGrip) {
                                mouse.rotateAxis = AXIS.x;
                                mouse.pickedObject = intersects[i].object;
                            }
                            if (intersects[i].object.yRotGrip) {
                                mouse.rotateAxis = AXIS.y;
                                mouse.pickedObject = intersects[i].object;
                            }
                            if (intersects[i].object.zRotGrip) {
                                mouse.rotateAxis = AXIS.z;
                                mouse.pickedObject = intersects[i].object;
                            }
                        }
                    }
                }
                if (mouse.moveAxis != AXIS.none || mouse.rotateAxis != AXIS.none) {
                    var worldPos = new THREE.Vector3();
                    selectedNode.threeObject.getWorldPosition(worldPos);
                    var worldDir = new THREE.Quaternion();
                    selectedNode.threeObject.getWorldQuaternion(worldDir);
                    var pickedAxis;
                    var a, b;
                    if (mouse.moveAxis == AXIS.x) {
                        pickedAxis = new THREE.Vector3(1, 0, 0);
                        a = new THREE.Vector3(0, 1, 0);
                        b = new THREE.Vector3(0, 0, 1);
                    }
                    else if (mouse.moveAxis == AXIS.y) {
                        pickedAxis = new THREE.Vector3(0, 1, 0);
                        a = new THREE.Vector3(0, 0, 1);
                        b = new THREE.Vector3(1, 0, 0);
                    }
                    else if (mouse.moveAxis == AXIS.z) {
                        pickedAxis = new THREE.Vector3(0, 0, 1);
                        a = new THREE.Vector3(1, 0, 0);
                        b = new THREE.Vector3(0, 1, 0);
                    }
                    if (mouse.rotateAxis == AXIS.x) {
                        normal = new THREE.Vector3(1, 0, 0);
                        normal.applyQuaternion(worldDir);
                    }
                    else if (mouse.rotateAxis == AXIS.y) {
                        normal = new THREE.Vector3(0, 1, 0);
                        normal.applyQuaternion(worldDir);
                    }
                    else if (mouse.rotateAxis == AXIS.z) {
                        normal = new THREE.Vector3(0, 0, 1);
                        normal.applyQuaternion(worldDir);
                    }
                    if (mouse.rotateAxis == AXIS.none) {
                        pickedAxis.applyQuaternion(worldDir);
                        a.applyQuaternion(worldDir);
                        b.applyQuaternion(worldDir);
                        var normal = new THREE.Vector3();
                        normal.crossVectors(a, pickedAxis);
                        normal.normalize();
                        var cameraDir = new THREE.Vector3();
                        metaCamera.getWorldDirection(cameraDir);
                        var angle = normal.angleTo(cameraDir);
                        // Make plane more perpendicular to camera
                        if (angle > Math.PI / 4 && angle < 3 * Math.PI / 4)
                            normal.crossVectors(b, pickedAxis);
                    }
                    gripPlane.position.copy(worldPos);
                    var lookPt = new THREE.Vector3();
                    lookPt.addVectors(worldPos, normal);
                    gripPlane.lookAt(lookPt);
                    viewport.renderer.render(scene, metaCamera);
                }
                mouse.startPoint = mouse.currentPoint;
                var planeIntersects = raycaster.intersectObjects([gripPlane], false);
                for (var i = 0; i < planeIntersects.length; i++) {
                    if (mouse.moveAxis != AXIS.none || mouse.rotateAxis != AXIS.none) {
                        mouse.currentPoint = planeIntersects[i].point;
                    }
                }
                updateProperties();
            }
            viewport.renderer.render(scene, metaCamera);
            
            mouse.dx = 0;
            mouse.dy = 0;
            mouse.dz = 0;
        }
    });
}

function updateGrips() {
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    if (treeNode == false)
        return;
    var node = findNode(treeNode.id);
    var worldPos = new THREE.Vector3();
    var worldQ = new THREE.Quaternion();
    node.threeObject.getWorldPosition(worldPos);
    node.threeObject.getWorldQuaternion(worldQ);
    grips.position.copy(worldPos);
    grips.quaternion.copy(worldQ);
}

function getScreenTranslation(mouse) {
    var translate = new THREE.Vector3();
    if (!mouse.currentPoint || !mouse.startPoint)
        return translate;
    translate.subVectors(mouse.currentPoint, mouse.startPoint);
    return translate;
}

function getScreenRotation(node, mouse, worldQ, axis) {
    if (!mouse.startPoint || !mouse.currentPoint || axis == AXIS.none)
        return 0;
    var startVec = new THREE.Vector3();
    var worldPos = new THREE.Vector3();
    node.threeObject.getWorldPosition(worldPos);
    startVec.subVectors(mouse.startPoint, worldPos);
    var newVec = new THREE.Vector3();
    var normal;
    if (axis == AXIS.x)
        normal = new THREE.Vector3(1, 0, 0);
    else if (axis == AXIS.y)
        normal = new THREE.Vector3(0, 1, 0);
    else if (axis == AXIS.z)
        normal = new THREE.Vector3(0, 0, 1);
    normal.applyQuaternion(worldQ);
    newVec.subVectors(mouse.currentPoint, worldPos);
    var rotCross = new THREE.Vector3();
    rotCross.crossVectors(newVec, startVec);
    rotCross.normalize();
    var angle = -newVec.angleTo(startVec);
    var sig = 0;
    if (rotCross.lengthSq() != 0)
        sig = normal.angleTo(rotCross);
    if (sig > Math.PI / 2)
        angle = -angle;
    return angle;
}

function getScreenPan(mouse, cameraX, cameraY, metaCamera) {
    // Translate 2D screen movement into the appropriate 3D movement.
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

function sign(n) {
    if (n < 0)
        return -1;
    return 1;
}

$(function() {
    var showWelcome = localStorage.getItem('show-welcome');
    if (showWelcome != 'false') {
        openWelcome();
    }

    loadSettings(settings);
    updateTree();
    var defaultCamera = createCameraEditor('default camera', sceneTree, undefined, 0, 45);
    defaultCamera.threeObject.position.z = 500;
    loadModel(cubeModel, 'default-cube');
    createModelEditor('default-cube', 'default cube', sceneTree);
    gridHelper = new THREE.GridHelper(1000, 10, 0x555555, 0x555555);
    scene.add(gridHelper);
    update();
});
