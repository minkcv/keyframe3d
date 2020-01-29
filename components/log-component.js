function log(message, type) {
    type = type || 'info';
    var logDiv = $('#log');
    var timeStamp = (new Date().getHours() < 9 ? '0' : '') + new Date().getHours() + ':' + (new Date().getMinutes() < 9 ? '0' : '') + new Date().getMinutes();
    var pre = $('<pre class=' + type + '></pre>').text('[' + timeStamp + '] ' + message);
    logDiv.append(pre);
    logDiv[0].scrollTop = logDiv[0].scrollHeight;
}

layout.registerComponent( 'logComponent', function(container, componentState){
    container.getElement().html('<div class="log" id="log"></div>');
});

