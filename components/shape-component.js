layout.registerComponent( 'shapeComponent', function(container, componentState){
    container.getElement().html(
    `<div class='shapes' id='shapes'>
    <div class="input-group">
        <div class="custom-file">
            <input type="file" class="custom-file-input" id="load-shape" multiple='true' onchange='loadShapeFromFiles(this.files)'>
            <label class="custom-file-label" for="load-shape">Load Shape</label>
        </div>
    </div>
    
    <select class='shape-select' id='shape-select' size='10'>
    </select><br>
    <button type='button' class='btn btn-sm' onclick='addShapeToScene($("#shape-select option:selected").text())'>Add To Scene</button>
    <input type='text' id='shape-node-name' placeholder='name'></input><br>
    <button type='button' class='btn btn-sm' onclick='applyShapeToSelected($("#shape-select option:selected").text())'>Apply To Selected</button>
    <button type='button' class='btn btn-sm' onclick='removeShapeFromSelected()'>Remove From Selected</button><br>
    <button type='button' class='btn btn-sm' onclick='unloadShape()' id='unload-shape'>Unload Shape</button><br>
    </div>`);
});

function addShapeToScene(shapeName) {
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    var parent;
    if (treeNode == false)
        parent = pcx.sceneTree;
    else
        parent = findNode(pcx, treeNode.id);
    var nodeName = $('#shape-node-name').val();
    createShapeEditor(shapeName, nodeName, parent);
}

function loadShapeFromFiles(files) {
    for (var i = 0; i < files.length; i++) {
        var duplicate = false;
        pcx.shapes.forEach(function(shape) {
            if (shape.name == files[i].name)
                duplicate = true;
        });
        if (duplicate) {
            alert('Shape with that name already exists');
            continue;
        }
        (function(file){
            var reader = new FileReader();
            reader.onloadend = function () {
                var data = JSON.parse(reader.result);
                loadShape(data, file.name);
                if ($('#shape-select').attr('size') < pcx.shapes.length)
                    $('#shape-select').attr('size', pcx.shapes.length);
            }
            if (files[i])
                reader.readAsText(files[i]);
        })(files[i]);
    }
    // Clear the value on the file input so it can still fire onchange again
    // even if loading the same file
    if (files.length > 0)
        document.getElementById('load-shape').value = '';
}

function loadShape(data, name) {
    var duplicate = false;
    pcx.shapes.forEach(function(existing) {
        if (existing.name == name)
            duplicate = true;
    });
    if (duplicate) {
        log('Skipped loading shape "' + name + '" because a shape already exists with that name', 'warning');
        return;
    }
    var shape = {
        name: name,
        data: data
    }
    pcx.shapes.push(shape);
    log('Loaded shape "' + shape.name + '"');
    $('#shape-select').append($('<option id=' + name + '></option>').text(name));
}

function unloadShape() {
    var name = $('#shape-select option:selected').text();
    if (!name) {
        alert('Select a shape to unload');
        return;
    }
    for (var i = 0; i < pcx.shapes.length; i++) {
        if (pcx.shapes[i].name == name) {
            pcx.shapes.splice(i, 1);
            break;
        }
    }
    traverseTree(pcx, function(node) {
        if (node.shape == name) {
            node.threeObject.remove(node.shapeObject);
            node.shape = undefined;
            node.shapeObject = undefined;
        }
    });
    $('#shape-select option[id="' + name + '"]').remove();
    log('Unloaded shape "' + name + '"');
    viewportsNeedRender();
}

function applyShapeToSelected(shapeName) {
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    if (treeNode == false || treeNode.id == 0) {
        alert('Select a node to apply the shape to. Cannot use root node.');
        return;
    }
    var node = findNode(pcx, treeNode.id);
    if (node.shape) {
        node.threeObject.remove(node.shapeObject);
    }
    if (node.model) {
        node.threeObject.remove(node.modelObject);
        node.model = undefined;
        node.modelObject = undefined;
    }
    var shape = getShape(pcx, shapeName);
    node.shape = shapeName;
    var linesObject = createShapeGeometry(pcx, shape.data, shape);
    node.threeObject.add(linesObject);
    node.shapeObject = linesObject;
    updateProperties();
    viewportsNeedRender();
}

function removeShapeFromSelected() {
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    if (treeNode == false || treeNode.id == 0) {
        alert('Select a node to remove the shape from.');
        return;
    }
    var node = findNode(pcx, treeNode.id);
    if (node.shape) {
        node.threeObject.remove(node.shapeObject);
        node.shapeObject = undefined;
        node.shape = undefined;
    }
    else {
        alert('The node does not have a shape');
    }
    updateProperties();
    viewportsNeedRender();
}
