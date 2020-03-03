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
            var movedNode = findNode(pcx, event.move_info.moved_node.id);
            var newParent = findNode(pcx, event.move_info.target_node.id);
            var oldParent = findNode(pcx, event.move_info.previous_parent.id);
            if (newParent.id == 0 &&
                (event.move_info.position == 'before' || event.move_info.position == 'after')) {
                // Only root node can be top level
                event.preventDefault();
                return;
            }
            if (newParent.id == oldParent.id)
                return; // Node was just reordered
            if (event.move_info.position == 'before' || event.move_info.position == 'after') {
                var neighborNode = findNode(pcx, event.move_info.target_node.id);
                newParent = getParentNode(pcx, neighborNode);
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
    if (pcx.sceneTree) {
        var nodeNoThree = {
            id: 0, 
            name: 'root', 
            children: []
        };
        traverseTree(pcx, function(node) {
            var copy = {
                id: node.id,
                name: node.name,
                children: []
            };
            if (node.model !== undefined)
                copy.model = node.model;
            if (node.cameraId !== undefined){
                copy.cameraId = node.cameraId;
                copy.cameraFov = node.cameraFov;
            }
            if (node.shape !== undefined) {
                copy.shape = node.shape;
            }
            var parent = getParentNode(pcx, node);
            if (parent != null) {
                // Search our copy tree for the parent
                var copyParent = findNode(pcx, parent.id, nodeNoThree);
                if (copyParent != null)
                    copyParent.children.push(copy);
            }
        });
        var oldTree = $('#scene-tree').tree('getNodeById', 0);
        $('#scene-tree').tree('loadData', [nodeNoThree]);
        traverseTree(pcx, function(node) {
            var newNode = $('#scene-tree').tree('getNodeById', node.id);
            if (newNode && node.is_open == false)
                $('#scene-tree').tree('closeNode', newNode);
        }, oldTree);
    }
}
