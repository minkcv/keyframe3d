layout.registerComponent( 'controlsComponent', function(container, componentState){
    container.getElement().html(
        `<div class="controls" id="controls">
            <button type='button' class='btn btn-sm' onclick='setControlMode(CONTROLMODE.move)'>Move</button>
            <button type='button' class='btn btn-sm' onclick='setControlMode(CONTROLMODE.rotate)'>Rotate</button><br>
            <hr>
            <div>Current Time: <span id='current-time'>0</span></div>
            <button type='button' class='btn btn-sm' onclick='play()'>Play</button>
            <button type='button' class='btn btn-sm' onclick='pause()'>Pause</button>
            <button type='button' class='btn btn-sm' onclick='stop()'>Stop</button><br>
            <button type='button' class='btn btn-sm' onclick='seekTimeInput()'>Seek To Time:</button>
            <input type='number' name='seek-to-time' id='seek-to-time' value='0' placeholder='time'><br>
            <hr>
            <div>
                <span>Set Keyframe For:</span>
                <select id='keyframe-what-nodes'>
                    <option value='all-nodes'>All Nodes</option>
                    <option value='selected-and-children'>Selected And Children</option>
                    <option value='selected-node'>Selected</option>
                </select>
            </div>
            <label for='kf-position'>Position:</label>
            <input type='checkbox' name='kf-position' id='kf-position' checked='true'><br>
            <label for='kf-rotation'>Rotation:</label>
            <input type='checkbox' name='kf-rotation' id='kf-rotation' checked='true'><br>
            <label for='kf-scale'>Scale:</label>
            <input type='checkbox' name='kf-scale' id='kf-scale' checked='true'><br>
            <label for='kf-visible'>Visibility:</label>
            <input type='checkbox' name='kf-visible' id='kf-visible' checked='true'><br>

            <button type='button' class='btn btn-sm' onclick='setKeyframe()'>Set Keyframe</button><br>
            <button type='button' class='btn btn-sm' onclick='copyKeyframe()'>Copy Keyframe To Time</button>
            <input type='number' name='copy-to-time' id='copy-to-time' placeholder='time'><br>
            <button type='button' class='btn btn-sm' onclick='shiftKeyframes()'>Shift Keyframes</button>
            <input type='number' name='shift-by-time' id='shift-by-time' placeholder='time'><br>
            <button type='button' class='btn btn-sm' onclick='removeKeyframe()'>Remove Keyframe</button><br>
            <button type='button' class='btn btn-sm' onclick='seekNext()'>Seek Next Keyframe</button><br>
            <button type='button' class='btn btn-sm' onclick='seekPrevious()'>Seek Previous Keyframe</button><br>
            <hr>
            <div>Key Camera: <span id='key-camera'>default camera</span></div>
            <button type='button' class='btn btn-sm' onclick='setKeyframeCamera()'>Set Camera</button>
            <select id='keyframe-camera'></select>
        </div>`);
});

function setControlMode(mode) {
    controlMode = mode;
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    var node = findNode(pcx, treeNode.id);
    if (node == false)
        return;
    node.threeObject.children.forEach(function(child) {
        if (child.axesGrips)
            child.visible = mode == CONTROLMODE.move;
        if (child.rotGrips)
            child.visible = mode == CONTROLMODE.rotate;
    });
}

