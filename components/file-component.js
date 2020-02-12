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
        <button type='button' class='btn btn-sm' onclick='addViewport()'>Add Viewport</button>
    </div>`);
});

function saveProject() {
    var nodeNoThree = {
        id: 0, 
        name: 'root', 
        children: []
    };
    traverseTree(function(node) {
        var copy = {
            id: node.id,
            name: node.name,
            children: []
        };
        if (node.model !== undefined)
            copy.model = node.model;
        if (node.cameraId !== undefined)
            copy.cameraId = node.cameraId;
        var parent = getParentNode(node);
        if (parent != null) {
            // Search our copy tree for the parent
            var copyParent = findNode(parent.id, nodeNoThree);
            if (copyParent != null)
                copyParent.children.push(copy);
        }
    });
    var project = {
        settings: settings,
        keyframes: keyframes,
        models: models,
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
        loadSettings(project.settings);
        models = [];
        $('#model-select').html('');
        project.models.forEach(function(model) {
            loadModel(model.data, model.name);
        });
        // Clear the scene tree. Root node stays
        sceneTree.children = [];
        while(sceneTree.threeObject.children.length > 0)
            sceneTree.threeObject.remove(sceneTree.threeObject.children[0]);

        traverseTree(function (loadNode) {
            if (loadNode.id == 0) {
                return;
            }
            else if (loadNode.model !== undefined) {
                var parentProject = getParentNode(loadNode, project.sceneTree);
                var parent = findNode(parentProject.id);
                createModel(loadNode.model, loadNode.name, parent, loadNode.id);
            }
            else if (loadNode.cameraId !== undefined) {
                var parentProject = getParentNode(loadNode, project.sceneTree);
                var parent = findNode(parentProject.id);
                createCamera(loadNode.name, parent, loadNode.id, loadNode.cameraId, loadNode.cameraFov);
            }
            else {
                var parentProject = getParentNode(loadNode, project.sceneTree);
                var parent = findNode(parentProject.id);
                createEmptyNode(loadNode.name, parent, loadNode.id);
            }
        }, project.sceneTree);
        keyframes = project.keyframes;
        updateTree();
        updateTimeline();
        seekTime(0);
    };
    reader.readAsText(file);
}
