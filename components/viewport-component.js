layout.registerComponent( 'viewportComponent', function(container, componentState){
    var renderer = new THREE.WebGLRenderer({antialaias: true});
    var name = 'viewport' + componentState.viewportId;
    var div = $('<div class="viewport" id="' + name + '" viewportId=' + componentState.viewportId + '></div>');
    container.on('tab', function() {
        updateViewport(div, renderer, componentState.viewportId);
    });
    container.on('resize', function() {
        updateViewport(div, renderer, componentState.viewportId);
    });
    container.on('destroy', function() {
        for (var i = 0; i < viewports.length; i++) {
            if (viewports[i].viewportId == componentState.viewportId) {
                viewports[i].div.remove();
                viewports.splice(i, 1);
                break;
            }
        }
    })
    div.mousedown(function(event) {
        
    });
    div.mouseup(function(event) {

    });
    div.mousemove(function(event) {

    });
    div.bind('mousewheel', function(event) {
        var viewportId = parseInt(event.currentTarget.getAttribute('viewportId'));
        viewports[viewportId]
    });
    div.append(renderer.domElement);
    // Disable right click context menu
    renderer.domElement.addEventListener('contextmenu', event => event.preventDefault());

    container.getElement().append(div);
    viewports.push({
        renderer: renderer,
        viewportId: componentState.viewportId,
        camera: null,
        div: div[0]
    });
});

function updateViewport(div, renderer, id) {
    var scale = 10;
    var width = div.innerWidth() - 2; // -2 from 1px border
    var height = div.innerHeight() - 2;
    if (width < 0 || height < 0)
        return;
    renderer.setSize(width, height);
    var camera = new THREE.OrthographicCamera(
        -width / scale, width / scale,
        -height / scale, height / scale,
        0, 1000
    );
    for (var i = 0; i < viewports.length; i++) {
        if (viewports[i].viewportId == id)
            viewports[i].camera = camera;
    }
}
