layout.registerComponent( 'modifierComponent', function(container, componentState){
    container.getElement().html(`
    <div class='modifier' id='modifier'>
        <select id='modifier-select' onchange='changeModifier()'>
            <option value=0>None</option>
            <option value=1>Array</option>
            <option value=2>Revolve</option>
            <option value=3>Mirror</option>
        </select>
        <div id='modifier-options'>
            <div id='array-options' style='display:none'>
                <label>#X: </label><input type='number' id='array-num-x' value=1 onchange='changeModifierDetail()'><br>
                <label>#Y: </label><input type='number' id='array-num-y' value=1 onchange='changeModifierDetail()'><br>
                <label>#Z: </label><input type='number' id='array-num-z' value=1 onchange='changeModifierDetail()'><br>
                <label>X Offset: </label><input type='number' id='array-offset-x' value=100 onchange='changeModifierDetail()'><br>
                <label>Y Offset: </label><input type='number' id='array-offset-y' value=100 onchange='changeModifierDetail()'><br>
                <label>Z Offset: </label><input type='number' id='array-offset-z' value=100 onchange='changeModifierDetail()'><br>
            </div>
            <div id='revolve-options' style='display:none'>
            </div>
            <div id='mirror-options' style='display:none'>
            </div>
        </div>
    </div>
    `);
});

function updateModifiers() {
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    if (treeNode == false)
        return;
    if (treeNode.id == 0 ) {
        $('#modifier-select').hide();
        return;
    }
    $('#modifier-select').show();
    var node = findNode(pcx, treeNode.id);
    if (node.modifier === undefined) {
        $('#array-options').hide();
        $('#revolve-options').hide();
        $('#mirror-options').hide();
        $('#modifier-select').val(0);
        return;
    }
    $('#modifier-select').val(node.modifier.type);
    if (node.modifier.type == 1) {
        $('#array-options').show();
         $('#array-num-x').val(node.modifier.xn);
         $('#array-num-y').val(node.modifier.yn);
         $('#array-num-z').val(node.modifier.zn);
         $('#array-offset-x').val(node.modifier.xo);
         $('#array-offset-y').val(node.modifier.yo);
         $('#array-offset-z').val(node.modifier.zo);
    }
    else if (node.modifier.type == 2) {
        $('#revolve-options').show();
    }
    else if (node.modifier.type == 3) {
        $('#mirror-options').show();
    }
}

function changeModifier() {
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    if (treeNode == false)
        return;
    if (treeNode.id == 0) {
        $('#array-options').hide();
        $('#revolve-options').hide();
        $('#mirror-options').hide();
        alert('Cannot use modifier on the root node');
        return;
    }
    var modifierType = parseInt($('#modifier-select').val());
    var node = findNode(pcx, treeNode.id);
    if (modifierType == 0) {
        $('#array-options').hide();
        $('#revolve-options').hide();
        $('#mirror-options').hide();
        cleanupOldModifierNodes(node);
        node.modifier = undefined;
        selectNode(node.id);
        return;
    }
    if (node.modifier) {
        node.modifier.type = modifierType;
    }
    else {
        node.modifier = {
            type: modifierType,
        };
    }
    if (modifierType == 1) {
        node.modifier.xn = 1;
        node.modifier.yn = 1;
        node.modifier.zn = 1;
        node.modifier.xo = 100;
        node.modifier.yo = 100;
        node.modifier.zo = 100;
    }
    cleanupOldModifierNodes(node);
    updateModifiers();
    updateModifierNodes(pcx);
    selectNode(node.id);
}

function changeModifierDetail() {
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    if (treeNode == false)
        return;
    var node = findNode(pcx, treeNode.id);
    if (node.modifier.type == 1) {
        node.modifier.xn = parseInt($('#array-num-x').val());
        node.modifier.yn = parseInt($('#array-num-y').val());
        node.modifier.zn = parseInt($('#array-num-z').val());
        node.modifier.xo = parseInt($('#array-offset-x').val());
        node.modifier.yo = parseInt($('#array-offset-y').val());
        node.modifier.zo = parseInt($('#array-offset-z').val());
    }
    cleanupOldModifierNodes(node);
    createModNodesPlayer(pcx, node);
    updateModifierNodes(pcx);
    selectNode(node.id);
}

function cleanupOldModifierNodes(node) {
    var parent = getParentNode(pcx, node);
    var toDelete = [];
    traverseTree(pcx, function (modNode) {
        if (modNode.modId !== undefined)
            toDelete.push(modNode);
    }, parent);

    toDelete.forEach(function(modNode) {
        deleteNode(modNode);
    });
}