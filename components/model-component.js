layout.registerComponent( 'modelComponent', function(container, componentState){
    container.getElement().html(
    `<div class='models' id='models'>
    <div class="input-group">
        <div class="custom-file">
            <input type="file" class="custom-file-input" id="load-model" multiple='true' onchange='loadModelFromFiles(this.files)'>
            <label class="custom-file-label" for="load-model">Load Model</label>
        </div>
    </div>
    
    <select class='model-select' id='model-select' size='10'>
    </select><br>
    <button type='button' class='btn btn-sm' onclick='addModelToScene($("#model-select option:selected").text())'>Add To Scene</button>
    <input type='text' id='model-node-name' placeholder='name'></input><br>
    <button type='button' class='btn btn-sm' onclick='applyModelToSelected($("#model-select option:selected").text())'>Apply To Selected</button>
    <button type='button' class='btn btn-sm' onclick='removeModelFromSelected()'>Remove From Selected</button><br>
    <button type='button' class='btn btn-sm' onclick='unloadModel()' id='unload-model'>Unload Model</button><br>
    </div>`);
});

function addModelToScene(modelName) {
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    var parent;
    if (treeNode == false)
        parent = pcx.sceneTree;
    else
        parent = findNode(pcx, treeNode.id);
    var nodeName = $('#model-node-name').val();
    createModelEditor(modelName, nodeName, parent);
}

function loadModelFromFiles(files) {
    for (var i = 0; i < files.length; i++) {
        var duplicate = false;
        pcx.models.forEach(function(model) {
            if (model.name == files[i].name)
                duplicate = true;
        });
        if (duplicate) {
            alert('Model with that name already exists');
            continue;
        }
        (function(file){
            var reader = new FileReader();
            reader.onloadend = function () {
                var data = JSON.parse(reader.result);
                loadModel(data, file.name);
                if ($('#model-select').attr('size') < pcx.models.length)
                    $('#model-select').attr('size', pcx.models.length);
            }
            if (files[i])
                reader.readAsText(files[i]);
        })(files[i]);
    }
    // Clear the value on the file input so it can still fire onchange again
    // even if loading the same file
    if (files.length > 0)
        document.getElementById('load-model').value = '';
}

function loadModel(data, name) {
    var duplicate = false;
    pcx.models.forEach(function(existing) {
        if (existing.name == name)
            duplicate = true;
    });
    if (duplicate) {
        log('Skipped loading model "' + name + '" because a model already exists with that name', 'warning');
        return;
    }
    var model = {
        name: name,
        data: data
    }
    pcx.models.push(model);
    log('Loaded model "' + model.name + '"');
    $('#model-select').append($('<option id=' + name + '></option>').text(name));
}

function unloadModel() {
    var name = $('#model-select option:selected').text();
    if (!name) {
        alert('Select a model to unload');
        return;
    }
    for (var i = 0; i < pcx.models.length; i++) {
        if (pcx.models[i].name == name) {
            pcx.models.splice(i, 1);
            break;
        }
    }
    traverseTree(pcx, function(node) {
        if (node.model == name) {
            node.threeObject.remove(node.modelObject);
            node.model = undefined;
            node.modelObject = undefined;
        }
    });
    $('#model-select option[id="' + name + '"]').remove();
    log('Unloaded model "' + name + '"');
    viewportsNeedRender();
}

function applyModelToSelected(modelName) {
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    if (treeNode == false || treeNode.id == 0) {
        alert('Select a node to apply the model to. Cannot use root node.');
        return;
    }
    var model = getModel(pcx, modelName);
    if (!model) {
        alert('Select a model from the list of loaded models');
        return;
    };
    var node = findNode(pcx, treeNode.id);
    var visibility = undefined;
    if (node.model) {
        visibility = node.modelObject.vis;
        node.threeObject.remove(node.modelObject);
    }
    if (node.shape) {
        node.threeObject.remove(node.shapeObject);
        node.shape = undefined;
        node.shapeObject = undefined;
    }
    
    node.model = modelName;
    var linesObject = createModelGeometry(pcx, model.data, modelName);
    node.threeObject.add(linesObject);
    node.modelObject = linesObject;
    if (visibility !== undefined)
        node.modelObject.vis = visibility;
    else
        node.modelObject.vis = true;
    updateProperties();
    viewportsNeedRender();
}

function removeModelFromSelected() {
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    if (treeNode == false || treeNode.id == 0) {
        alert('Select a node to remove the model from.');
        return;
    }
    var node = findNode(pcx, treeNode.id);
    if (node.model) {
        node.threeObject.remove(node.modelObject);
        node.modelObject = undefined;
        node.model = undefined;
    }
    else {
        alert('The node does not have a model');
    }
    updateProperties();
    viewportsNeedRender();
}
