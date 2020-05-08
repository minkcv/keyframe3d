layout.registerComponent( 'treeControlsComponent', function(container, componentState){
    container.getElement().html(
    `<div class="tree-controls" id="tree-controls">
        <button type='button' class='btn btn-sm' onclick='addEmptyNode()'>Create Node</button>
        <button type='button' class='btn btn-sm' onclick='renameNode()'>Rename Node</button>
        <button type'button' class='btn btn-sm' onclick='deleteSelectedNode()'>Delete Node</button>
        <button type='button' class='btn btn-sm' onclick='addCamera()'>Create Camera</button>
        <button type='button' class='btn btn-sm' onclick='duplicateNode()'>Duplicate Node</button>
        <br>
        <input type='text' id='node-name' placeholder='name'></input>
    </div>`);
});

function addEmptyNode() {
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    var parent;
    if (treeNode == null)
        parent = pcx.sceneTree;
    else
        parent = findNode(pcx, treeNode.id);
    var name = $('#node-name').val();
    createEmptyNodeEditor(name, parent)
}

function addCamera() {
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    var parent;
    if (treeNode == null)
        parent = pcx.sceneTree;
    else
        parent = findNode(pcx, treeNode.id);
    var name = $('#node-name').val();
    createCameraEditor(name, parent);
}

function duplicateNode() {
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    if (treeNode == null || treeNode == false) {
        alert('Select a node to duplicate');
        return;
    }
    else if (treeNode.id == 0) {
        alert('Cannot duplicate the root node');
        return;
    }
    var node = findNode(pcx, treeNode.id);
    duplicateNodeEditor(node);
    updateProperties();
}

function deleteSelectedNode() {
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    if (treeNode == false) {
        alert('Select a node to delete');
        return;
    }
    if (treeNode.id == 0) {
        alert('Cannot delete the root node');
        return;
    }
    var node = findNode(pcx, treeNode.id);
    var parent = getParentNode(pcx, node);
    deleteNode(node);
    selectNode(parent.id);
}