function setKeyframe() {
    var time = timeline.getCustomTime('playhead').getTime();
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    var selectedNode = null;
    var kfWhatNodes = $('#keyframe-what-nodes').val();
    var nodes = [];
    if (kfWhatNodes == 'all-nodes') {
        traverseTree(pcx, function(node) {
            nodes.push(node);
        });
    }
    else if (kfWhatNodes == 'selected-and-children') {
        selectedNode = findNode(pcx, treeNode.id)
        traverseTree(pcx, function(node) {
            nodes.push(node);
        }, selectedNode);
    }
    else if (kfWhatNodes == 'selected-node') {
        selectedNode = findNode(pcx, treeNode.id);
        nodes.push(selectedNode);
    }
    
    if (treeNode == false && kfWhatNodes != 'all-nodes') {
        alert('Select a node to set a keyframe');
        return;
    }
    var existing = getKeyframe(pcx, time);
    var nodesData = [];
    var nodeNames = '"';
    var kfPosition = $('#kf-position').prop('checked');
    var kfRotation = $('#kf-rotation').prop('checked');
    var kfScale = $('#kf-scale').prop('checked');
    var kfVisible = $('#kf-visible').prop('checked');
    nodes.forEach(function(node) {
        if (node.id == 0)
            return;
        nodeNames += node.name + '" ';
        var nodeKF = getNodeData(node, kfPosition, kfRotation, kfScale, kfVisible);
        nodesData.push(nodeKF);
    });
    if (existing == null) {
        var kf = {
            time: time,
            nodes: nodesData
        };
        pcx.keyframes.push(kf);
        log('Created new keyframe at ' + time + ' with data for nodes ' + nodeNames);
    }
    else {
        nodesData.forEach(function(data) {
            var existingData = getKeyframeData(existing, data.id);
            if (existingData) {
                if (kfPosition) {
                    existingData.pos = data.pos;
                }
                if (kfRotation) {
                    existingData.rot = data.rot;
                }
                if (kfScale) {
                    existingData.scale = data.scale;
                }
                if (kfVisible) {
                    existingData.vis = data.vis;
                }
            }
            else {
                existing.nodes.push(data);
            }
        });
        log('Updated keyframe data for nodes ' + nodeNames);
    }
    updateTimeline();
}

function shiftKeyframes() {
    var shiftBy = parseInt($('#shift-by-time').val());
    var kfWhatNodes = $('#keyframe-what-nodes').val();
    var kfPosition = $('#kf-position').prop('checked');
    var kfRotation = $('#kf-rotation').prop('checked');
    var kfScale = $('#kf-scale').prop('checked');
    var kfVisible = $('#kf-visible').prop('checked');
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    var selectedNode = null;
    var nodeNames = '"';
    if (treeNode != false)
        selectedNode = findNode(pcx, treeNode.id);
    var newKeyframes = {};
    for (var i = 0; i < pcx.keyframes.length; i++) {
        var kf = pcx.keyframes[i];
        var currentTime = kf.time;
        var newTime = currentTime + shiftBy;
        if (newTime < 0) {
            log('The keyframe at time ' + currentTime + ' was moved to a negative time and was removed', 'warning');
            pcx.keyframes.splice(i, 1);
            i--;
        }
        if (newTime >= pcx.settings.length) {
            log('The keyframe at time ' + currentTime + ' was moved to a time past the animation length', 'warning');
        }
        var newKF = {time: newTime, nodes: []};
        if (kfWhatNodes == 'selected-node') {
            var data = getKeyframeData(kf, selectedNode.id);
            if (data == null)
                return;
            nodeNames += selectedNode.name + '" ';
            var newData = {id: selectedNode.id};
            if (kfPosition && data.pos)
                newData.pos = JSON.parse(JSON.stringify(data.pos));
            if (kfRotation && data.rot)
                newData.rot = JSON.parse(JSON.stringify(data.rot));
            if (kfScale && data.scale)
                newData.scale = JSON.parse(JSON.stringify(data.scale));
            if (kfVisible && data.vis)
                newData.vis = JSON.parse(JSON.stringify(data.vis));
            newKF.nodes.push(newData);
        }
        else {
            if (kfWhatNodes == 'all-nodes')
                selectedNode = findNode(pcx, 0);
            traverseTree(pcx, function(node) {
                var data = getKeyframeData(kf, node.id);
                if (data == null)
                    return;
                nodeNames += node.name + '" ';
                var newData = {id: node.id};
                if (kfPosition && data.pos)
                    newData.pos = JSON.parse(JSON.stringify(data.pos));
                if (kfRotation && data.rot)
                    newData.rot = JSON.parse(JSON.stringify(data.rot));
                if (kfScale && data.scale)
                    newData.scale = JSON.parse(JSON.stringify(data.scale));
                if (kfVisible && data.vis)
                    newData.vis = JSON.parse(JSON.stringify(data.vis));
                newKF.nodes.push(newData);
            }, selectedNode);
        }
        newKeyframes[currentTime.toString()] = newKF;
    };
    Object.keys(newKeyframes).forEach(function(key) {
        var oldTime = parseInt(key);
        var newKF = newKeyframes[key];
        var oldKF = getKeyframe(pcx, oldTime);
        newKF.nodes.forEach(function(node) {
            var data = getKeyframeData(oldKF, node.id);
            if (data == null)
                return;
            if (kfPosition)
                data.pos = undefined;
            if (kfRotation)
                data.rot = undefined;
            if (kfScale)
                data.scale = undefined;
            if (kfVisible)
                data.vis = undefined;
        });
    });
    Object.keys(newKeyframes).forEach(function(key) {
        var oldTime = parseInt(key);
        var newKF = newKeyframes[key];
        var existingKF = getKeyframe(pcx, newKF.time);
        if (existingKF == null) {
            existingKF = {time: newKF.time, nodes: []};
            pcx.keyframes.push(existingKF);
        }
        newKF.nodes.forEach(function(node) {
            var data = getKeyframeData(existingKF, node.id);
            if (data == null) {
                var data = {id: node.id};
                existingKF.nodes.push(data);
            }
            if (kfPosition)
                data.pos = node.pos;
            if (kfRotation)
                data.rot = node.rot;
            if (kfScale)
                data.scale = node.scale;
        });
    });
    log('Shifted time for data for nodes ' + nodeNames);
    cleanKeyframes(nodeNames);
    updateTimeline();
}

