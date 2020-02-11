layout.registerComponent( 'controlsComponent', function(container, componentState){
    container.getElement().html(
        `<div class="controls" id="controls">
            <button type='button' class='btn btn-sm' onclick='setControlMode(CONTROLMODE.move)'>Move</button>
            <button type='button' class='btn btn-sm' onclick='setControlMode(CONTROLMODE.rotate)'>Rotate</button><br>
            <hr>
            <div>Current Time: <span id='current-time'>0</span></div>
            <button type='button' class='btn btn-sm' onclick='play()'>Play</button>
            <button type='button' class='btn btn-sm' onclick='stop()'>Stop</button><br>
            <hr>

            <button type='button' class='btn btn-sm' onclick='setKeyframeNode()'>Set Keyframe for Node</button><br>
            <button type='button' class='btn btn-sm' onclick='removeKeyframeNode()'>Remove Keyframe for Node</button><br>
            <button type='button' class='btn btn-sm' onclick='removeKeyframe()'>Remove Keyframe</button><br>
            <button type='button' class='btn btn-sm' onclick='seekNext(null)'>Seek Next Keyframe</button><br>
            <button type='button' class='btn btn-sm' onclick='seekPrevious(null)'>Seek Previous Keyframe</button><br>
            <button type='button' class='btn btn-sm' onclick='seekNextNode()'>Seek Next Keyframe for Node</button><br>
            <button type='button' class='btn btn-sm' onclick='seekPreviousNode()'>Seek Previous Keyframe for Node</button><br>
            <button type='button' class='btn btn-sm' onclick='seekTimeInput()'>Seek to Time:</button>
            <input type='number' name='seek-to-time' id='seek-to-time' value='0'><br>
        </div>`);
});

function setControlMode(mode) {
    controlMode = mode;
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    var node = findNode(treeNode.id);
    if (node == false)
        return;
    node.threeObject.children.forEach(function(child) {
        if (child.axesGrips)
            child.visible = mode == CONTROLMODE.move;
        if (child.rotGrips)
            child.visible = mode == CONTROLMODE.rotate;
    });
}

function setKeyframeNode() {
    var time = timeline.getCustomTime('playhead').getTime();
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    if (treeNode == false) {
        alert('Select a node to set a keyframe');
        return;
    }
    var node = findNode(treeNode.id);
    var existing = getKeyframe(time);
    var nodeKF = {
        id: node.id,
        pos: {x: node.threeObject.position.x, y: node.threeObject.position.y, z: node.threeObject.position.z},
        rot: {x: node.threeObject.quaternion.x, y: node.threeObject.quaternion.y, z: node.threeObject.quaternion.z, w: node.threeObject.quaternion.w}
    };
    if (existing == null) {
        var kf = {
            time: time,
            nodes: [
                nodeKF
            ]
        }
        keyframes.push(kf);
        log('Created new keyframe at ' + time + ' with data for node "' + node.name + '" (' + node.id + ')');
    }
    else {
        var existingData = getKeyframeData(existing, node.id);
        if (existingData) {
            existingData.pos.x = node.threeObject.position.x;
            existingData.pos.y = node.threeObject.position.y;
            existingData.pos.z = node.threeObject.position.z;
            existingData.rot.x = node.threeObject.quaternion.x;
            existingData.rot.y = node.threeObject.quaternion.y;
            existingData.rot.z = node.threeObject.quaternion.z;
            existingData.rot.w = node.threeObject.quaternion.w;
            log('Updated data for node "' + node.name + '" (' + node.id + ') to keyframe at ' + time);
        }
        else {
            existing.nodes.push(nodeKF);
            log('Added data for node "' + node.name + '" (' + node.id + ') to keyframe at ' + time);
        }
    }
    updateTimeline();
}

function removeKeyframeNode() {
    var time = timeline.getCustomTime('playhead').getTime();
    var kf = getKeyframe(time);
    if (kf == null) {
        alert('No keyframe at current time. Seek to a time with a keyframe to remove it');
        return;
    }
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    var node = findNode(treeNode.id);
    if (treeNode == false) {
        alert('Select a node to remove a keyframe');
        return;
    }
    for (var i = 0; i < kf.nodes.length; i++) {
        if (kf.nodes[i].id == treeNode.id) {
            log('Removed data from keyframe at' + time + ' for node "' + node.name + '" (' + node.id + ')');
            kf.nodes.splice(i, 1);
            break;
        }
    }
    for (var i = 0; i < keyframes.length; i++) {
        if (keyframes[i].nodes.length == 0) {
            log('Removed keyframe at' + time);
            keyframes.splice(i, 1);
            break;
        }
    }
    updateTimeline();
}

function removeKeyframe() {
    var time = timeline.getCustomTime('playhead').getTime();
    for (var i = 0; i < keyframes.length; i++) {
        if (keyframes[i].time == time) {
            log('Removed keyframe at time ' + time);
            keyframes.splice(i, 1);
            break;
        }
    }
    updateTimeline();
}

function seekNext(node) {
    var time = timeline.getCustomTime('playhead').getTime();
    var newTime = -1;
    keyframes.forEach(function(kf) {
        var data = null;
        if (node != null)
            data = getKeyframeData(kf, node.id);
        if (node == null || data != null) {
            if (kf.time > time) {
                if (newTime == -1)
                    newTime = kf.time;
                else if (newTime > kf.time)
                    newTime = kf.time;
            }
        }
    });
    if (newTime != -1) {
        seekTime(newTime);
    }
}

function seekPrevious(node) {
    var time = timeline.getCustomTime('playhead').getTime();
    var newTime = -1;
    keyframes.forEach(function(kf) {
        var data = null;
        if (node != null)
            data = getKeyframeData(kf, node.id);
        if (node == null || data != null) {
            if (kf.time < time) {
                if (newTime == -1)
                    newTime = kf.time;
                else if (newTime < kf.time)
                    newTime = kf.time;
            }
        }
    });
    if (newTime != -1) {
        seekTime(newTime);
    }
}

function seekNextNode() {
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    if (treeNode == false) {
        alert('Select a node to seek to it\'s next keyframe');
        return;
    }
    var node = findNode(treeNode.id);
    seekNext(node);
}

function seekPreviousNode() {
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    if (treeNode == false) {
        alert('Select a node to seek to it\'s previous keyframe');
        return;
    }
    var node = findNode(treeNode.id);
    seekPrevious(node);
}

function seekTimeInput() {
    var time = parseInt($('#seek-to-time').val());
    if (time < 0 || time > settings.length - 1) {
        alert('Seek to time must be between 0 and ' + (settings.length - 1));
        return;
    }
    seekTime(time);
}

function play() {
    if (playState == PLAY.play)
        return;
    playState = PLAY.play;
    timerId = setInterval(function() {
        var time = timeline.getCustomTime('playhead').getTime();
        if (time + 1 > settings.length - 1) {
            playState = PLAY.stop;
            clearInterval(timerId);
            timerId = -1;
            return;
        }
        seekTime(time + 1);
    }, 1000 / settings.framerate);
}

function stop() {
    playState = PLAY.stop;
    if (timerId != -1) {
        clearInterval(timerId);
        timerId = -1;
    }
}