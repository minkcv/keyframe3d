layout.registerComponent( 'modelComponent', function(container, componentState){
    container.getElement().html(
    `<div class='models' id='models'>
    <div class="input-group">
        <div class="custom-file">
            <input type="file" class="custom-file-input" id="load-model" multiple='true' onchange='loadModel(this.files)'>
            <label class="custom-file-label" for="load-model">Load Model</label>
        </div>
    </div>
    
    <select class='model-select' id='model-select' size='10'>
    </select><br>
    <button type='button' class='btn btn-sm' onclick='addModelToScene($("#model-select option:selected").text())'>Add To Scene</button>
    <input type='text' id='model-node-name' placeholder='name'></input><br>
    <button type='button' class='btn btn-sm' onclick='unloadModel()' id='unload-model'>Unload Model</button><br>
    </div>`);
});

