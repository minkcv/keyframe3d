layout.registerComponent( 'keyframeComponent', function(container, componentState){
    container.getElement().html(`
    <div class='keyframe-info' id='keyframe-info'>
    </div>
    `);
});

function updateKFInfo() {
    $('#keyframe-info').empty();
    var kf = getKeyframe(pcx, pcx.time);
    if (kf == null || kf.nodes === undefined) {
        return;
    }
    kf.nodes.forEach(function(nodeData) {
        var node = findNode(pcx, nodeData.id);
        $('#keyframe-info').append('<pre>' + node.name + '</pre>');
        $('#keyframe-info').append('<div class="node-info" id="node-info-' + nodeData.id + '"></div>');
        $('#node-info-' + nodeData.id).empty();
        if (nodeData.pos)
            $('#node-info-' + nodeData.id).append('<span class="node-info-enabled">POS</span>');
        else
            $('#node-info-' + nodeData.id).append('<span class="node-info-disabled">POS</span>');
        if (nodeData.rot)
            $('#node-info-' + nodeData.id).append('<span class="node-info-enabled">ROT</span>');
        else
            $('#node-info-' + nodeData.id).append('<span class="node-info-disabled">ROT</span>');
        if (nodeData.scale)
            $('#node-info-' + nodeData.id).append('<span class="node-info-enabled">SCALE</span>');
        else
            $('#node-info-' + nodeData.id).append('<span class="node-info-disabled">SCALE</span>');
        if (node.model) {
            if (nodeData.vis)
                $('#node-info-' + nodeData.id).append('<span class="node-info-enabled">VIS</span>');
            else
                $('#node-info-' + nodeData.id).append('<span class="node-info-disabled">VIS</span>');
        }
    });
}