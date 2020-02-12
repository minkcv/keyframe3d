layout.registerComponent( 'treeControlsComponent', function(container, componentState){
    container.getElement().html(
    `<div class="tree-controls" id="tree-controls">
        <button type='button' class='btn btn-sm' onclick='addEmptyNode()'>Create Node</button>
        <input type='text' id='empty-node-name' placeholder='name'></input>
        <br>
        <button type='button' class='btn btn-sm' onclick='renameNode()'>Rename Node</button>
        <input type='text' id='rename-node-name' placeholder='name'></input>
        <br>
        <button type'button' class='btn btn-sm' onclick='deleteNode()'>Delete Node</button>
        <br>
        <button type='button' class='btn btn-sm' onclick='addCamera()'>Create Camera</button>
        <input type='text' id='camera-node-name' placeholder='name'></input>
    </div>`);
});

function addEmptyNode() {
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    var parent;
    if (treeNode == null)
        parent = sceneTree;
    else
        parent = findNode(treeNode.id);
    var name = $('#empty-node-name').val();
    createEmptyNode(name, parent)
}

function addCamera() {
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    var parent;
    if (treeNode == null)
        parent = sceneTree;
    else
        parent = findNode(treeNode.id);
    var name = $('#camera-node-name').val();
    createCamera(name, parent);
}