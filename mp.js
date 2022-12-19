import * as THREE from 'https://unpkg.com/three@0.126.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.126.0/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'https://unpkg.com/three@0.126.0/examples/jsm/loaders/RGBELoader.js';
import { GLTFLoader } from "https://unpkg.com/three@0.126.0/examples/jsm/loaders/GLTFLoader.js";
import { GLTFExporter } from 'https://unpkg.com/three@0.126.0/examples/jsm/exporters/GLTFExporter.js';
import { HorizontalBlurShader } from 'https://unpkg.com/three@0.126.0/examples/jsm/shaders/HorizontalBlurShader.js';
import { VerticalBlurShader } from 'https://unpkg.com/three@0.126.0/examples/jsm/shaders/VerticalBlurShader.js';



const loadingManager = new THREE.LoadingManager(() => {

    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.classList.add('fade-out');

    // optional: remove loader from DOM via event listener
    loadingScreen.addEventListener('transitionend', onTransitionEnd);

});


let scene, renderer, hemiLight, height, width, aspect, light, light2, light3, envMap, camera, camera2, camera3, activeCamera;
let rotate = -Math.PI / 2;

let magazineC = new THREE.Object3D();
let paperc, cover_frontc, cover_backc, spinec;

let hardcoverBook = new THREE.Object3D();
let paperHardcover, cover_frontHardcover, cover_backHardcover, spineHardcover, innerCover, innerSpine, endbandHardcover, endbandHardcover2;

let loader = new GLTFLoader(loadingManager);
let loader2 = new GLTFLoader();
const gltfExporter = new GLTFExporter();

let hardcoverCounter = false;
let customCounter = false;
let userImageSpine, ThreeCanvas, loadBackColor;
let rotateChecker = true;
let isUp = false;
let HDRMap = true;
let ToneMappingValue = "aces";




//shadows

const PLANE_WIDTH = 1;
const PLANE_HEIGHT = 1;
const CAMERA_HEIGHT = 0.2;


const state = {
    shadow: {
        blur: 1,
        darkness: 0.5,
        opacity: 0.5,
    },
    plane: {
        color: '#ffffff',
        opacity: 0,
    },
    showWireframe: false,
};

let shadowGroup, renderTarget, renderTargetBlur, shadowCamera, cameraHelper, depthMaterial, horizontalBlurMaterial, verticalBlurMaterial;
let plane, blurPlane, fillPlane;




init();
render();



