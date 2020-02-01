layout.registerComponent( 'fileComponent', function(container, componentState){
    container.getElement().html(
    `<div class='file-menu' id='file-menu'>
        <button type='button' class='btn btn-sm'>
            <label for='load-file' class='btn btn-sm'>Load Project
            </label>
            <input type='file' multiple='false' onchange='loadFile(this.files)' id='load-file'/>
        </button>
        <button type='button' class='btn btn-sm'>
            <label for='save-file' class='btn btn-sm'>Save Project
            </label>
            <input type='file' multiple='false' onchange='saveFile(this.files)' id='save-file'/>
        </button><br>
        <button type='button' class='btn btn-sm' onclick='addViewport()'>Add Viewport</button>
    </div>`);
});

