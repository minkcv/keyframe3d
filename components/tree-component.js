layout.registerComponent( 'treeComponent', function(container, componentState){
    container.getElement().html(
    `<div class="tree-view" id="scene-tree-container">
        <button type='button' class='btn btn-sm' onclick='createEmptyNode()'>Create Node</button>
        <input type='text' id='empty-node-name' placeholder='name'></input>
        <button type='button' class='btn btn-sm' onclick='renameNode()'>Rename Node</button>
        <input type='text' id='rename-node-name' placeholder='name'></input>
        <br>
        <div id='scene-tree'></div>
    </div>`);
    container.on('open', function() {
        $('#scene-tree').tree({
            data: [],
            autoOpen: true,
            dragAndDrop: true,
            selectable: true,
            slide: false,
            closedIcon: '+',
            openedIcon: '-'
        }).on('tree.click', function(event){
            var node = findNode(event.node.id);
            node.threeObject.material = pinkLineMat;
        });
    });
});

function updateTree() {
    $('#scene-tree').tree('loadData', [sceneTree]);
}