function getNodeData(node, kfPosition, kfRotation, kfScale, kfVisible) {
    var nodeKF = {
        id: node.id,
    };
    if (kfPosition) {
        nodeKF.pos = {
            x: parseFloat(node.threeObject.position.x.toFixed(precision)), 
            y: parseFloat(node.threeObject.position.y.toFixed(precision)), 
            z: parseFloat(node.threeObject.position.z.toFixed(precision))
        };
    }
    if (kfRotation) {
        nodeKF.rot = {
            x: parseFloat(node.threeObject.quaternion.x.toFixed(precision)), 
            y: parseFloat(node.threeObject.quaternion.y.toFixed(precision)), 
            z: parseFloat(node.threeObject.quaternion.z.toFixed(precision)), 
            w: parseFloat(node.threeObject.quaternion.w.toFixed(precision))
        };
    }
    if (kfScale) {
        nodeKF.scale = {
            x: parseFloat(node.threeObject.scale.x.toFixed(precision)),
            y: parseFloat(node.threeObject.scale.y.toFixed(precision)),
            z: parseFloat(node.threeObject.scale.z.toFixed(precision))
        };
    }
    if (kfVisible) {
        var vis = null;
        node.threeObject.children.forEach(function(child) {
            if (child.model) {
                vis = child.vis;
            }
        });
        if (vis != null && vis !== undefined)
            nodeKF.vis = vis;
    }
    return nodeKF;
}

