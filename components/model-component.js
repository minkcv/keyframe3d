layout.registerComponent( 'modelComponent', function(container, componentState){
    container.getElement().html(
    `<div class='models' id='models'>
    <button type='button' class='btn btn-sm'>
        <label for='load-model' class='btn btn-sm'>Load Model(s)
        </label>
        <input type='file' multiple='true' onchange='loadModel(this.files)' id='load-model'/>
    </button>
    <button type='button' class='btn btn-sm' onclick='unloadModel()' id='unload-model'>Unload Model</button><br>
    <select class='model-select' id='model-select' size='10'>
    </select><br>
    <button type='button' class='btn btn-sm' onclick='addModelToScene($("#model-select option:selected").text())'>Add To Scene</button>
    <input type='text' id='model-node-name' placeholder='name'></input>
    </div>`);
});

