var viewports = [];
var scene = new THREE.Scene();
var whiteLineMat = new THREE.LineBasicMaterial({color: 0xffffff});
var pinkLineMat = new THREE.LineBasicMaterial({color: 0xdf3eff});
var darkPinkLineMat = new THREE.LineBasicMaterial({color: 0xa464b1});
var redLineMat = new THREE.LineBasicMaterial({color: 0xff0000});
var greenLineMat = new THREE.LineBasicMaterial({color: 0x00ff00});
var blueLineMat = new THREE.LineBasicMaterial({color: 0x0000ff});
var redMat = new THREE.MeshBasicMaterial({color: 0xff0000, side: THREE.DoubleSide});
var greenMat = new THREE.MeshBasicMaterial({color: 0x00ff00, side: THREE.DoubleSide});
var blueMat = new THREE.MeshBasicMaterial({color: 0x0000ff, side: THREE.DoubleSide});
var planeMat = new THREE.MeshBasicMaterial({visible: true, color: 0xcccccc, side: THREE.DoubleSide});
var gripPlaneGeom = new THREE.PlaneGeometry(1000, 1000, 1, 1);
var gripPlane = new THREE.Mesh(gripPlaneGeom, planeMat);
gripPlane.gripPlane = true;
scene.add(gripPlane);
var AXIS = {x: 0, y: 1, z: 2, none: 3};
var CONTROLMODE = {move: 0, rotate: 1}
var controlMode = CONTROLMODE.move;
var raycaster = new THREE.Raycaster();

layout.init();

var settings = {
    length: 36000,
    framerate: 60,
    aspectRatio: '16:9'
};

var models = [];
var sceneTree = {
    id: 0, 
    name: 'root', 
    children:[], 
    model: null,
    threeObject: new THREE.Object3D()
};
scene.add(sceneTree.threeObject);

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
    $('#aspect-ratio').val(settings.aspectRatio);
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

function selectNode(id) {
    var treeNode = $('#scene-tree').tree('getNodeById', id);
    $('#scene-tree').tree('selectNode', treeNode);
    traverseTree(function (node) {
        node.threeObject.children.forEach(function(child) {
            if (child.model)
                child.material = whiteLineMat;
            if (child.axesGrips)
                child.visible = false;
            if (child.rotGrips)
                child.visible = false;
        });
    });
    var node = findNode(id);
    node.threeObject.children.forEach(function(child) {
        if (child.axesGrips)
            child.visible = controlMode == CONTROLMODE.move;
        if (child.rotGrips)
            child.visible = controlMode == CONTROLMODE.rotate;
    });
    traverseTree(function(node) {
        node.threeObject.children.forEach(function(child) {
            if (child.model)
                child.material = darkPinkLineMat;
        });
    }, node);
    node.threeObject.children.forEach(function(child) {
        if (child.model)
            child.material = pinkLineMat;
    });
    updateProperties();
}

function findNode(nodeId, startNode) {
    if (!startNode)
        startNode = sceneTree;
    var found = null;
    if (startNode.id == nodeId)
        return startNode;
    startNode.children.forEach(function(node) {
        var foundSub = findNode(nodeId, node);
        if (foundSub)
            found = foundSub;
    });
    return found;
}

function getParentNode(find) {
    var parent = null;
    traverseTree(function(node) {
        node.children.forEach(function(child) {
            if (child.id == find.id)
                parent = node;
        })
    });
    return parent;
}

