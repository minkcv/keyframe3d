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
        <br>
        <button type='button' class='btn btn-sm' onclick='addWall()'>Create Wall</button>
        <input type='text' id='wall-node-name' placeholder='name'></input>
    </div>`);
});

function addEmptyNode() {
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    var parent;
    if (treeNode == null)
        parent = pcx.sceneTree;
    else
        parent = findNode(pcx, treeNode.id);
    var name = $('#empty-node-name').val();
    createEmptyNodeEditor(name, parent)
}

function addCamera() {
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    var parent;
    if (treeNode == null)
        parent = pcx.sceneTree;
    else
        parent = findNode(pcx, treeNode.id);
    var name = $('#camera-node-name').val();
    createCameraEditor(name, parent);
}

function addWall() {
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    var parent;
    if (treeNode == null)
        parent = pcx.sceneTree;
    else
        parent = findNode(pcx, treeNode.id);
    var name = $('#wall-node-name').val();
    createWallEditor(name, parent);
}