function copyKeyframe() {
    var time = timeline.getCustomTime('playhead').getTime();
    var kf = getKeyframe(pcx, time);
    if (kf == null) {
        alert('No keyframe at current time. Seek to a time with a keyframe to copy');
        return;
    }
    var copyTime = parseInt($('#copy-to-time').val());
    var kfWhatNodes = $('#keyframe-what-nodes').val();
    var kfPosition = $('#kf-position').prop('checked');
    var kfRotation = $('#kf-rotation').prop('checked');
    var kfScale = $('#kf-scale').prop('checked');
    var kfVisible = $('#kf-visible').prop('checked');
    var kfExisting = getKeyframe(pcx, copyTime);
    if (kfExisting == null) {
        kfExisting = {
            time: copyTime,
            nodes: []
        };
        pcx.keyframes.push(kfExisting);
    }
    var kfNewNodeData = [];
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    var selectedNode = null;
    if (treeNode != false)
        selectedNode = findNode(pcx, treeNode.id);
    kf.nodes.forEach(function(node) {
        if (kfWhatNodes == 'selected-and-children') {
            var skip = true;
            traverseTree(pcx, function(other) {
                if (other.id == node.id)
                    skip = false;
            }, selectedNode);
            if (skip)
                return;
        }
        else if (kfWhatNodes == 'selected-node') {
            if (node.id != treeNode.id || node.id == 0)
                return;
        }
        var nodeData = getKeyframeData(kf, node.id);
        var existingData = null;
        kfExisting.nodes.forEach(function(existingNode) {
            if (nodeData.id == existingNode.id)
                existingData = existingNode;
        });
        if (existingData) {
            if (nodeData.pos && kfPosition)
                existingData.pos = nodeData.pos;
            if (nodeData.rot && kfRotation)
                existingData.rot = nodeData.rot;
            if (nodeData.scale && kfScale)
                existingData.scale = nodeData.scale;
            if (nodeData.vis && kfVisible)
                existingData.vis = nodeData.vis;
        }
        else {
            var newData = {id: node.id};
            if (kfPosition)
                newData.pos = nodeData.pos;
            if (kfRotation)
                newData.rot = nodeData.rot;
            if (kfScale)
                newData.scale = nodeData.scale;
            if (kfVisible)
                newData.vis = nodeData.vis;
            if (kfPosition || kfRotation || kfScale)
                kfNewNodeData.push(newData);
        }
    });
    kfNewNodeData.forEach(function(newData) {
        kfExisting.nodes.push(newData);
    });
    
    updateTimeline();
}

function removeKeyframe() {
    var time = timeline.getCustomTime('playhead').getTime();
    var kf = getKeyframe(pcx, time);
    if (kf == null) {
        alert('No keyframe at current time. Seek to a time with a keyframe to remove it');
        return;
    }
    var kfWhatNodes = $('#keyframe-what-nodes').val();
    var kfPosition = $('#kf-position').prop('checked');
    var kfRotation = $('#kf-rotation').prop('checked');
    var kfScale = $('#kf-scale').prop('checked');
    var kfVisible = $('#kf-visible').prop('checked');
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    var selectedNode = null;
    if (treeNode != false)
        selectedNode = findNode(pcx, treeNode.id);
    if (kfWhatNodes != 'all-nodes' && selectedNode == null) {
        alert('Select a node to remove a keyframe');
        return;
    }
    var nodeNames = '"';
    kf.nodes.forEach(function(node) {
        if (kfWhatNodes == 'selected-and-children') {
            var skip = true;
            traverseTree(pcx, function(other) {
                if (other.id == node.id)
                    skip = false;
            }, selectedNode);
            if (skip)
                return;
        }
        else if (kfWhatNodes == 'selected-node') {
            if (node.id != treeNode.id || node.id == 0)
                return;
        }
        var sceneNode = findNode(pcx, node.id);
        nodeNames += + sceneNode.name + '" ';
        if (kfPosition)
            node.pos = undefined;
        if (kfRotation)
            node.rot = undefined;
        if (kfScale)
            node.scale = undefined;
        if (kfVisible)
            node.vis = undefined;
    });
    cleanKeyframes(nodeNames);
    seekTime(time);
    updateProperties();
    updateTimeline();
}

function cleanKeyframes(nodeNames) {
    for (var i = 0; i < pcx.keyframes.length; i++) {
        var kf = pcx.keyframes[i];
        for (var n = 0; n < kf.nodes.length; n++) {
            if (kf.nodes[n].pos === undefined && kf.nodes[n].rot === undefined && kf.nodes[n].scale == undefined) {
                log('Removed data from keyframe at ' + kf.time + ' for nodes ' + nodeNames);
                kf.nodes.splice(n, 1);
                n--;
            }
        }
    }
    for (var i = 0; i < pcx.keyframes.length; i++) {
        if (pcx.keyframes[i].nodes.length == 0) {
            log('Removed keyframe at ' + pcx.keyframes[i].time);
            pcx.keyframes.splice(i, 1);
            i--;
        }
    }
}