function findNodeByName(name, startNode) {
    if (!startNode)
        startNode = sceneTree;
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

function traverseTree(func, startNode) {
    if (!startNode)
        startNode = sceneTree;
    func(startNode);
    startNode.children.forEach(function(node) {
        traverseTree(func, node);
    });
}

function getNextNodeId() {
    var nextId = 0;
    while (findNode(nextId) != null) {
        nextId++;
    }
    return nextId;
}

function createEmptyNode(name) {
    var selectedNode = $('#scene-tree').tree('getSelectedNode');
    var parent;
    if (selectedNode == false)
        parent = sceneTree;
    else
        parent = findNode(selectedNode.id);

    if (!name)
        name = $('#empty-node-name').val();
    if (name.length < 1) {
        alert('Name for node cannot be blank');
        log('Attempt to create node with empty name', 'warning');
        return null;
    }
    var existing = findNodeByName(name);
    if (existing) {
        alert('Node with that name already exists');
        log('Attempt to create node with same name as existing node', 'warning');
        return null;
    }
    var nodeId = getNextNodeId();
    var obj = new THREE.Object3D();
    var axesGrips = new THREE.Object3D();
    axesGrips.visible = controlMode == CONTROLMODE.move;
    axesGrips.axesGrips = true;
    var xGripGeom = new THREE.Geometry();
    xGripGeom.vertices.push(new THREE.Vector3(0, 0, 0));
    xGripGeom.vertices.push(new THREE.Vector3(50, 0, 0));
    var xGrip = new THREE.Line(xGripGeom, redLineMat);
    xGrip.xGrip = true;
    xGrip.visible = controlMode == CONTROLMODE.move;
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
    obj.add(axesGrips);
    var rotationGrips = new THREE.Object3D();
    rotationGrips.visible = controlMode == CONTROLMODE.rotate;
    rotationGrips.rotGrips = true;
    var xRotateGeom = new THREE.CylinderGeometry(70, 70, 2, 30, 1, true);
    var xRotate = new THREE.Mesh(xRotateGeom, redMat);
    xRotate.rotation.z = Math.PI / 2;
    xRotate.xRotGrip = true;
    var yRotateGeom = new THREE.CylinderGeometry(70, 70, 2, 30, 1, true);
    var yRotate = new THREE.Mesh(yRotateGeom, greenMat);
    yRotate.yRotGrip = true;
    var zRotateGeom = new THREE.CylinderGeometry(70, 70, 2, 30, 1, true);
    var zRotate = new THREE.Mesh(zRotateGeom, blueMat);
    zRotate.rotation.x = Math.PI / 2;
    zRotate.zRotGrip = true;
    rotationGrips.add(xRotate);
    rotationGrips.add(yRotate);
    rotationGrips.add(zRotate);
    obj.add(rotationGrips)
    var newNode = {
        id: nodeId,
        name: name,
        children: [],
        model: null,
        threeObject: obj
    };
    obj.sceneNode = newNode;
    parent.children.push(newNode);
    parent.threeObject.add(obj);
    updateTree();
    selectNode(nodeId)
    log('Created empty node with name "' + name + '"');
    return newNode;
}

function renameNode() {
    var selectedNode = $('#scene-tree').tree('getSelectedNode');
    if (selectedNode == false) {
        alert('Select a node to rename');
        return;
    }
    if (selectedNode.id == 0) {
        alert('Cannot rename the root node');
        return;
    }
    var node = findNode(selectedNode.id);
    var name = $('#rename-node-name').val();
    if (name.length < 1) {
        alert('Name for node cannot be blank');
        log('Attempt to create node with empty name', 'warning');
        return;
    }
    var existing = findNodeByName(name);
    if (existing) {
        alert('Node with that name already exists');
        log('Attempt to rename node to with same name as existing node', 'warning');
        return;
    }
    log('Renamed node "' + node.name + '" to "' + name + '"');
    node.name = name;
    updateTree();
    selectNode(node.id);
}

function deleteNode() {
    var selectedNode = $('#scene-tree').tree('getSelectedNode');
    if (selectedNode == false) {
        alert('Select a node to delete');
        return;
    }
    if (selectNode.id == 0) {
        alert('Cannot delete the root node');
        return;
    }
    var node = findNode(selectedNode.id);
    var childNames = '';
    traverseTree(function(child) {
        if (child.name != node.name)
            childNames += '"' + child.name + '", ';
    }, node);
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
    selectNode(parent.id);
    log('Deleted node "' + node.name + '" with children ' + childNames);
}

function getModel(modelName) {
    for (var i = 0; i < models.length; i++) {
        if (models[i].name == modelName)
            return models[i];
    }
    return null;
}

function addModelToScene(modelName) {
    var selectedNode = $('#scene-tree').tree('getSelectedNode');
    var parent;
    if (selectedNode == false)
        parent = sceneTree;
    else
        parent = findNode(selectedNode.id);
    var model = getModel(modelName);
    if (!model) {
        alert('Select a model from the list of loaded models');
        return;
    }
    var nodeName = $('#model-node-name').val();
    var node = createEmptyNode(nodeName);
    if (node == null)
        return;
    node.model = modelName;
    var geometries = [];
    var lines = [];
    model.data.forEach((point) => {
        point.conn.forEach((otherId) => {
            var other = null;
            model.data.forEach((candidate) => {
                if (candidate.id == otherId)
                    other = candidate;
            });
            if (other != null) {
                var pos1 = new THREE.Vector3(point.pos.x, point.pos.y, point.pos.z);
                var pos2 = new THREE.Vector3(other.pos.x, other.pos.y, other.pos.z);
                var pt1 = {pointId: point.id, position: pos1};
                var pt2 = {pointId: other.id, position: pos2};
                var scale = scale || 0.1;
                pt1.position.multiplyScalar(scale);
                pt2.position.multiplyScalar(scale);
                var exists = false;
                lines.forEach((existing) => {
                    if ((existing.id1 == pt1.pointId && existing.id2 == pt2.pointId) ||
                        (existing.id1 == pt2.pointId && existing.id2 == pt1.pointId)) {
                            exists = true;
                    }
                });
                if (!exists) {
                    var geom = new THREE.BufferGeometry();
                    var vertices = new Float32Array([
                        pt1.position.x, pt1.position.y, pt1.position.z,
                        pt2.position.x, pt2.position.y, pt2.position.z
                    ]);
                    geom.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
                    geometries.push(geom);
                    var lineData = {
                        id1: pt1.pointId,
                        id2: pt2.pointId,
                    };
                    lines.push(lineData);
                }
            }
        });
    });
    var mergedGeometry = THREE.BufferGeometryUtils.mergeBufferGeometries(geometries);
    var linesObject = new THREE.LineSegments(mergedGeometry, whiteLineMat);
    linesObject.model = modelName;
    node.threeObject.add(linesObject);
    log('Added model "' + modelName + '" to node "' + node.name + '"');
    selectNode(node.id);
}

function update() {
    requestAnimationFrame(update);

    var rotateFactor = 100;
    var zoomSpeed = 0.2;
    viewports.forEach(function(viewport) {
        for (var v = 0; v < viewports.length; v++) {
            if (viewports[v].camera != null)
                viewports[v].camera.children[1].visible = false;
        }
        if (viewport.camera != null) {
            var cameraX = viewport.camera;
            var cameraY = cameraX.children[0];
            var metaCamera = cameraY.children[0];
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
                //translate.negate();
                cameraX.position.add(translate);
            }
            else if (mouse.button == 0) {
                var treeNode = $('#scene-tree').tree('getSelectedNode');
                if (treeNode) {
                    var selectedNode = findNode(treeNode.id);
                    var translate = getScreenTranslation(mouse);
                    translate.applyQuaternion(selectedNode.threeObject.quaternion);
                    if (mouse.moveAxis == AXIS.x) {
                        selectedNode.threeObject.translateX(translate.x);
                    }
                    if (mouse.moveAxis == AXIS.y) {
                        selectedNode.threeObject.translateY(translate.y);
                    }
                    if (mouse.moveAxis == AXIS.z) {
                        selectedNode.threeObject.translateZ(translate.z);
                    }
                    if (mouse.rotateAxis == AXIS.x) {
                        var rotation = getScreenRotation(selectedNode, cameraX, cameraY, metaCamera, mouse, viewport.div[0]);
                        selectedNode.threeObject.rotateX(rotation);
                    }
                    if (mouse.rotateAxis == AXIS.y) {
                        var rotation = getScreenRotation(selectedNode, cameraX, cameraY, metaCamera, mouse, viewport.div[0]);
                        selectedNode.threeObject.rotateY(rotation);
                    }
                    if (mouse.rotateAxis == AXIS.z) {
                        var rotation = getScreenRotation(selectedNode, cameraX, cameraY, metaCamera, mouse, viewport.div[0]);
                        selectedNode.threeObject.rotateZ(rotation);
                    }
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
            

            if (mouse.down) {
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
                    mouse.pickedObject.getWorldPosition(worldPos);
                    var worldDir = new THREE.Quaternion();
                    mouse.pickedObject.getWorldQuaternion(worldDir);
                    gripPlane.position.copy(worldPos);
                    gripPlane.setRotationFromQuaternion(worldDir);
                    viewport.renderer.render(scene, metaCamera);
                }
                mouse.startPoint = mouse.currentPoint;
                var planeIntersects = raycaster.intersectObjects([gripPlane], false);
                for (var i = 0; i < planeIntersects.length; i++) {
                    mouse.currentPoint = planeIntersects[i].point;
                }
                updateProperties();
            }
            viewport.renderer.render(scene, metaCamera);
            
            mouse.dx = 0;
            mouse.dy = 0;
            mouse.dz = 0;
        }
    })
}

function getScreenTranslation(mouse) {
    var translate = new THREE.Vector3();
    if (!mouse.currentPoint || !mouse.startPoint)
        return translate;
    translate.subVectors(mouse.currentPoint, mouse.startPoint);
    return translate;
}

function getScreenRotation(node, cameraX, cameraY, metaCamera, mouse, div) {
    if (mouse.startTheta == null) {
        var x = (mouse.startX - div.parentElement.offsetLeft);
        var y = (mouse.startY - div.parentElement.offsetTop);
        var theta = Math.atan(y / x);
        mouse.startTheta = theta;
    }
    var dx = (mouse.x - div.parentElement.offsetLeft);
    var dy = (mouse.y - div.parentElement.offsetTop);
    if (dx == 0)
        return 0;
    var dTheta = Math.atan(dy / dx);
    return (dTheta - mouse.startTheta) / 10;
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

$(function() {
    loadSettings(settings);
    updateTree();

    var gridHelper = new THREE.GridHelper(1000, 10, 0x555555, 0x555555);
    scene.add(gridHelper);
    update();
});