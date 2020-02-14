layout.registerComponent( 'treeComponent', function(container, componentState){
    container.getElement().html(
    `<div class="tree-view" id="scene-tree">
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
        }).on('tree.click', function(event) {
            event.preventDefault();
            selectNode(event.node.id);
        }).on('tree.move', function(event) {
            var movedNode = findNode(event.move_info.moved_node.id);
            var newParent = findNode(event.move_info.target_node.id);
            var oldParent = findNode(event.move_info.previous_parent.id);
            if (newParent.id == 0 &&
                (event.move_info.position == 'before' || event.move_info.position == 'after')) {
                // Only root node can be top level
                event.preventDefault();
                return;
            }
            if (newParent.id == oldParent.id)
                return; // Node was just reordered
            if (event.move_info.position == 'before' || event.move_info.position == 'after') {
                var neighborNode = findNode(event.move_info.target_node.id);
                newParent = getParentNode(neighborNode);
            }
            for (var i = 0; i < oldParent.children.length; i++) {
                if (oldParent.children[i].id == movedNode.id) {
                    oldParent.children.splice(i, 1);
                    oldParent.threeObject.remove(movedNode.threeObject);
                    newParent.threeObject.add(movedNode.threeObject);
                    break;
                }
            }
            newParent.children.push(movedNode);
        });
    });
});

function updateTree() {
    if (sceneTree)
        $('#scene-tree').tree('loadData', [sceneTree]);
}