function init() {
    //BASIC THREE SETUP

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.02, 1000);
    renderer = new THREE.WebGLRenderer({ alpha: true, preserveDrawingBuffer: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.physicallyCorrectLights = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
    //renderer.shadowMap.enabled = true;
    renderer.gammaFactor = 2.2;
    renderer.outputEncoding = THREE.sRGBEncoding;

    let path = "assets/images/hdr/";
    //Load HDRI map
    new RGBELoader()
        .setDataType(THREE.UnsignedByteType)
        .setPath(path)
        .load("studio5.hdr", function (texture) {
            envMap = pmremGenerator.fromEquirectangular(texture).texture;
            //scene.background = envMap;
            scene.environment = envMap;

            texture.dispose();
            pmremGenerator.dispose();
        })
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();


    camera2 = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.02, 1000);
    camera3 = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.02, 1000);
    activeCamera = camera;

    camera.position.x = -0.358;
    camera.position.y = 0.408;
    camera.position.z = -0.665;

    camera.rotation.x = -2.59084654363697;
    camera.rotation.y = -0.430508160861003;
    camera.rotation.z = -2.890695825753503;

    camera2.position.x = 0.7;
    camera2.position.y = 0.5;
    camera2.position.z = -0.05;

    camera3.position.x = 0;
    camera3.position.y = 0.5;
    camera3.position.z = 0.05;

    scene.add(camera, camera2, camera3);

    //Orbit Controls
    let controls = new OrbitControls(camera, renderer.domElement);
    controls.screenSpacePanning = true;
    controls.panSpeed = 0.2;
    controls.minDistance = 0.6;
    controls.maxDistance = 2.5;
    controls.maxPolarAngle = 2;
    controls.enabled = true;

    let controls2 = new OrbitControls(camera2, renderer.domElement);
    controls2.screenSpacePanning = true;
    controls2.panSpeed = 0.2;
    controls2.minDistance = 0.6;
    controls2.maxDistance = 2.5;
    controls2.maxPolarAngle = 2;
    controls2.enabled = false;

    let controls3 = new OrbitControls(camera3, renderer.domElement);
    controls3.screenSpacePanning = true;
    controls3.panSpeed = 0.2;
    controls3.minDistance = 0.6;
    controls3.maxDistance = 2.5;
    controls3.maxPolarAngle = 2;
    controls3.enabled = false;

    let camera_locked = false;
    $(document).ready(function () {
        $(".lock1_checkbox").click(function () {
            if ($(this).prop("checked") == true) {
                controls.enabled = false;
                camera_locked = true;
            }
            else if ($(this).prop("checked") == false) {
                controls.enabled = true;
                camera_locked = false;
            }
        });
    });

    let camera2_locked = false;
    $(document).ready(function () {
        $(".lock2_checkbox").click(function () {
            if ($(this).prop("checked") == true) {
                controls2.enabled = false;
                camera2_locked = true;
            }
            else if ($(this).prop("checked") == false) {
                controls2.enabled = true;
                camera2_locked = false;
            }
        });
    });

    let camera3_locked = false;
    $(document).ready(function () {
        $(".lock3_checkbox").click(function () {
            if ($(this).prop("checked") == true) {
                controls3.enabled = false;
                camera3_locked = true;
            }
            else if ($(this).prop("checked") == false) {
                controls3.enabled = true;
                camera3_locked = false;
            }
        });
    });

    $("#camera1").click(function () {
        activeCamera = camera;
        if (camera_locked) { controls.enabled = false; } else { controls.enabled = true; }
        controls2.enabled = false;
        controls3.enabled = false;
        activeCamera.updateProjectionMatrix();
        document.getElementById("active").innerHTML = "CAMERA 1";
    })

    $("#camera2").click(function () {
        activeCamera = camera2;
        if (camera2_locked) { controls2.enabled = false; } else { controls2.enabled = true; }
        controls.enabled = false;
        controls3.enabled = false;
        activeCamera.updateProjectionMatrix();
        document.getElementById("active").innerHTML = "CAMERA 2";
    })

    $("#camera3").click(function () {
        activeCamera = camera3;
        if (camera3_locked) { controls3.enabled = false; } else { controls3.enabled = true; }
        controls.enabled = false;
        controls2.enabled = false;
        activeCamera.updateProjectionMatrix();
        document.getElementById("active").innerHTML = "CAMERA 3";
    })

    //Light1
    light = new THREE.DirectionalLight(0xffffff, 0);
    light.position.x = 5;
    light.position.y = 10;
    light.position.z = -20;

    //Light2
    light2 = new THREE.DirectionalLight(0xffffff, 0);
    light2.position.x = 20;
    light2.position.y = 10;
    light2.position.z = 20;

    //Light3
    light3 = new THREE.DirectionalLight(0xffffff, 0.4);
    light3.position.x = -20;
    light3.position.y = 10;
    light3.position.z = -10;

    const helper = new THREE.DirectionalLightHelper(light, 1, 0xf27d0c);
    const helper2 = new THREE.DirectionalLightHelper(light2, 1, 0xf27d0c);
    const helper3 = new THREE.DirectionalLightHelper(light3, 1, 0xf27d0c);
    //scene.add(helper, helper2, helper3);

    scene.add(light, light2, light3);

    hemiLight = new THREE.AmbientLight(0x404040, 20);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);


    //shadows try 2

    // Contact shadows GROUND
    // the container, if you need to move the plane just move this
    shadowGroup = new THREE.Group();
    shadowGroup.position.y = - 0.015;
    scene.add(shadowGroup);

    // the render target that will show the shadows in the plane texture
    renderTarget = new THREE.WebGLRenderTarget(512, 512);
    renderTarget.texture.generateMipmaps = false;

    // the render target that we will use to blur the first render target
    renderTargetBlur = new THREE.WebGLRenderTarget(512, 512);
    renderTargetBlur.texture.generateMipmaps = false;


    // make a plane and make it face up
    const planeGeometry = new THREE.PlaneBufferGeometry(PLANE_WIDTH, PLANE_HEIGHT).rotateX(Math.PI / 2)
    const planeMaterial = new THREE.MeshBasicMaterial({
        map: renderTarget.texture,
        opacity: state.shadow.opacity,
        transparent: true,
        depthWrite: false,
    });
    plane = new THREE.Mesh(planeGeometry, planeMaterial);
    //plane.renderOrder = 1;
    shadowGroup.add(plane);

    // the y from the texture is flipped!
    plane.scale.y = -1;

    // the plane onto which to blur the texture
    blurPlane = new THREE.Mesh(planeGeometry);
    blurPlane.visible = false;
    shadowGroup.add(blurPlane);

    // the plane with the color of the ground
    const fillPlaneMaterial = new THREE.MeshBasicMaterial({
        color: state.plane.color,
        opacity: state.plane.opacity,
        transparent: true,
        depthWrite: false,
    });
    fillPlane = new THREE.Mesh(planeGeometry, fillPlaneMaterial);
    fillPlane.rotateX(Math.PI);
    /* fillPlane.position.y -= 0.00001;
    fillPlane.receiveShadow = false; */
    shadowGroup.add(fillPlane);

    // the camera to render the depth material from
    shadowCamera = new THREE.OrthographicCamera(- PLANE_WIDTH / 2, PLANE_WIDTH / 2, PLANE_HEIGHT / 2, - PLANE_HEIGHT / 2, 0, CAMERA_HEIGHT);
    shadowCamera.rotation.x = Math.PI / 2; // get the camera to look up
    shadowGroup.add(shadowCamera);

    cameraHelper = new THREE.CameraHelper(shadowCamera);

    // like MeshDepthMaterial, but goes from black to transparent
    depthMaterial = new THREE.MeshDepthMaterial();
    depthMaterial.userData.darkness = { value: state.shadow.darkness };
    depthMaterial.onBeforeCompile = function (shader) {

        shader.uniforms.darkness = depthMaterial.userData.darkness;
        shader.fragmentShader = /* glsl */`
        uniform float darkness;
        ${shader.fragmentShader.replace(
            'gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );',
            'gl_FragColor = vec4( vec3( 0.0 ), ( 1.0 - fragCoordZ ) * darkness );'
        )}
    `;

    };

    depthMaterial.depthTest = false;
    depthMaterial.depthWrite = false;

    horizontalBlurMaterial = new THREE.ShaderMaterial(HorizontalBlurShader);
    horizontalBlurMaterial.depthTest = false;

    verticalBlurMaterial = new THREE.ShaderMaterial(VerticalBlurShader);
    verticalBlurMaterial.depthTest = false;

    depthMaterial.morphTargets = true;





    // Upload and call cropper - FRONT, BACK, SPINE

    let cropper, image1;
    let CropperModal = document.getElementById('cropperModal');
    let UploadInputFront = document.getElementById('userImage');
    let UploadInputBack = document.getElementById('userImage2');
    let UploadInputSpine = document.getElementById('userImage3');
    let temp;

    [UploadInputFront, UploadInputBack, UploadInputSpine].forEach((element) => {
        element.addEventListener('change', function () {
            temp = element.id;
            console.log(temp);
            ignore: [];
            var files = this.files;
            var reader;
            var file;

            if (files.length > 0) {
                file = files[0];

                reader = new FileReader();
                reader.onload = function (event) {
                    UIkit.modal(CropperModal).show();
                    image1 = $('.image')[0];

                    image1.src = event.target.result;
                    image1.setAttribute('style', 'height:70vh;');

                };

                // FILE SIZE CHECK
                const allowedExtensions = ['jpg', 'jpeg', 'png'],
                    sizeLimit = 5000000;

                // destructuring file name and size from file object
                const { name: fileName, size: fileSize } = this.files[0];

                const fileExtension = fileName.split(".").pop();

                if (!allowedExtensions.includes(fileExtension)) {

                    alert("File type not allowed. Please use jpg or png.");
                    this.value = null;
                    return false;
                } else if (fileSize > sizeLimit) {

                    alert("File size too large")
                    this.value = null;
                    return false;
                }

                reader.readAsDataURL(file);
                [UploadInputFront][0].value = '';
                [UploadInputBack][0].value = '';
                [UploadInputSpine][0].value = '';
            }
        });
    });

    $('#cropperModal').on({

        'show.uk.modal': function () {
            console.log('Modal is visible.');
            cropper = new Cropper(image1, {
                guides: true,
                center: true,
                autoCropArea: 0.99,
                viewMode: 2,
                responsive: true,
                restore: true,

            });
        },

        'hide.uk.modal': function () {
            console.log('Element is not visible.');
            cropper.destroy();
            cropper = null;
        }
    });


    const boxSize = 1.0;
    $('.crop').on('click', function (event) {
        event.preventDefault();


        const canvas = cropper.getCroppedCanvas();
        let image = cropper.getCroppedCanvas();
        let texture = new THREE.Texture(image);
        texture.encoding = THREE.sRGBEncoding;
        height = texture.image.height;
        width = texture.image.width;
        aspect = width / height;

        if (hardcoverCounter && temp == 'userImage') {
            //clearFront();
            clearFrontHardcover()
            cover_frontHardcover.material.map = texture;
            cover_frontHardcover.material.map.flipY = false;
            hardcoverBook.scale.set(boxSize * aspect, boxSize);
        }

        if (customCounter && temp == 'userImage') {
            //clearFront();
            clearFrontCustom()
            cover_frontc.material.map = texture;
            cover_frontc.material.map.flipY = false;
            magazineC.scale.set(boxSize * aspect, boxSize);
        }

        if (hardcoverCounter && temp == 'userImage2') {
            clearBackHardcover();
            cover_backHardcover.material.map = texture;
            cover_backHardcover.material.map.flipY = false;
        }

        if (customCounter && temp == 'userImage2') {
            clearBackCustom();
            cover_backc.material.map = texture;
            cover_backc.material.map.flipY = false;
        }

        if (hardcoverCounter && temp == 'userImage3') {
            spineHardcover.material.map = texture;
            cover_frontHardcover.morphTargetInfluences[0] = width * 2.54 / (96 * window.devicePixelRatio) / 10;
            spineHardcover.morphTargetInfluences[0] = width * 2.54 / (96 * window.devicePixelRatio) / 10;
            paperHardcover.morphTargetInfluences[0] = width * 2.54 / (96 * window.devicePixelRatio) / 10;
            innerCover.morphTargetInfluences[0] = width * 2.54 / (96 * window.devicePixelRatio) / 10;
            innerSpine.morphTargetInfluences[0] = width * 2.54 / (96 * window.devicePixelRatio) / 10;
            endbandHardcover.morphTargetInfluences[0] = width * 2.54 / (96 * window.devicePixelRatio) / 10;
            endbandHardcover2.morphTargetInfluences[0] = width * 2.54 / (96 * window.devicePixelRatio) / 10;
            spineHardcover.material.map.flipY = false;
            spineHardcover.material.needsUpdate = true;
            spineHardcover.material.color.set(0xffffff);
        }

        if (customCounter && temp == 'userImage3') {
            spinec.material.map = texture;
            magazineC.scale.y = width * 2.54 / (96 * window.devicePixelRatio);
            spinec.material.map.flipY = false;
            spinec.material.needsUpdate = true;
            spinec.material.color.set(0xffffff);
        }

        texture.needsUpdate = true;
        UIkit.modal(CropperModal).hide();

        var delayInMilliseconds = 500; //1 second

        setTimeout(function() {
            UIkit.offcanvas(offcanvasUsage).show();
        }, delayInMilliseconds);
    });





    //Background Color
    let backgroundColor = document.getElementById("background");
    backgroundColor.addEventListener("input", function () {
        //renderer.setClearColor( this.value);
        scene.background = new THREE.Color(this.value);
    })


    /* Toggle HDR map */
    $('#default-1').click(function () {
        if (this.checked) {
            scene.environment = envMap;
            HDRMap = true;
        } else {
            scene.environment = null;
            HDRMap = false;
        }
    });


    //document.body.appendChild(renderer.domElement);
    document.getElementById("canvas").appendChild(renderer.domElement);
    ThreeCanvas = document.getElementById("canvas");

    window.addEventListener("resize", () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        activeCamera.aspect = window.innerWidth / window.innerHeight;
        activeCamera.updateProjectionMatrix();
        camera.aspect = window.innerWidth / window.innerHeight;
        camera2.aspect = window.innerWidth / window.innerHeight;
        camera3.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        camera2.updateProjectionMatrix();
        camera3.updateProjectionMatrix();
    })


}

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = ThreeCanvas.clientWidth;
    const height = ThreeCanvas.clientHeight;
    const needResize = ThreeCanvas.width !== width || ThreeCanvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

