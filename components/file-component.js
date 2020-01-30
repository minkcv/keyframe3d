layout.registerComponent( 'fileComponent', function(container, componentState){
    container.getElement().html(
    `<div class='file-menu' id='file-menu'>
        <button type='button' class='btn btn-sm'>
            <label for='load-file' class='btn btn-sm'>Load File
            </label>
            <input type='file' multiple='false' onchange='loadFile(this.files)' id='load-file'/>
        </button><br>
        <button type='button' class='btn btn-sm' onclick='addViewport()'>Add Viewport</button>
    </div>`);
});

