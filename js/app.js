const params = {
    exposure: 0.5
};
let renderer, scene;
let camera,plane,mesh,xsize ,ysize,aspect;

init();

function init() {
    xsize = window.innerWidth;
    ysize = window.innerHeight;
    aspect =xsize/ysize;
    //renderder
    
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    document.body.appendChild( renderer.domElement );
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = params.exposure;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.antialias = true;
    renderer.setSize(xsize, ysize);
    //scene
    scene = new THREE.Scene();
    //camera
    camera = new THREE.OrthographicCamera( - aspect, aspect, 1, - 1, 0, 1 );
    //plane
    plane = new THREE.PlaneGeometry(2*xsize /ysize, 2);
    const material = new THREE.MeshBasicMaterial( {color: new THREE.Color('#ffffff')} );
    mesh = new THREE.Mesh( plane, material );
    scene.add( mesh );
    //render
    render();
    //gui
    gui(); 
    //listener
    initDragAndDrop();
    //window.addEventListener( 'resize', onWindowResize );  
}
function gui(){
    const gui = new dat.GUI();
    const uiCallbacks = {
        Download: () =>{
            renderer.render(scene,camera);
            let save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
            save_link.href = renderer.domElement.toDataURL("image/jpg" );
            save_link.download = 'download';
            let event = document.createEvent('MouseEvents');
            event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            save_link.dispatchEvent(event);
        }
    };
    gui.add( params, 'exposure', 0, 10, 0.01 ).onChange( render )
    gui.add(uiCallbacks,'Download');
}
function onWindowResize() {
    camera.updateProjectionMatrix();
    renderer.setSize( xsize ,ysize );
    render();
}
function render() {

    renderer.toneMappingExposure = params.exposure;

    renderer.render( scene, camera );

}
function updateHDR( texture ) {

    mesh.material.map = texture;

    texture.needsUpdate = true;

    mesh.material.needsUpdate = true;

    render();

}
function handleHDR( event ) {

    const contents = event.target.result;

    const loader = new THREE.RGBELoader();

    loader.setDataType( THREE.UnsignedByteType ); // default: FloatType

    const texData = loader.parse( contents );

    const texture = new THREE.DataTexture();

    texture.image.width = texData.width;
    texture.image.height = texData.height;
    texture.image.data = texData.data;

    texture.format = texData.format;
    texture.type = texData.type;

    switch ( texture.type ) {

        case THREE.UnsignedByteType:

            texture.encoding = THREE.RGBEEncoding;
            texture.minFilter = THREE.NearestFilter;
            texture.magFilter = THREE.NearestFilter;
            texture.generateMipmaps = false;
            texture.flipY = true;
            break;

        case THREE.FloatType:
        case THREE.HalfFloatType:

            texture.encoding = THREE.LinearEncoding;
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = false;
            texture.flipY = true;
            break;

    }
    plane.size = new THREE.Vector3(2*texture.image.width / texture.image.height,2,1);
    renderer.setSize(texture.image.width , texture.image.height);
    console.log(plane.size);
    updateHDR( texture );

}

function loadFile( file ) {

    const filename = file.name;
    const extension = filename.split( '.' ).pop().toLowerCase();

    if ( extension === 'hdr' ) {

        const reader = new FileReader();

        reader.addEventListener( 'load', function ( event ) {

            handleHDR( event );

        } );

        reader.readAsArrayBuffer( file );

    } else { 
        alert("暂时只支持HDR")
    }

}

function initDragAndDrop() {

    document.addEventListener( 'dragover', function ( event ) {

        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';

    } );

    document.addEventListener( 'drop', function ( event ) {

        event.preventDefault();

        loadFile( event.dataTransfer.files[ 0 ] );

    } );

}
