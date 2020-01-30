layout.registerComponent( 'settingsComponent', function(container, componentState){
    container.getElement().html(
    `<div class='settings' id='settings'>
        <label for='length'>Length (frames): </label>
        <input type='number' name='length' id='length'><br>
        <label for='framerate'>Framerate: </label>
        <input type='number' name='framerate' id='framerate'><br>
        <button type='button' class='btn btn-sm' onclick='applySettings()'>Apply</button>
    </div>`);
});

function applySettings() {
    var length = parseInt($('#length').val());
    var framerate = parseInt($('#framerate').val());
    var newSettings = {
        length: length,
        framerate: framerate
    };
    loadSettings(newSettings);
}