//Set initial background color
scene.background = new THREE.Color(0xffffff);

function render() {
    requestAnimationFrame(render);

    // remove the background color temporary
    const initialBackground = scene.background;
    scene.background = null;


    // force the depthMaterial to everything
    cameraHelper.visible = false;
    scene.overrideMaterial = depthMaterial;

    // render to the render target to get the depths
    renderer.setRenderTarget(renderTarget);
    renderer.render(scene, shadowCamera);

    // and reset the override material
    scene.overrideMaterial = null;
    // cameraHelper.visible = true;
    // scene.add(cameraHelper);

    blurShadow(state.shadow.blur);

    // a second pass to reduce the artifacts
    // (0.4 is the minimum blur amout so that the artifacts are gone)
    blurShadow(state.shadow.blur * 0.8);

    if (resizeRendererToDisplaySize(renderer)) {
        const ThreeCanvas = renderer.domElement;
        activeCamera.aspect = ThreeCanvas.clientWidth / ThreeCanvas.clientHeight;
        activeCamera.updateProjectionMatrix();
    }

    // reset and render the normal scene
    renderer.setRenderTarget(null);
    scene.background = initialBackground;

    activeCamera.updateProjectionMatrix();
    renderer.render(scene, activeCamera);

}

export { activeCamera, renderer, scene, ThreeCanvas };






