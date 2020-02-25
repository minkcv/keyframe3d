var lineMaterial = new THREE.LineBasicMaterial({color: 0xffffff});
var wallMaterial = new THREE.MeshBasicMaterial({color: 0x000000, side: THREE.DoubleSide});

function loadSettingsPlayer(newSettings) {
    lineMaterial = new THREE.LineBasicMaterial({color: newSettings.lineColor});
    wallMaterial = new THREE.MeshBasicMaterial({color: newSettings.bgColor, side: THREE.DoubleSide});
    scene.background = new THREE.Color(newSettings.bgColor);
}

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
    node.modelObject = linesObject;
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
    var linesObject = new THREE.LineSegments(mergedGeometry, lineMaterial);
    linesObject.computeLineDistances();
    if (modelName)
        linesObject.model = modelName;
    return linesObject;
}

function createCameraPlayer(node, cameraId, fov) {
    node.cameraId = cameraId;
    node.cameraFov = fov;
    var camera = new THREE.PerspectiveCamera(node.cameraFov, getAspectRatio(settings.aspectRatio), 0.1, 160000);
    node.threeObject.add(camera);
    node.cameraObject = camera;
    return node;
}

function createWallPlayer(node, width, height) {
    var wallGeom = new THREE.PlaneGeometry(1, 1, 1, 1);
    var wall = new THREE.Mesh(wallGeom, wallMaterial);
    wall.wallObj = true;
    wall.scale.x = width;
    wall.scale.y = height;
    node.wallWidth = width;
    node.wallHeight = height;
    node.threeObject.add(wall);
    node.wallObject = wall;
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

function getKeyframeBefore(time, nodeId, dataType, hasCamera) {
    var found = null;
    var foundData = null;
    keyframes.forEach(function(keyframe) {
        var data = getKeyframeData(keyframe, nodeId);
        if ((data != null && data[dataType] !== undefined) || hasCamera) {
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

function getKeyframeAfter(time, nodeId, dataType) {
    var found = null;
    var foundData = null;
    keyframes.forEach(function(keyframe) {
        var data = getKeyframeData(keyframe, nodeId);
        if (data != null && data[dataType] !== undefined) {
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
    var kf = getKeyframe(time);
    traverseTree(function(node) {
        var current = getKeyframeData(kf, node.id);
        var currentPos = null;
        var currentRot = null;
        var currentScale = null;
        var currentVis = null;
        if (current) {
            currentPos = current.pos;
            currentRot = current.rot;
            currentScale = current.scale;
            currentVis = current.vis;
        }
        if (currentPos)
            node.threeObject.position.set(currentPos.x, currentPos.y, currentPos.z);
        if (currentRot)
            node.threeObject.quaternion.set(currentRot.x, currentRot.y, currentRot.z, currentRot.w);
        if (currentScale)
            node.threeObject.scale.set(currentScale.x, currentScale.y, currentScale.z);
        if (currentVis == false) {
            node.threeObject.children.forEach(function(child) {
                if (child.model) {
                    child.visible = false;
                    child.vis = false;
                }
            });
        }
        else if (currentVis == true) {
            node.threeObject.children.forEach(function(child) {
                if (child.model) {
                    child.visible = true;
                    child.vis = true;
                }
            });
        }
        if (currentPos && currentRot && currentScale && currentVis != null) {
            node.threeObject.quaternion.normalize();
            return;
        }
        var beforePos = getKeyframeBefore(time, node.id, 'pos');
        var beforeRot = getKeyframeBefore(time, node.id, 'rot');
        var beforeScale = getKeyframeBefore(time, node.id, 'scale');
        var beforeVis = getKeyframeBefore(time, node.id, 'vis');
        var afterPos = getKeyframeAfter(time, node.id, 'pos');
        var afterRot = getKeyframeAfter(time, node.id, 'rot');
        var afterScale = getKeyframeAfter(time, node.id, 'scale');
        if (beforeVis.data && beforeVis.data.vis == false && currentVis == null) {
            node.threeObject.children.forEach(function(child) {
                if (child.model) {
                    child.visible = false;
                    child.vis = false;
                }
            });
        }
        else if (beforeVis.data && beforeVis.data.vis == true && currentVis == null) {
            node.threeObject.children.forEach(function(child) {
                if (child.model) {
                    child.visible = true;
                    child.vis = true;
                }
            });
        }
        if (afterPos.data && !beforePos.data && !currentPos)
            node.threeObject.position.set(afterPos.data.pos.x, afterPos.data.pos.y, afterPos.data.pos.z);
        if (afterRot.data && !beforeRot.data && !currentRot)
            node.threeObject.quaternion.set(afterRot.data.rot.x, afterRot.data.rot.y, afterRot.data.rot.z, afterRot.data.rot.w);
        if (afterScale.data && !beforeScale.data && !currentScale)
            node.threeObject.scale.set(afterScale.data.scale.x, afterScale.data.scale.y, afterScale.data.scale.z);
        if (beforePos.data && !afterPos.data && !currentPos)
            node.threeObject.position.set(beforePos.data.pos.x, beforePos.data.pos.y, beforePos.data.pos.z);
        if (beforeRot.data && !afterRot.data && !currentRot)
            node.threeObject.quaternion.set(beforeRot.data.rot.x, beforeRot.data.rot.y, beforeRot.data.rot.z, beforeRot.data.rot.w);
        if (beforeScale.data && !afterScale.data && !currentScale)
            node.threeObject.scale.set(beforeScale.data.scale.x, beforeScale.data.scale.y, beforeScale.data.scale.z);
        if (beforePos.data && afterPos.data && !currentPos) {
            var alpha = (time - beforePos.kf.time) / (afterPos.kf.time - beforePos.kf.time);
            var posBefore = new THREE.Vector3(beforePos.data.pos.x, beforePos.data.pos.y, beforePos.data.pos.z);
            var posAfter = new THREE.Vector3(afterPos.data.pos.x, afterPos.data.pos.y, afterPos.data.pos.z);
            var pos = new THREE.Vector3();
            pos.lerpVectors(posBefore, posAfter, alpha);
            node.threeObject.position.set(pos.x, pos.y, pos.z);
        }
        if (beforeRot.data && afterRot.data && !currentRot) {
            var alpha = (time - beforeRot.kf.time) / (afterRot.kf.time - beforeRot.kf.time);
            var rotBefore = new THREE.Quaternion(beforeRot.data.rot.x, beforeRot.data.rot.y, beforeRot.data.rot.z, beforeRot.data.rot.w);
            var rotAfter = new THREE.Quaternion(afterRot.data.rot.x, afterRot.data.rot.y, afterRot.data.rot.z, afterRot.data.rot.w);
            var rot = new THREE.Quaternion();
            rotBefore.normalize();
            rotAfter.normalize();
            THREE.Quaternion.slerp(rotBefore, rotAfter, rot, alpha);
            node.threeObject.setRotationFromQuaternion(rot);

        }
        if (afterScale.data && beforeScale.data && !currentScale) {
            var alpha = (time - beforeScale.kf.time) / (afterScale.kf.time - beforeScale.kf.time);
            var xs = beforeScale.data.scale.x + ((afterScale.data.scale.x - beforeScale.data.scale.x) * alpha);
            var ys = beforeScale.data.scale.y + ((afterScale.data.scale.y - beforeScale.data.scale.y) * alpha);
            var zs = beforeScale.data.scale.z + ((afterScale.data.scale.z - beforeScale.data.scale.z) * alpha);
            node.threeObject.scale.set(xs, ys, zs);
        }
        node.threeObject.quaternion.normalize();
    });
    var cameraNode = null;
    if (kf != null && kf.cameraId !== undefined)
        cameraNode = findCamera(kf.cameraId);
    else {
        var before = getKeyframeBefore(time, null, '', true)
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
