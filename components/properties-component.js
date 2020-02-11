layout.registerComponent( 'propertiesComponent', function(container, componentState){
    container.getElement().html(
    `<div class="properties" id="properties">
        <p>Position</p>
        <label for='x-pos'>X:</label>
        <input type='number' name='x-pos' id='x-pos' onchange='changeProperties()'><br>
        <label for='y-pos'>Y:</label>
        <input type='number' name='y-pos' id='y-pos' onchange='changeProperties()'><br>
        <label for='z-pos'>Z:</label>
        <input type='number' name='z-pos' id='z-pos' onchange='changeProperties()'><br>
        <p>Rotation (degrees)</p>
        <label for='x-rot'>X:</label>
        <input type='number' name='x-rot' id='x-rot' onchange='changeProperties()'><br>
        <label for='y-rot'>Y:</label>
        <input type='number' name='y-rot' id='y-rot' onchange='changeProperties()'><br>
        <label for='z-rot'>Z:</label>
        <input type='number' name='z-rot' id='z-rot' onchange='changeProperties()'><br>
    </div>`);
});

function updateProperties() {
    var treeNode = $('#scene-tree').tree('getSelectedNode');
    if (treeNode == false)
        return;
    var node = findNode(treeNode.id);
    $('#x-pos').val(node.threeObject.position.x.toFixed(4));
    $('#y-pos').val(node.threeObject.position.y.toFixed(4));
    $('#z-pos').val(node.threeObject.position.z.toFixed(4));
    $('#x-rot').val((node.threeObject.rotation.x * 180 / Math.PI).toFixed(4));
    $('#y-rot').val((node.threeObject.rotation.y * 180 / Math.PI).toFixed(4));
    $('#z-rot').val((node.threeObject.rotation.z * 180 / Math.PI).toFixed(4));
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
    var node = findNode(treeNode.id);
    node.threeObject.position.x = parseFloat($('#x-pos').val());
    node.threeObject.position.y = parseFloat($('#y-pos').val());
    node.threeObject.position.z = parseFloat($('#z-pos').val());
    node.threeObject.rotation.x = parseFloat($('#x-rot').val() * Math.PI / 180);
    node.threeObject.rotation.y = parseFloat($('#y-rot').val() * Math.PI / 180);
    node.threeObject.rotation.z = parseFloat($('#z-rot').val() * Math.PI / 180);
}