//Remove front cover image on Paperback
function clearFrontCustom() {
    if (customCounter) {
        cover_frontc.material.map = null;
        cover_frontc.material.needsUpdate = true;
    };
    $('#userImage').val('');
}

//Remove front cover image on Hardvocer
function clearFrontHardcover() {
    if (hardcoverCounter) {
        cover_frontHardcover.material.map = null;
        cover_frontHardcover.material.needsUpdate = true;
    };
    $('#userImage').val('');
}

//Remove back cover image on Paperback
function clearBackCustom() {
    if (customCounter) {
        cover_backc.material.map = null;
        cover_backc.material.needsUpdate = true;
    };
    $('#userImage2').val('');
}

//Remove back cover image on Hardcover
function clearBackHardcover() {
    if (hardcoverCounter) {
        cover_backHardcover.material.map = null;
        cover_backHardcover.material.needsUpdate = true;
    };
    $('#userImage2').val('');
}

//Remove spine cover image on both
function clearSpine() {
    if (customCounter) {
        spinec.material.map = null;
        spinec.material.needsUpdate = true;
    };
    if (hardcoverCounter) {
        spineHardcover.material.map = null;
        spineHardcover.material.needsUpdate = true;
    };
    $('#userImage3').val('');
}

// Controls
$("#no").click(function () {
    renderer.toneMapping = THREE.NoToneMapping;
    ToneMappingValue = "none";

    if (customCounter) {
        updateMaterialPaperback()
    }

    if (hardcoverCounter) {
        updateMaterialHardcover()
    }
})