function seekNextPrevious(next) {
    var time = timeline.getCustomTime('playhead').getTime();
    var newTime = -1;
    var kfWhatNodes = $('#keyframe-what-nodes').val();
    var kfPosition = $('#kf-position').prop('checked');
    var kfRotation = $('#kf-rotation').prop('checked');
    var kfScale = $('#kf-scale').prop('checked');
    var kfVisible = $('#kf-visible').prop('checked');
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    var selectedNode = null;
    if (treeNode != false)
        selectedNode = findNode(pcx, treeNode.id);
    pcx.keyframes.forEach(function(kf) {
        if (!kf.nodes)
            return;
        kf.nodes.forEach(function(nodeData) {
            var skip = true;
            if (kfWhatNodes == 'all-nodes')
                skip = false;
            else if (kfWhatNodes == 'selected-and-children') {
                traverseTree(pcx, function(other) {
                    if (other.id == nodeData.id)
                        skip = false;
                }, selectedNode);
            }
            else if (nodeData.id == selectedNode.id)
                skip = false;
            if (skip)
                return;
            
            if ((nodeData.pos && kfPosition) || (nodeData.rot && kfRotation) || (nodeData.scale && kfScale) || nodeData.vis && kfVisible) {
                if ((next && kf.time > time) || (!next && kf.time < time)) {
                    if (newTime == -1)
                        newTime = kf.time;
                    else if ((next && kf.time < newTime) || (!next && kf.time > newTime))
                        newTime = kf.time;
                }
            }
        });
    });
    if (newTime != -1) {
        seekTime(newTime);
        updateProperties();
    }
}

function seekNext() {
    seekNextPrevious(true);
}

function seekPrevious() {
    seekNextPrevious(false);
}

function seekTimeInput() {
    var time = parseInt($('#seek-to-time').val());
    if (time < 0 || time > pcx.settings.length - 1) {
        alert('Seek to time must be between 0 and ' + (pcx.settings.length - 1));
        return;
    }
    seekTime(time);
    updateProperties();
}

function play() {
    if (playState == PLAY.play)
        return;
    playState = PLAY.play;
    pcx.timerId = setInterval(function() {
        var time = timeline.getCustomTime('playhead').getTime();
        seekTime(time, true);
        time = time + 1;
        if (time > pcx.settings.length - 1) {
            if (pcx.settings.loop) {
                time = 0;
            }
            else {
                playState = PLAY.stop;
                clearInterval(pcx.timerId);
                pcx.timerId = -1;
                return;
            }
        }
        
        timeline.setCustomTime(new Date(time), 'playhead');
    }, 1000 / pcx.settings.framerate);
}

function pause() {
    playState = PLAY.stop;
    if (pcx.timerId != -1) {
        clearInterval(pcx.timerId);
        pcx.timerId = -1;
    }
}

function stop() {
    pause();
    seekTime(0);
    updateProperties();
}

function setKeyframeCamera() {
    var time = timeline.getCustomTime('playhead').getTime();
    var cameraName = $('#keyframe-camera').val();
    var cameraNode = findNodeByName(cameraName);
    var kf = getKeyframe(pcx, time);
    if (kf == null) {
        var newKF = {
            time: time,
            nodes: [],
            cameraId: cameraNode.cameraId
        }
        pcx.keyframes.push(newKF);
        log('Created new keyframe with camera ' + cameraName + ' at time ' + time);
    }
    else {
        kf.cameraId = cameraNode.cameraId;
        log('Updated camera to "' + cameraName + '" at time ' + time);
    }
    $('#key-camera').text(cameraName);
    updateTimeline();
}
