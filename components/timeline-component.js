var timeline;
var previousTime;

layout.registerComponent( 'timelineComponent', function(container, componentState){
    container.getElement().html('<div id="timeline"></div>');
    container.on('open', function() {
        var div = $('#timeline')[0];
        var items = new vis.DataSet();
        var formatOptions = {
            minorLabels: {
              millisecond:'x',
              second:     'x',
              minute:     'x',
              hour:       'x',
              weekday:    'x',
              day:        'x',
              week:       'x',
              month:      'x',
              year:       'x'
            },
            majorLabels: {
              millisecond:'x',
              second:     'x',
              minute:     'x',
              hour:       'x',
              weekday:    'x',
              day:        'x',
              week:       'x',
              month:      'x',
              year:       'x'
            }
          };
          var editableOptions = {
            add: false,         // add new items by double tapping
            updateTime: false,  // drag items horizontally
            updateGroup: false, // drag items from one group to another
            remove: false,       // delete an item by tapping the delete button top right
            overrideItems: false  // allow these options to override item.editable
            
            
          };
        var options = {
            height: '100px',
            min: new Date(0),
            max: new Date(settings.length),
            start: new Date(0),
            end: new Date(settings.length),
            showCurrentTime: true,
            orientation: 'top',
            format: formatOptions,
            editable: editableOptions,
            selectable: false,
            onAdd: function(item, callback) {
                item.content = "";
                item.type = 'point';
                callback(item);
            }
        };
        timeline = new vis.Timeline(div, items, options);
        timeline.options.height = $('#timeline').height();
        timeline.addCustomTime(new Date(0), 'playhead');
        previousTime = 0;
        timeline.setCustomTimeTitle('Playhead', 'playhead');
        // :( need this set 0 because creating it at the min just isn't good enough.
        timeline.setCustomTime(new Date(0), 'playhead');
        timeline.on('timechanged', function(event) {
            if (event.id == 'playhead') {
                if (event.time < new Date(0)) {
                    timeline.setCustomTime(new Date(0), 'playhead');
                }
                if (event.time > new Date(settings.length)) {
                    timeline.setCustomTime(new Date(settings.length - 1), 'playhead');
                }
            }
        });
        timeline.on('timechange', function(event) {
            if (event.id == 'playhead') {
                timeChanged(event.time);
            }
        })
        timeline.redraw();
        div.onclick = function(event) {
            var props = timeline.getEventProperties(event);
            if (props.item) {

            }
            else if (props.what == 'axis') {
                timeline.setCustomTime(props.time, 'playhead');
                timeChanged(props.time);
                
            }
        };
    });
    container.on('show', function(){
        window.setTimeout(function(){
            timeline.options.height = $('#timeline').height();
            timeline.redraw();
        }, 300);
    });
    container.on('resize', function() {
        window.setTimeout(function(){
            timeline.options.height = $('#timeline').height();
            timeline.redraw();
        }, 300);
    });
});

function timeChanged(dateTime) {
    var time = dateTime.getTime();
    if (time < 0)
        time = 0;
    if (time >= settings.length)
        time = settings.length - 1;
    if (time != previousTime)
        seekTime(time);
}

function seekTime(time, noLog) {
    if (!noLog)
        log('Seek to ' + time);
    timeline.setCustomTime(new Date(time), 'playhead');
    $('#current-time').text(time);
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
        })
    }
    previousTime = time;
}

function updateTimeline() {
    var data = new vis.DataSet();
    keyframes.forEach(function(kf) {
        data.add({
            start: new Date(kf.time),
            type: 'point',
            id: kf.time,
            className: 'timeline-keyframe'

        });
    });
    timeline.setItems(data);
}