$("#linear").click(function () {
    renderer.toneMapping = THREE.LinearToneMapping;
    ToneMappingValue = "linear";

    if (customCounter) {
        updateMaterialPaperback()
    }

    if (hardcoverCounter) {
        updateMaterialHardcover()
    }
})

$("#cineon").click(function () {
    renderer.toneMapping = THREE.CineonToneMapping;
    ToneMappingValue = "cineon";

    if (customCounter) {
        updateMaterialPaperback()
    }

    if (hardcoverCounter) {
        updateMaterialHardcover()
    }
})

$("#aces").click(function () {
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    ToneMappingValue = "aces";

    if (customCounter) {
        updateMaterialPaperback()
    }

    if (hardcoverCounter) {
        updateMaterialHardcover()
    }
})

function updateMaterialPaperback() {
    cover_frontc.material.needsUpdate = true;
    cover_backc.material.needsUpdate = true;
    spinec.material.needsUpdate = true;
    paperc.material.needsUpdate = true;
}

function updateMaterialHardcover() {
    cover_frontHardcover.material.needsUpdate = true;
    cover_backHardcover.material.needsUpdate = true;
    spineHardcover.material.needsUpdate = true;
    paperHardcover.material.needsUpdate = true;
    innerCover.material.needsUpdate = true;
    innerSpine.material.needsUpdate = true;
    endbandHardcover.material.needsUpdate = true;
    endbandHardcover2.material.needsUpdate = true;
}

let innerCoverGroup = document.getElementById('hc');
let innerSpineGroup = document.getElementById('hc2');
let endbandroup = document.getElementById('hc3');
let exportHC = true;
let exportCustom = false;

$("#b").click(function () {
    if (!hardcoverCounter) {
        hardcover();
    }
    hardcoverBook.visible = true;
    magazineC.visible = false;
    exportHC = true;
    exportCustom = false;
    innerCoverGroup.style.display = "block";
    innerSpineGroup.style.display = "block";
    endbandroup.style.display = "block";
})

let spinner = document.getElementById('spinner');

$("#c").click(function () {
    if (!customCounter) {
        custom();
        shadowGroup.position.y = - 0.015;
    }
    magazineC.visible = true;
    hardcoverBook.visible = false;
    exportHC = false;
    exportCustom = true;
    innerCoverGroup.style.display = "none";
    innerSpineGroup.style.display = "none";
    endbandroup.style.display = "none";
})


$("#rotateUp").click(function () {
    hardcoverBook.rotation.x = rotate;
    magazineC.rotation.x = rotate;
    shadowGroup.position.y = -0.244;
    slider12.value = -0.244;
    document.getElementById('shadowHeightSetValue').innerHTML = -0.244;
    rotateChecker = true;
    isUp = true;
})

$("#rotateDown").click(function () {
    hardcoverBook.rotation.x = !rotate;
    magazineC.rotation.x = !rotate;
    shadowGroup.position.y = -0.015;
    slider12.value = -0.015;
    document.getElementById('shadowHeightSetValue').innerHTML = -0.015;
    rotateChecker = true;
    isUp = false;
})

$("#clear").click(function () {
    clearSpine();
})

$("#export").click(function () {
    if (exportHC) {
        exportGLTF(hardcoverBook);
    }
    if (exportCustom) {
        exportGLTF(magazineC);
    }
})


//Thickness
let slider = document.getElementById("Thick");
slider.oninput = function () {
    if (hardcoverCounter) {
        //hardcoverBook.scale.y = this.value;
        cover_frontHardcover.morphTargetInfluences[0] = parseFloat(this.value);
        spineHardcover.morphTargetInfluences[0] = parseFloat(this.value);
        paperHardcover.morphTargetInfluences[0] = parseFloat(this.value);
        innerCover.morphTargetInfluences[0] = parseFloat(this.value);
        innerSpine.morphTargetInfluences[0] = parseFloat(this.value);
        endbandHardcover.morphTargetInfluences[0] = parseFloat(this.value);
        endbandHardcover2.morphTargetInfluences[0] = parseFloat(this.value);


    }
    if (customCounter) {
        magazineC.scale.y = this.value * 6;

    }
}

//Tilt
let slider7 = document.getElementById("Tilt");
slider7.oninput = function () {
    hardcoverBook.rotation.x = rotate - this.value;
    magazineC.rotation.x = rotate - this.value;
    rotateChecker = false;
    shadowGroup.position.y = -0.244;
    slider12.value = -0.244;
    document.getElementById('shadowHeightSetValue').innerHTML = -0.244;

}

//Reflectivity
let slider2 = document.getElementById("Reflect");
slider2.oninput = function () {
    if (hardcoverCounter) {
        cover_frontHardcover.material.roughness = parseFloat(this.value);
        cover_backHardcover.material.roughness = parseFloat(this.value);
        spineHardcover.material.roughness = parseFloat(this.value)
        innerCover.material.roughness = parseFloat(this.value);
    }
    if (customCounter) {
        cover_frontc.material.roughness = parseFloat(this.value);
        cover_backc.material.roughness = parseFloat(this.value);
        spinec.material.roughness = parseFloat(this.value);
    }
}

