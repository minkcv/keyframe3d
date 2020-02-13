var whiteLineMat = new THREE.LineBasicMaterial({color: 0xffffff});

function getAspectRatio(str) {
    var colonIndex = str.search(':');
    if (colonIndex < 1 || colonIndex == str.length - 1)
        return NaN;
    var width = parseFloat(str.substring(0, colonIndex));
    var height = parseFloat(str.substring(colonIndex + 1, str.length));
    if (width == 0 || height == 0)
        return NaN;
    return  width / height;
}

function findNode(nodeId, startNode) {
    if (!startNode)
        startNode = sceneTree;
    if (!startNode)
        return null;
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

function getParentNode(find, tree) {
    var parent = null;
    traverseTree(function(node) {
        node.children.forEach(function(child) {
            if (child.id == find.id)
                parent = node;
        })
    }, tree);
    return parent;
}

function getModel(modelName) {
    for (var i = 0; i < models.length; i++) {
        if (models[i].name == modelName)
            return models[i];
    }
    return null;
}

function traverseTree(func, startNode) {
    if (!startNode)
        startNode = sceneTree;
    func(startNode);
    startNode.children.forEach(function(node) {
        traverseTree(func, node);
    });
}

function createEmptyNodePlayer(name, parent, id) {
    var obj = new THREE.Object3D();
    var newNode = {
        id: id,
        name: name,
        children: [],
        threeObject: obj
    };
    if (parent != null) {
        parent.children.push(newNode);
        parent.threeObject.add(obj);
    }
    return newNode;
}

function createModelPlayer(node, modelName) {
    var model = getModel(modelName);
    node.model = modelName;
    var linesObject = createModelGeometry(model.data, modelName);
    node.threeObject.add(linesObject);
    return node;
}

function createModelGeometry(data, modelName) {
    var geometries = [];
    var lines = [];
    data.forEach((point) => {
        point.conn.forEach((otherId) => {
            var other = null;
            data.forEach((candidate) => {
                if (candidate.id == otherId)
                    other = candidate;
            });
            if (other != null) {
                var pos1 = new THREE.Vector3(point.pos.x, point.pos.y, point.pos.z);
                var pos2 = new THREE.Vector3(other.pos.x, other.pos.y, other.pos.z);
                var pt1 = {pointId: point.id, position: pos1};
                var pt2 = {pointId: other.id, position: pos2};
                var scale = 1;
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
    if (modelName)
        linesObject.model = modelName;
    return linesObject;
}

function createCameraPlayer(node, cameraId, fov) {
    node.cameraId = cameraId;
    node.cameraFov = fov;
    var camera = new THREE.PerspectiveCamera(node.cameraFov, getAspectRatio(settings.aspectRatio), 0.1, 16000);
    node.threeObject.add(camera);
    node.cameraObject = camera;
    return node;
}

function findCamera(cameraId, startNode) {
    if (!startNode)
        startNode = sceneTree;
    var found = null;
    if (startNode.cameraId == cameraId)
        return startNode;
    startNode.children.forEach(function(node) {
        var foundSub = findCamera(cameraId, node);
        if (foundSub)
            found = foundSub;
    });
    return found;
}

function getKeyframe(time) {
    var found = null;
    keyframes.forEach(function(keyframe) {
        if (keyframe.time == time)
            found = keyframe
    });
    return found;
}

function getKeyframeBefore(time, nodeId, hasCamera) {
    var found = null;
    var foundData = null;
    keyframes.forEach(function(keyframe) {
        var data = getKeyframeData(keyframe, nodeId);
        if (data != null || hasCamera) {
            if (!hasCamera || keyframe.cameraId !== undefined) {
                if (keyframe.time < time) {
                    if (found == null) {
                        found = keyframe;
                        foundData = data;
                    }
                    else if (found.time < keyframe.time) {
                        found = keyframe;
                        foundData = data;
                    }
                }
            }
        }
    });
    return {kf: found, data: foundData};
}

function getKeyframeAfter(time, nodeId) {
    var found = null;
    var foundData = null;
    keyframes.forEach(function(keyframe) {
        var data = getKeyframeData(keyframe, nodeId);
        if (data != null) {
            if (keyframe.time > time) {
                if (found == null) {
                    found = keyframe;
                    foundData = data;
                }
                else if (found.time > keyframe.time) {
                    found = keyframe;
                    foundData = data;
                }
            }
        }
    });
    return {kf: found, data: foundData};
}

function getKeyframeData(kf, nodeId) {
    var found = null;
    if (kf == null)
        return null;
    kf.nodes.forEach(function(nodeData) {
        if (nodeData.id == nodeId)
            found = nodeData;
    });
    return found;
}

function seekTimePlayer(time) {
    var exact = getKeyframe(time);
    if (exact != null) {
        traverseTree(function(node) {
            var data = getKeyframeData(exact, node.id);
            if (data == null)
                return;
            node.threeObject.position.x = data.pos.x;
            node.threeObject.position.y = data.pos.y;
            node.threeObject.position.z = data.pos.z;
            node.threeObject.quaternion.set(data.rot.x, data.rot.y, data.rot.z, data.rot.w);
        })
    }
    else {
        traverseTree(function(node) {
            var before = getKeyframeBefore(time, node.id);
            var after = getKeyframeAfter(time, node.id);
            if (before.kf == null && after.kf != null) {
                node.threeObject.position.x = after.data.pos.x;
                node.threeObject.position.y = after.data.pos.y;
                node.threeObject.position.z = after.data.pos.z;
                node.threeObject.quaternion.set(after.data.rot.x, after.data.rot.y, after.data.rot.z, after.data.rot.w);
            }
            else if (before.kf != null && after.kf == null) {
                node.threeObject.position.x = before.data.pos.x;
                node.threeObject.position.y = before.data.pos.y;
                node.threeObject.position.z = before.data.pos.z;
                node.threeObject.quaternion.set(before.data.rot.x, before.data.rot.y, before.data.rot.z, before.data.rot.w);
            }
            else if (before.kf != null && after.kf != null) {
                var alpha = (time - before.kf.time) / (after.kf.time - before.kf.time);
                var posBefore = new THREE.Vector3(before.data.pos.x, before.data.pos.y, before.data.pos.z);
                var posAfter = new THREE.Vector3(after.data.pos.x, after.data.pos.y, after.data.pos.z);
                var rotBefore = new THREE.Quaternion(before.data.rot.x, before.data.rot.y, before.data.rot.z, before.data.rot.w);
                var rotAfter = new THREE.Quaternion(after.data.rot.x, after.data.rot.y, after.data.rot.z, after.data.rot.w);
                var pos = new THREE.Vector3();
                var rot = new THREE.Quaternion();
                pos.lerpVectors(posBefore, posAfter, alpha);
                rotBefore.normalize();
                rotAfter.normalize();
                THREE.Quaternion.slerp(rotBefore, rotAfter, rot, alpha);
                node.threeObject.position.set(pos.x, pos.y, pos.z);
                node.threeObject.setRotationFromQuaternion(rot);
            }
        });
    }
    var cameraNode = null;
    if (exact != null && exact.cameraId !== undefined)
        cameraNode = findCamera(exact.cameraId);
    else {
        var before = getKeyframeBefore(time, null, true)
        if (before.kf != null)
            cameraNode = findCamera(before.kf.cameraId);
        else
            cameraNode = findCamera(0);
    }
    return cameraNode;
}

function playPlayer() {
    if (time == settings.length) {
        time = 0;
        clearInterval(timerId);
    }
    if (timerId != -1)
        return;
    timerId = setInterval(function() {
        var camera = seekTimePlayer(time);
        time = time + 1;
        if (time > settings.length - 1) {
            if (settings.loop) {
                time = 0;
            }
            else {
                clearInterval(timerId);
                timerId = -1;
                return;
            }
        }
        
        renderer.render(scene, camera.cameraObject);
    }, 1000 / settings.framerate);
}

function stopPlayer() {
    if (timerId != -1) {
        clearInterval(timerId);
        timerId = -1;
    }
}
