layout.registerComponent('welcomeComponent', function(container, componentState){
    container.getElement().html(`
    <div id='welcome'>
        <h1>Keyframe3D</h1>
        <p>
            Keyframe3D is a web application for creating 3D animations with wireframe graphics. <br>
            Documentation is available in the  <a href='https://github.com/minkcv/keyframe3d/docs' target="_blank">/docs</a> folder in the repo. <br>
            Sample projects are avilable in the <a href='https://github.com/minkcv/keyframe3d/tree/master/demos' target="_blank">/demos</a> folder in the repo. <br>
            Sample projects can be viewed at <a href='https://minkcv.github.io/keyframe3d/demos/' target="_blank">https://minkcv.github.io/keyframe3d/demos/</a>. <br>
            Models are created with the application <a href='https://minkcv.github.io/line3d' target="_blank">Line3D</a>. <br>
        </p>
        <a href='https://github.com/minkcv/keyframe3d' target="_blank">Keyframe3D repo</a>
        <br>
        <a href='https://github.com/minkcv/line3d' target="_blank">Line3D repo</a>
        <br><br>
        <label for='show-welcome'>Show this welcome message every time</label>
        <input type='checkbox' name='show-welcome' id='show-welcome' onclick='showWelcomeChange(this)'>
    </div>
    `);
    container.on('tab', function() {
        var show = window.localStorage.getItem('show-welcome');
        if (show != 'false')
            $('#show-welcome').prop('checked', true);
    });
});

function showWelcomeChange(event) {
    window.localStorage.setItem('show-welcome', event.checked.toString());
}