let slider3 = document.getElementById("Ambient");
// Update the current slider value (each time you drag the slider handle)
slider3.oninput = function () {
    hemiLight.intensity = this.value;
}

let slider4 = document.getElementById("Exposure");
// Update the current slider value (each time you drag the slider handle)
slider4.oninput = function () {
    renderer.toneMappingExposure = this.value;
}

let slider5 = document.getElementById("Front");
// Update the current slider value (each time you drag the slider handle)
slider5.oninput = function () {
    light.intensity = this.value;
}

let slider6 = document.getElementById("Back");
// Update the current slider value (each time you drag the slider handle)
slider6.oninput = function () {
    light2.intensity = this.value;
}

let slider8 = document.getElementById("SideLight");
// Update the current slider value (each time you drag the slider handle)
slider8.oninput = function () {
    light3.intensity = this.value;
}

let slider9 = document.getElementById("FOV");
// Update the current slider value (each time you drag the slider handle)
slider9.oninput = function () {
    camera.fov = this.value;
}

let slider10 = document.getElementById("FOV2");
// Update the current slider value (each time you drag the slider handle)
slider10.oninput = function () {
    camera2.fov = this.value;
}

let slider11 = document.getElementById("FOV3");
// Update the current slider value (each time you drag the slider handle)
slider11.oninput = function () {
    camera3.fov = this.value;
}

let slider12 = document.getElementById("ShadowHeight");
// Update the current slider value (each time you drag the slider handle)
slider12.oninput = function () {
    shadowGroup.position.y = this.value;
}

let slider13 = document.getElementById("ShadowOpacity");
// Update the current slider value (each time you drag the slider handle)
slider13.oninput = function () {
    plane.material.opacity = this.value;
}

let slider14 = document.getElementById("ShadowBlur");
// Update the current slider value (each time you drag the slider handle)
slider14.oninput = function () {
    state.shadow.blur = this.value;
}

//Spine Color
let spineColor = document.getElementById("spine");
spineColor.addEventListener("input", function () {
    if (hardcoverCounter) { spineHardcover.material.color.set(this.value).convertSRGBToLinear(); }
    if (customCounter) { spinec.material.color.set(this.value).convertSRGBToLinear(); }
})

//Inner Cover Color
let innerCoverColor = document.getElementById("hardCover");
innerCoverColor.addEventListener("input", function () {
    if (hardcoverCounter) { innerCover.material.color.set(this.value).convertSRGBToLinear();; }
})

//Inner Spine Color
let innerSpineColor = document.getElementById("innerSpine");
innerSpineColor.addEventListener("input", function () {
    if (hardcoverCounter) { innerSpine.material.color.set(this.value).convertSRGBToLinear();; }
})

//Endbands Color
let endbandColor = document.getElementById("endband");
endbandColor.addEventListener("input", function () {
    if (hardcoverCounter) { endbandHardcover.material.color.set(this.value).convertSRGBToLinear(); endbandHardcover2.material.color.set(this.value).convertSRGBToLinear(); }
})

//Pages Color
let pagesColor = document.getElementById("pagesColor");
pagesColor.addEventListener("input", function () {
    if (hardcoverCounter) { paperHardcover.material.color.set(this.value).convertSRGBToLinear(); }
    if (customCounter) { paperc.material.color.set(this.value).convertSRGBToLinear(); }
})


//Save camera 1
$("#saveCamera1").click(function () {

    localStorage.setItem("camera.position.x", camera.position.x);
    localStorage.setItem("camera.position.y", camera.position.y);
    localStorage.setItem("camera.position.z", camera.position.z);

    localStorage.setItem("camera.rotation.x", camera.rotation.x);
    localStorage.setItem("camera.rotation.y", camera.rotation.y);
    localStorage.setItem("camera.rotation.z", camera.rotation.z);

    localStorage.setItem("camera.fov", camera.fov);
})

//Load camera 1
$("#loadCamera1").click(function () {

    if (localStorage.getItem("camera.position.x") === null) {
        alert("No saved files. Please make sure that you are not in private mode.");
    }
    else {
        camera.position.x = parseFloat(localStorage.getItem("camera.position.x"));
        camera.position.y = parseFloat(localStorage.getItem("camera.position.y"));
        camera.position.z = parseFloat(localStorage.getItem("camera.position.z"));

        camera.rotation.x = parseFloat(localStorage.getItem("camera.rotation.x"));
        camera.rotation.y = parseFloat(localStorage.getItem("camera.rotation.y"));
        camera.rotation.z = parseFloat(localStorage.getItem("camera.rotation.z"));

        camera.fov = parseFloat(localStorage.getItem("camera.fov"));
        slider9.value = camera.fov;
        document.getElementById('fov1').innerHTML = camera.fov;
    }

})

//Save camera 2
$("#saveCamera2").click(function () {
    localStorage.setItem("camera2.position.x", camera2.position.x);
    localStorage.setItem("camera2.position.y", camera2.position.y);
    localStorage.setItem("camera2.position.z", camera2.position.z);

    localStorage.setItem("camera2.rotation.x", camera2.rotation.x);
    localStorage.setItem("camera2.rotation.y", camera2.rotation.y);
    localStorage.setItem("camera2.rotation.z", camera2.rotation.z);

    localStorage.setItem("camera2.fov", camera2.fov);
})

