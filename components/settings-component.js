layout.registerComponent( 'settingsComponent', function(container, componentState){
    container.getElement().html(
    `<div class='settings' id='settings'>
        <label for='length'>Length (frames): </label>
        <input type='number' name='length' id='length'><br>
        <label for='framerate'>Framerate: </label>
        <input type='number' name='framerate' id='framerate'><br>
        <label for='aspect-ratio'>Aspect Ratio: </label>
        <input type='text' name='aspect-ratio' id='aspect-ratio'><br>
        <label for='autoplay'>Autoplay: </label>
        <input type='checkbox' name='autoplay' id='autoplay'><br>
        <label for='loop'>Loop: </label>
        <input type='checkbox' name='loop' id='loop'><br>
        <button type='button' class='btn btn-sm' onclick='applySettings()'>Apply</button>
    </div>`);
});

function applySettings() {
    var length = parseInt($('#length').val());
    var framerate = parseInt($('#framerate').val());
    var aspectRatio = $('#aspect-ratio').val();
    var newSettings = {
        length: length,
        framerate: framerate,
        aspectRatio: aspectRatio,
        autoplay: $('#autoplay').prop('checked'),
        loop: $('#loop').prop('checked')
    };
    loadSettings(newSettings);
    for (var i = 0; i < viewports.length; i++) {
        updateViewport(i);
    }
}