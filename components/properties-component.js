layout.registerComponent( 'propertiesComponent', function(container, componentState){
    container.getElement().html(
    `<div class="properties" id="properties">
        <button class='accordion'>Position</button>
        <div class='panel'>
            <label for='x-pos'>X:</label>
            <input type='number' name='x-pos' id='x-pos' oninput='changeProperties()'><br>
            <label for='y-pos'>Y:</label>
            <input type='number' name='y-pos' id='y-pos' oninput='changeProperties()'><br>
            <label for='z-pos'>Z:</label>
            <input type='number' name='z-pos' id='z-pos' oninput='changeProperties()'><br>
        </div>
        <button class='accordion'>Rotation</button>
        <div class='panel'>
            <label for='x-rot'>X:</label>
            <input type='number' name='x-rot' id='x-rot' oninput='changeProperties()'><br>
            <label for='y-rot'>Y:</label>
            <input type='number' name='y-rot' id='y-rot' oninput='changeProperties()'><br>
            <label for='z-rot'>Z:</label>
            <input type='number' name='z-rot' id='z-rot' oninput='changeProperties()'><br>
        </div>
        <button class='accordion'>Scale</button>
        <div class='panel'>
            <label for='x-scale'>X:</label>
            <input type='number' name='x-scale' id='x-scale' oninput='changeProperties()'><br>
            <label for='y-scale'>Y:</label>
            <input type='number' name='y-scale' id='y-scale' oninput='changeProperties()'><br>
            <label for='z-scale'>Z:</label>
            <input type='number' name='z-scale' id='z-scale' oninput='changeProperties()'><br>
        </div>
        <div id='visibility'>
            <label for='visible'>Visible: </label>
            <input type='checkbox' name='visible' id='visible' oninput='changeProperties()'>
        </div>
        <div id='camera-properties'>
            <hr>
            <p>Camera</p>
            <label for='fov'>FOV (degrees):</label>
            <input type='number' name='fov' id='fov' oninput='changeProperties()'><br>
        </div>
    </div>`);
});

function updateProperties() {
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    if (treeNode == false)
        return;
    var node = findNode(pcx, treeNode.id);
    if (node == null)
        return;
    $('#x-pos').val(node.threeObject.position.x.toFixed(precision));
    $('#y-pos').val(node.threeObject.position.y.toFixed(precision));
    $('#z-pos').val(node.threeObject.position.z.toFixed(precision));
    $('#x-rot').val((node.threeObject.rotation.x * 180 / Math.PI).toFixed(precision));
    $('#y-rot').val((node.threeObject.rotation.y * 180 / Math.PI).toFixed(precision));
    $('#z-rot').val((node.threeObject.rotation.z * 180 / Math.PI).toFixed(precision));
    $('#x-scale').val(node.threeObject.scale.x.toFixed(precision));
    $('#y-scale').val(node.threeObject.scale.y.toFixed(precision));
    $('#z-scale').val(node.threeObject.scale.z.toFixed(precision));
    $('#visibility').hide();
    var vis = null;
    node.threeObject.children.forEach(function(child) {
        if (child.model) {
            $('#visibility').show();
            vis = child.vis;
        } 
    });
    if (vis === undefined)
        vis = true;
    $('#visible').prop('checked', vis);

    if (node.cameraId !== undefined) {
        $('#fov').val(node.cameraFov);
        $('#camera-properties').show();
    }
    else
        $('#camera-properties').hide();
}

function changeProperties() {
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    if (treeNode == false)
        return;
    if (treeNode.id == 0) {
        alert('Cannot transform the root node');
        updateProperties();
        return;
    }
    var node = findNode(pcx, treeNode.id);
    node.threeObject.position.x = parseFloat($('#x-pos').val());
    node.threeObject.position.y = parseFloat($('#y-pos').val());
    node.threeObject.position.z = parseFloat($('#z-pos').val());
    node.threeObject.rotation.x = parseFloat($('#x-rot').val() * Math.PI / 180);
    node.threeObject.rotation.y = parseFloat($('#y-rot').val() * Math.PI / 180);
    node.threeObject.rotation.z = parseFloat($('#z-rot').val() * Math.PI / 180);
    node.threeObject.scale.x = parseFloat($('#x-scale').val());
    node.threeObject.scale.y = parseFloat($('#y-scale').val());
    node.threeObject.scale.z = parseFloat($('#z-scale').val());
    node.threeObject.children.forEach(function(child) {
        if (child.model) {
            if ($('#visible').prop('checked')) {
                child.vis = true;
            }
            else {
                child.vis = false;
            }
        }
    });
    if (node.cameraId !== undefined) {
        node.cameraFov = parseFloat($('#fov').val());
        node.cameraObject.fov = node.cameraFov;
        node.cameraObject.updateProjectionMatrix();
    }
    viewportsNeedRender();
}