//Load camera 2
$("#loadCamera2").click(function () {

    if (localStorage.getItem("camera2.position.x") === null) {
        alert("No saved files. Please make sure that you are not in private mode.");
    }
    else {
        camera2.position.x = parseFloat(localStorage.getItem("camera2.position.x"));
        camera2.position.y = parseFloat(localStorage.getItem("camera2.position.y"));
        camera2.position.z = parseFloat(localStorage.getItem("camera2.position.z"));

        camera2.rotation.x = parseFloat(localStorage.getItem("camera2.rotation.x"));
        camera2.rotation.y = parseFloat(localStorage.getItem("camera2.rotation.y"));
        camera2.rotation.z = parseFloat(localStorage.getItem("camera2.rotation.z"));

        camera2.fov = parseFloat(localStorage.getItem("camera2.fov"));
        slider10.value = camera2.fov;
        document.getElementById('fov2').innerHTML = camera2.fov;
    }
})

//Save camera 3
$("#saveCamera3").click(function () {
    localStorage.setItem("camera3.position.x", camera3.position.x);
    localStorage.setItem("camera3.position.y", camera3.position.y);
    localStorage.setItem("camera3.position.z", camera3.position.z);

    localStorage.setItem("camera3.rotation.x", camera3.rotation.x);
    localStorage.setItem("camera3.rotation.y", camera3.rotation.y);
    localStorage.setItem("camera3.rotation.z", camera3.rotation.z);

    localStorage.setItem("camera3.fov", camera3.fov);
})

//Load camera 3
$("#loadCamera3").click(function () {

    if (localStorage.getItem("camera3.position.x") === null) {
        alert("No saved files. Please make sure that you are not in private mode.");
    }
    else {
        camera3.position.x = parseFloat(localStorage.getItem("camera3.position.x"));
        camera3.position.y = parseFloat(localStorage.getItem("camera3.position.y"));
        camera3.position.z = parseFloat(localStorage.getItem("camera3.position.z"));

        camera3.rotation.x = parseFloat(localStorage.getItem("camera3.rotation.x"));
        camera3.rotation.y = parseFloat(localStorage.getItem("camera3.rotation.y"));
        camera3.rotation.z = parseFloat(localStorage.getItem("camera3.rotation.z"));

        camera3.fov = parseFloat(localStorage.getItem("camera3.fov"));
        slider11.value = camera3.fov;
        document.getElementById('fov3').innerHTML = camera3.fov;
    }
})




function hardcover() {

    //load textures
    const HardcoverCoverFront = new THREE.TextureLoader().load("assets/images/cover.webp");
    const HardcoverPages = new THREE.TextureLoader().load("assets/images/pages2.webp");
    const HardcoverPagesNormal = new THREE.TextureLoader().load("assets/images/pagesNormal.webp");
    //texture encoding
    HardcoverCoverFront.encoding = THREE.sRGBEncoding;
    HardcoverPages.encoding = THREE.sRGBEncoding;
    HardcoverPagesNormal.encoding = THREE.sRGBEncoding;
    //define three materials
    let materialHardcoverFront = new THREE.MeshPhysicalMaterial({ morphTargets: true });
    let materialHardcoverBack = new THREE.MeshPhysicalMaterial();
    let materialPagesHardcover = new THREE.MeshPhysicalMaterial({ morphTargets: true });
    let materialSpineHardcover = new THREE.MeshPhysicalMaterial({ morphTargets: true });
    let materialinnerCover = new THREE.MeshPhysicalMaterial({ morphTargets: true });
    let materialSpineInnerCover = new THREE.MeshPhysicalMaterial({ morphTargets: true });

    loader.load('HC_book.glb', function (gltf) {
        hardcoverBook = gltf.scene;
        paperHardcover = gltf.scene.getObjectByName('pages');
        cover_frontHardcover = gltf.scene.getObjectByName('cover_front');
        cover_backHardcover = gltf.scene.getObjectByName('cover_back');
        spineHardcover = gltf.scene.getObjectByName('spine');
        innerCover = gltf.scene.getObjectByName('inner_cover');
        innerSpine = gltf.scene.getObjectByName('inner_spine');
        endbandHardcover = gltf.scene.getObjectByName('endband');
        endbandHardcover2 = gltf.scene.getObjectByName('endband2');

        cover_frontHardcover.material.morphTargets = true;
        spineHardcover.material.morphTargets = true;
        paperHardcover.material.morphTargets = true;
        innerCover.material.morphTargets = true;
        innerSpine.material.morphTargets = true;
        endbandHardcover.material.morphTargets = true;
        endbandHardcover2.material.morphTargets = true;

        cover_frontHardcover.material.morphTargets = [];

        cover_frontHardcover.material = materialHardcoverFront;
        cover_frontHardcover.material.map = HardcoverCoverFront;
        cover_frontHardcover.material.roughness = 1;
        cover_frontHardcover.material.map.flipY = false;
        cover_frontHardcover.material.needsUpdate = true;

        cover_backHardcover.material = materialHardcoverBack;
        cover_backHardcover.material.map = HardcoverCoverFront;
        cover_backHardcover.material.roughness = 1;
        cover_backHardcover.material.map.flipY = false;
        cover_backHardcover.material.needsUpdate = true;

        paperHardcover.material = materialPagesHardcover;
        paperHardcover.material.map = HardcoverPages;
        paperHardcover.material.normal = HardcoverPagesNormal;
        paperHardcover.material.map.flipY = false;
        paperHardcover.material.needsUpdate = true;

        spineHardcover.material = materialSpineHardcover;

        innerCover.material = materialinnerCover;
        innerSpine.material = materialSpineInnerCover;

        hardcoverBook.rotation.y = -Math.PI / 1;
        scene.add(hardcoverBook);
        hardcoverBook.visible = true;

    },

        xhr => {
            //Download Progress
            console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
        },
        error => {
            //Error CallBack
            console.log("An error happened" + error);
        }

    )

    hardcoverCounter = true;

}





