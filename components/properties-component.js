layout.registerComponent( 'propertiesComponent', function(container, componentState){
    container.getElement().html(
    `<div class="properties" id="properties">
        <p>Position</p>
        <label for='x-pos'>X:</label>
        <input type='number' name='x-pos' id='x-pos'><br>
        <label for='y-pos'>Y:</label>
        <input type='number' name='y-pos' id='y-pos'><br>
        <label for='z-pos'>Z:</label>
        <input type='number' name='z-pos' id='z-pos'><br>
        <p>Rotation</p>
        <label for='x-rot'>X:</label>
        <input type='number' name='x-rot' id='x-rot'><br>
        <label for='y-rot'>Y:</label>
        <input type='number' name='y-rot' id='y-rot'><br>
        <label for='z-rot'>Z:</label>
        <input type='number' name='z-rot' id='z-rot'><br>
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
    $('#x-rot').val(node.threeObject.rotation.x.toFixed(4));
    $('#y-rot').val(node.threeObject.rotation.y.toFixed(4));
    $('#z-rot').val(node.threeObject.rotation.z.toFixed(4));
}
