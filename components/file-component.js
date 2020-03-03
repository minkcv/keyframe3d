layout.registerComponent( 'fileComponent', function(container, componentState){
    container.getElement().html(
    `<div class='file-menu' id='file-menu'>
        <div class="input-group mb-3">
            <div class="custom-file">
                <input type="file" class="custom-file-input" id="load-project" multiple='false' onchange='loadProject(this.files)'>
                <label class="custom-file-label" for="load-project">Load Project</label>
            </div>
        </div>
        <button type='button' class='btn btn-sm' onclick='saveProject()'>Save Project</button><br>
        <button type='button' class='btn btn-sm' onclick='openViewport()'>Open Viewport</button>
        <button type='button' class='btn btn-sm' onclick='openWelcome()'>Open Welcome Screen</button>
    </div>`);
});

function saveProject() {
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
    var project = {
        settings: pcx.settings,
        keyframes: pcx.keyframes,
        models: pcx.models,
        shapes: pcx.shapes,
        sceneTree: nodeNoThree,
    };
    var blob = new Blob([JSON.stringify(project)], {type: 'text/plain' });
    var anchor = document.createElement('a');
    anchor.download = 'project.json';
    anchor.href = (window.URL || window.URL).createObjectURL(blob);
    anchor.dataset.downloadurl = ['text/plain', anchor.download, anchor.href].join(':');;
    anchor.click();
}

function loadProject(files) {
    var file = files[0];
    var reader = new FileReader();
    reader.onloadend = function () {
        var project = JSON.parse(reader.result);
        log('--- Loading project "' + file.name + '" ---');
        loadSettingsEditor(project.settings);
        pcx.models = [];
        $('#model-select').html('');
        project.models.forEach(function(model) {
            loadModel(model.data, model.name);
        });
        pcx.shapes = [];
        $('#shape-select').html('');
        project.shapes.forEach(function(shape) {
            loadShape(shape.data, shape.name);
        });
        // Clear the scene tree. Root node stays
        pcx.sceneTree.children = [];
        while(pcx.sceneTree.threeObject.children.length > 0)
        pcx.sceneTree.threeObject.remove(pcx.sceneTree.threeObject.children[0]);

        traverseTree(pcx, function (loadNode) {
            if (loadNode.id == 0) {
                return;
            }
            else {
                var parentProject = getParentNode(pcx, loadNode, project.sceneTree);
                var parent = findNode(pcx, parentProject.id);
                if (loadNode.model !== undefined) {
                    createModelEditor(loadNode.model, loadNode.name, parent, loadNode.id);
                }
                else if (loadNode.cameraId !== undefined) {
                    createCameraEditor(loadNode.name, parent, loadNode.id, loadNode.cameraId, loadNode.cameraFov);
                }
                else if (loadNode.shape !== undefined) {
                    createShapeEditor(loadNode.shape, loadNode.name, parent, loadNode.id);
                }
                else {
                    createEmptyNodeEditor(loadNode.name, parent, loadNode.id);
                }
            }
        }, project.sceneTree);
        pcx.keyframes = project.keyframes;
        updateTree();
        updateTimeline();
        seekTime(0);
    };
    reader.readAsText(file);
}

function openWelcome() {
    var welcomeConfig = {
        type: 'component',
        componentName: 'welcomeComponent',
        componentState: {},
        isClosable: true,
        title: 'Welcome to Keyframe3D'
    };
    layout.root.contentItems[0].contentItems[1].contentItems[0].addChild(welcomeConfig, 0);
}
