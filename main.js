layout.init();

var settings = {
    length: 36000,
    framerate: 60
};

function loadSettings(newSettings) {
    settings = newSettings;
    var options = timeline.options;
    options.max = new Date(settings.length);
    timeline.setOptions(options);
    $('#length').val(settings.length);
    $('#framerate').val(settings.framerate);
}

$(function() {
    loadSettings(settings);
});