function custom() {
    spinner.style.display = "flex";
    const MagazineCustomCoverFront = new THREE.TextureLoader().load("assets/images/cover.webp");
    const MagazineCustomPages = new THREE.TextureLoader().load("assets/images/pages2.webp");
    MagazineCustomCoverFront.encoding = THREE.sRGBEncoding;
    MagazineCustomPages.encoding = THREE.sRGBEncoding;
    let materialCoverFrontCustom = new THREE.MeshPhysicalMaterial();
    let materialCoverBackCustom = new THREE.MeshPhysicalMaterial();
    let materialPagesCustom = new THREE.MeshPhysicalMaterial();
    let mmaterialSpineCustom = new THREE.MeshPhysicalMaterial();

    loader2.load('magazineC.glb', function (gltf) {
        magazineC = gltf.scene;
        paperc = gltf.scene.getObjectByName('pages');
        cover_frontc = gltf.scene.getObjectByName('cover_front');
        cover_backc = gltf.scene.getObjectByName('cover_back');
        spinec = gltf.scene.getObjectByName('spine');

        cover_frontc.material = materialCoverFrontCustom;
        cover_frontc.material.map = MagazineCustomCoverFront;
        cover_frontc.material.roughness = 1;
        cover_frontc.material.map.flipY = false;
        cover_frontc.material.needsUpdate = true;

        cover_backc.material = materialCoverBackCustom;
        cover_backc.material.map = MagazineCustomCoverFront;
        cover_backc.material.roughness = 1;
        cover_backc.material.map.flipY = false;
        cover_backc.material.needsUpdate = true;

        paperc.material = materialPagesCustom;
        paperc.material.map = MagazineCustomPages;
        paperc.material.map.flipY = false;
        paperc.material.needsUpdate = true;

        spinec.material = mmaterialSpineCustom;
        magazineC.rotation.y = Math.PI / 1;
        scene.add(magazineC);
        magazineC.visible = true;
    },

        xhr => {
            //Download Progress
            console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
            spinner.style.display = "none";
        },
        error => {
            //Error CallBack
            console.log("An error happened" + error);
        }

    )

    customCounter = true;

}

function onTransitionEnd(event) {

    event.target.remove();

}



function blurShadow(amount) {

    blurPlane.visible = true;

    // blur horizontally and draw in the renderTargetBlur
    blurPlane.material = horizontalBlurMaterial;
    blurPlane.material.uniforms.tDiffuse.value = renderTarget.texture;
    horizontalBlurMaterial.uniforms.h.value = amount * 1 / 256;

    renderer.setRenderTarget(renderTargetBlur);
    renderer.render(blurPlane, shadowCamera);

    // blur vertically and draw in the main renderTarget
    blurPlane.material = verticalBlurMaterial;
    blurPlane.material.uniforms.tDiffuse.value = renderTargetBlur.texture;
    verticalBlurMaterial.uniforms.v.value = amount * 1 / 256;

    renderer.setRenderTarget(renderTarget);
    renderer.render(blurPlane, shadowCamera);

    blurPlane.visible = false;

}



//Export 3D mesh START
function exportGLTF(input) {

    gltfExporter.parse(input, function (result) {

        if (result instanceof ArrayBuffer) {

            saveArrayBuffer(result, 'scene.glb');

        } else {

            const output = JSON.stringify(result, null, 2);
            console.log(output);
            saveString(output, 'scene.gltf');

        }

    });

}


const link = document.createElement('a');
link.style.display = 'none';
document.body.appendChild(link); // Firefox workaround, see #6594

function save(blob, filename) {

    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    // URL.revokeObjectURL( url ); breaks Firefox...

}

function saveString(text, filename) {

    save(new Blob([text], { type: 'text/plain' }), filename);

}


function saveArrayBuffer(buffer, filename) {

    save(new Blob([buffer], { type: 'application/octet-stream' }), filename);

}
//Export 3D Mesh END




hardcover();


