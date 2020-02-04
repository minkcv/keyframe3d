layout.registerComponent( 'controlsComponent', function(container, componentState){
    container.getElement().html(
        `<div class="controls" id="controls">
            <button type='button' class='btn btn-sm' onclick='setControlMode(CONTROLMODE.move)'>Move</button><br>
            <button type='button' class='btn btn-sm' onclick='setControlMode(CONTROLMODE.rotate)'>Rotate</button><br>
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
