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
        <label for='line-color'>Line Color: </label>
        <input type='text' name='line-color' id='line-color'><br>
        <label for='bg-color'>Background Color: </label>
        <input type='text' name='bg-color' id='bg-color'><br>
        <button type='button' class='btn btn-sm' onclick='applySettings()'>Apply</button>
    </div>`);
});

function applySettings() {
    var length = parseInt($('#length').val());
    if (length < 1) {
        alert('Length cannot be less than 1');
        loadSettingsEditor(settings);
        return;
    }
    var framerate = parseInt($('#framerate').val());
    if (framerate < 1) {
        alert('Framerate cannot be less than 1');
        loadSettingsEditor(settings);
        return;
    }
    if (framerate > 60) {
        alert('Framerate cannot be greater than 60');
        loadSettingsEditor(settings);
        return;
    }
    var aspectRatio = $('#aspect-ratio').val();
    var ar = getAspectRatio(aspectRatio);
    if (isNaN(ar)) {
        alert('Aspect ratio must be in the form "width:height", such as "16:9" or "4:3"');
        loadSettingsEditor(settings);
        return;
    }
    var lineColor = parseInt($('#line-color').val());
    var bgColor = parseInt($('#bg-color').val());
    var newSettings = {
        length: length,
        framerate: framerate,
        aspectRatio: aspectRatio,
        autoplay: $('#autoplay').prop('checked'),
        loop: $('#loop').prop('checked'),
        lineColor: lineColor,
        bgColor: bgColor
    };
    loadSettingsEditor(newSettings);
}