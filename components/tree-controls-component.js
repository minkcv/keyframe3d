layout.registerComponent( 'treeControlsComponent', function(container, componentState){
    container.getElement().html(
    `<div class="tree-controls" id="tree-controls">
        <button type='button' class='btn btn-sm' onclick='createEmptyNode()'>Create Node</button>
        <input type='text' id='empty-node-name' placeholder='name'></input>
        <br>
        <button type='button' class='btn btn-sm' onclick='renameNode()'>Rename Node</button>
        <input type='text' id='rename-node-name' placeholder='name'></input>
        <br>
        <button type'button' class='btn btn-sm' onclick='deleteNode()'>Delete Node</button>
        <br>
        <button type='button' class='btn btn-sm' onclick='addCameraToScene()'>Create Camera</button>
        <input type='text' id='camera-node-name' placeholder='name'></input>
    </div>`);
});