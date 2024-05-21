"use strict";

var positions = [];
var normals = [];
var texcoords = [];

var numVertices, modelXRotationRadians, modelYRotationRadians, targetModelXRotationRadians, targetModelYRotationRadians, targetModelXRotationRadians2, targetModelYRotationRadians2;
var diffuse, ambient, specular, emissive, u_lightDirection, ambientLight, colorLight, opacity;
var isAnimating = true;

const objs = ["Gear_BaseColor.obj", "Gear_blue.obj", "Gear_diffuse.obj", "Gear_foto_mia.obj", "Gear_glossiness.obj", "Gear_metallic.obj",
                "Gear_normal.obj", "Gear_pink.obj", "Gear_red.obj", "Gear_roughness.obj", "Gear_specular.obj"];
function main() {
    var canvas = document.getElementById("canvas");
    var gl = canvas.getContext("webgl");
    if (!gl) 
        return;
    
    loadObjs();

    // setup GLSL program
    var program = webglUtils.createProgramFromScripts(gl, ["3d-vertex-shader", "3d-fragment-shader"]);
    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // look up where the vertex data needs to go.
    var positionLocation = gl.getAttribLocation(program, "a_position");
    var normalLocation = gl.getAttribLocation(program, "a_normal");
    var texcoordLocation = gl.getAttribLocation(program, "a_texcoord");

    // Create a buffer for positions
    var positionBuffer = gl.createBuffer();
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Put the positions in the buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Create a buffer for normals
    var normalsBuffer = gl.createBuffer();
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER mormalsBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    // Put the normals in the buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    // provide texture coordinates
    var texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    // Set Texcoords
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
    
    diffuse = [0.7, 0.7, 0.7];          // diffuse light intensity
    ambient = [1.0, 1.0, 1.0];          // ambient reflection intensity
    specular = [0, 0, 0];      // specular highlight intensity
    emissive = [0.0, 0.0, 0.0];
    u_lightDirection = [0.5, -0.5, 0.5] // light direction
    ambientLight = [0.2, 0.2, 0.2];     // ambiental light intensity
    colorLight = [1.5, 1.5, 1.5];       // neutral light intesity
    opacity = 1.0;

    gl.uniform3fv(gl.getUniformLocation(program, "diffuse" ), diffuse );
    gl.uniform3fv(gl.getUniformLocation(program, "ambient" ), ambient); 
    gl.uniform3fv(gl.getUniformLocation(program, "specular"), specular );	
    gl.uniform3fv(gl.getUniformLocation(program, "emissive"), emissive );
    gl.uniform3fv(gl.getUniformLocation(program, "u_lightDirection" ), u_lightDirection );
    gl.uniform3fv(lightWorldDirectionLocation, m4.normalize([-1, 3, 5])); // Modifica la posizione della luce direzionale
    gl.uniform3fv(gl.getUniformLocation(program, "ambientLight" ), ambientLight );
    gl.uniform3fv(gl.getUniformLocation(program, "u_colorLight" ), colorLight );
    gl.uniform1f(gl.getUniformLocation(program, "opacity"), opacity);   
    
    var diffuseSlider = document.getElementById("diffuseSlider");
    diffuseSlider.addEventListener("input", function() {
        var value = parseFloat(diffuseSlider.value);
        diffuse = [value, value, value];
        gl.uniform3fv(gl.getUniformLocation(program, "diffuse"), diffuse);
        drawScene();
    });

    var specularSlider = document.getElementById("specularSlider");
    specularSlider.addEventListener("input", function() {
        var value = parseFloat(specularSlider.value);
        specular = [value, value, value];
        gl.uniform3fv(gl.getUniformLocation(program, "specular"), specular);
        drawScene();
    });

    var emissiveLightSlider = document.getElementById("emissiveLightSlider");
    emissiveLightSlider.addEventListener("input", function() {
        var value = parseFloat(emissiveLightSlider.value);
        emissive = [value, value, value];
        gl.uniform3fv(gl.getUniformLocation(program, "emissive"), emissive);
        drawScene();
    });

    var opacitySlider = document.getElementById("opacitySlider");
    opacitySlider.addEventListener("input", function() {
        var value = parseFloat(opacitySlider.value);
        opacity = value;
        gl.uniform1f(gl.getUniformLocation(program, "opacity"), opacity);   
        drawScene();
    });

    var lightDirectionSlider = document.getElementById("lightDirectionSlider");
    lightDirectionSlider.addEventListener("input", function() {
        var value = parseFloat(lightDirectionSlider.value);
        u_lightDirection = [value, value, value];
        gl.uniform3fv(gl.getUniformLocation(program, "u_lightDirection"), u_lightDirection);
        drawScene();
    });

    var resetLights = document.getElementById("resetLights");
    resetLights.addEventListener("click", function () {
        diffuse = [0.7, 0.7, 0.7];          // diffuse light intensity
        specular = [0, 0, 0];      // specular highlight intensity
        emissive = [0.0, 0.0, 0.0]
        u_lightDirection = [0.5, -0.5, 0.5] // light direction
        opacity = 1.0;

        gl.uniform3fv(gl.getUniformLocation(program, "diffuse" ), diffuse );
        gl.uniform3fv(gl.getUniformLocation(program, "ambient" ), ambient); 
        gl.uniform3fv(gl.getUniformLocation(program, "specular"), specular );	
        gl.uniform3fv(gl.getUniformLocation(program, "emissive"), emissive );
        gl.uniform3fv(gl.getUniformLocation(program, "u_lightDirection" ), u_lightDirection );
        gl.uniform3fv(lightWorldDirectionLocation, m4.normalize([-1, 3, 5])); // Modifica la posizione della luce direzionale
        gl.uniform3fv(gl.getUniformLocation(program, "ambientLight" ), ambientLight );
        gl.uniform3fv(gl.getUniformLocation(program, "u_colorLight" ), colorLight );
        gl.uniform1f(gl.getUniformLocation(program, "opacity"), opacity);

        lightDirectionSlider.value = 0.5;
        specularSlider.value = 0;
        diffuseSlider.value = 0.7;
        emissiveLightSlider.value = 0.0;
        opacitySlider.value = 1.0;
        drawScene(); // Ridisegna la scena con la nuova posizione della telecamera
    });

    // Turn on the position attribute
    gl.enableVertexAttribArray(positionLocation);
    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 3;          // 3 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

    // Turn on the normal attribute
    gl.enableVertexAttribArray(normalLocation);
    // Bind the normal buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.vertexAttribPointer(normalLocation, size, type, normalize, stride, offset);

    // Turn on the texcord attribute
    gl.enableVertexAttribArray(texcoordLocation);
    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    size = 2;          // 2 components per iteration
    gl.vertexAttribPointer(texcoordLocation, size, type, normalize, stride, offset);

    var fieldOfViewRadians = degToRad(30);
    modelXRotationRadians = degToRad(0);
    modelYRotationRadians = degToRad(0);

    // Compute the projection matrix
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var zmin=0.1;
    var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zmin, 200);

    var cameraPosition = [4.5, 4.5, 2];
    var up = [0, 0, 1];
    var target = [0, 0, 0];

    // Compute the camera's matrix using look at.
    var cameraMatrix = m4.lookAt(cameraPosition, target, up);

    // Make a view matrix from the camera matrix.
    var viewMatrix = m4.inverse(cameraMatrix);

    var cameraPositionSliderX = document.getElementById("cameraPositionSliderX");
    cameraPositionSliderX.addEventListener("input", function() {
        var value = parseFloat(cameraPositionSliderX.value);
        cameraPosition[0] = value; // Imposta la posizione X della telecamera
        // Aggiorna la matrice della vista con la nuova posizione della telecamera
        cameraMatrix = m4.lookAt(cameraPosition, target, up);
        viewMatrix = m4.inverse(cameraMatrix);
        gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
        drawScene(); // Ridisegna la scena con la nuova posizione della telecamera
    });

    var cameraPositionSliderY = document.getElementById("cameraPositionSliderY");
    cameraPositionSliderY.addEventListener("input", function() {
        var value = parseFloat(cameraPositionSliderY.value);
        cameraPosition[1] = value; // Imposta la posizione Y della telecamera
        // Aggiorna la matrice della vista con la nuova posizione della telecamera
        cameraMatrix = m4.lookAt(cameraPosition, target, up);
        viewMatrix = m4.inverse(cameraMatrix);
        gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
        drawScene(); // Ridisegna la scena con la nuova posizione della telecamera
    });
    
    var cameraPositionSliderZ = document.getElementById("cameraPositionSliderZ");
    cameraPositionSliderZ.addEventListener("input", function() {
        var value = parseFloat(cameraPositionSliderZ.value);
        cameraPosition[2] = value; // Imposta la posizione Z della telecamera
        // Aggiorna la matrice della vista con la nuova posizione della telecamera
        cameraMatrix = m4.lookAt(cameraPosition, target, up);
        viewMatrix = m4.inverse(cameraMatrix);
        gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
        drawScene(); // Ridisegna la scena con la nuova posizione della telecamera
    });

    var resetCamera = document.getElementById("resetCamera");
    resetCamera.addEventListener("click", function () {
        cameraPositionSliderX.value = cameraPositionSliderY.value = 4.5;
        cameraPositionSliderZ.value = 2;
        var duration = 500; // Decreased duration for faster animation
        var numFrames = 30; // Number of frames for the animation
        var increment = 1.0 / numFrames;

        var targetCameraPosition = [4.5, 4.5, 2]; // New camera position after reset
        var startCameraPosition = cameraPosition.slice(); // Current camera position

        var frame = 0;
        var interval = setInterval(function () {
            frame++;
            var progress = frame / numFrames;
            if (progress >= 1) {
                clearInterval(interval);
                progress = 1;
            }

            // Interpolate the camera position
            for (var i = 0; i < 3; i++) {
                cameraPosition[i] = startCameraPosition[i] + (targetCameraPosition[i] - startCameraPosition[i]) * progress;
            }

            // Update the view matrix with the new camera position
            cameraMatrix = m4.lookAt(cameraPosition, target, up);
            viewMatrix = m4.inverse(cameraMatrix);
            gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);

            drawScene(); // Redraw the scene with the interpolated camera position
        }, duration / numFrames);
    });

    var matrixLocation = gl.getUniformLocation(program, "u_world");
    var textureLocation = gl.getUniformLocation(program, "diffuseMap");
    var viewMatrixLocation = gl.getUniformLocation(program, "u_view");
    var projectionMatrixLocation = gl.getUniformLocation(program, "u_projection");
    var lightWorldDirectionLocation = gl.getUniformLocation(program, "u_lightDirection");
    var viewWorldPositionLocation = gl.getUniformLocation(program, "u_viewWorldPosition");

    gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);

    // set the light position
    gl.uniform3fv(lightWorldDirectionLocation, m4.normalize([-1, 3, 5]));

    // set the camera/view position
    gl.uniform3fv(viewWorldPositionLocation, cameraPosition);

    // Tell the shader to use texture unit 0 for diffuseMap
    gl.uniform1i(textureLocation, 0);

    function degToRad(d) {
        return d * Math.PI / 180;
    }

    var then = 0;
    requestAnimationFrame(drawScene);

    // Aggiungi event listener per il trascinamento del mouse
    var isDragging = false;
    var lastMouseX, lastMouseY;

    canvas.addEventListener("mousedown", function(event) {
        isDragging = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    });

    // Aggiungi variabili per memorizzare la rotazione del mouse
    targetModelXRotationRadians = targetModelXRotationRadians2 = modelXRotationRadians;
    targetModelYRotationRadians = targetModelYRotationRadians2 = modelYRotationRadians;

    // Aggiorna il codice all'interno dell'evento mousemove
    canvas.addEventListener("mousemove", function(event) {
        if (isDragging) {
            var deltaX = event.clientX - lastMouseX;
            var deltaY = event.clientY - lastMouseY;

            // Interpolazione della rotazione del cubo in base ai movimenti del mouse
            targetModelXRotationRadians -= deltaY * 0.01;
            targetModelYRotationRadians += deltaX * 0.01;
            targetModelXRotationRadians2 -= deltaY * 0.01;
            targetModelYRotationRadians2 -= deltaY * 0.01;

            lastMouseX = event.clientX;
            lastMouseY = event.clientY;

            drawScene();
        }
    });

    canvas.addEventListener("mouseup", function() {
        isDragging = false;
    });

    document.getElementById("randomTexture").addEventListener("click", function () {
        loadObjs();
    });

    document.getElementById("rotateUpButton").addEventListener("click", function() {
        rotateUp();
    });

    document.getElementById("rotateDownButton").addEventListener("click", function() {
        rotateDown();
    });

    document.getElementById("rotateRightButton").addEventListener("click", function() {
        rotateRight();
    });

    document.getElementById("rotateLeftButton").addEventListener("click", function() {
        rotateLeft();
    });

    document.getElementById("startAnimation").addEventListener("click", function() {
        var table = document.getElementById("movement");
        table.classList.add("invisible");
        isAnimating = true; 
        requestAnimationFrame(drawSceneAnimate);
    });

    document.getElementById("stopAnimation").addEventListener("click", function() {
        var table = document.getElementById("movement");
        table.classList.remove("invisible");
        isAnimating = false;
    });

    document.addEventListener('keydown', function(event) {
        switch (event.key) {
            case 'w':
            case 'ArrowUp':
                rotateUp();
                break;
            case 's':
            case 'ArrowDown':
                rotateDown();
                break;
            case 'ArrowRight':
            case 'd':
                rotateRight();
                break;
            case 'a':
            case 'ArrowLeft':
                rotateLeft();
                break;
            case ' ':
                loadObjs();
                break;
            default:
                break;
        }
    });

    function rotateUp() {
        targetModelXRotationRadians += Math.PI / 22.5; // Ruota verso l'alto (in senso antiorario) per la prima mesh
        targetModelXRotationRadians2 += Math.PI / 22.5; // Ruota verso l'alto (in senso antiorario) per la seconda mesh
        console.log('rotateUpButton');
        drawScene();
    }
    
    function rotateDown() {
        targetModelXRotationRadians -= Math.PI / 22.5; // Ruota verso il basso (in senso orario) per la prima mesh
        targetModelXRotationRadians2 -= Math.PI / 22.5; // Ruota verso il basso (in senso orario) per la seconda mesh
        console.log('rotateDownButton');
        drawScene();
    }
    
    function rotateRight() {
        targetModelYRotationRadians += Math.PI / 22.5; // Ruota verso destra (in senso orario) per la prima mesh
        targetModelYRotationRadians2 -= Math.PI / 22.5; // Ruota verso sinistra (in senso antiorario) per la seconda mesh
        console.log('rotateRightButton');
        drawScene();
    }
    
    function rotateLeft() {
        targetModelYRotationRadians -= Math.PI / 22.5; // Ruota verso sinistra (in senso orario) per la prima mesh
        targetModelYRotationRadians2 += Math.PI / 22.5; // Ruota verso destra (in senso antiorario) per la seconda mesh
        console.log('rotateLeftButton');
        drawScene();
    }

    function drawScene() {
        enableMovementButton();
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
    
        // Interpolate the model rotation based on the targets
        modelXRotationRadians += (targetModelXRotationRadians - modelXRotationRadians) * 0.1;
        modelYRotationRadians += (targetModelYRotationRadians - modelYRotationRadians) * 0.1;
    
        // Clear the canvas AND the depth buffer.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
        // Draw the first geometry.
        var matrix1 = m4.translate(m4.identity(), -1.0, 0.3, 0.5); // Trasla la prima mesh a sinistra
        matrix1 = m4.xRotate(matrix1, modelXRotationRadians);
        matrix1 = m4.yRotate(matrix1, modelYRotationRadians);
        gl.uniformMatrix4fv(matrixLocation, false, matrix1);
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    
        var modelMatrix2 = m4.identity();
        modelMatrix2 = m4.translate(modelMatrix2, 0.9, 0.3, 0.5);  // Translate the second element to the right
        modelMatrix2 = m4.xRotate(modelMatrix2, targetModelXRotationRadians2); // Apply rotation to the second mesh
        modelMatrix2 = m4.yRotate(modelMatrix2, targetModelYRotationRadians2); // Apply rotation to the second mesh
        gl.uniformMatrix4fv(matrixLocation, false, modelMatrix2);
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    
        // Check for WebGL errors
        var error = gl.getError();
        if (error !== gl.NO_ERROR)
            console.error('WebGL error:', error);
    
        requestAnimationFrame(drawScene);
    }

    function drawSceneAnimate(time){
        if (!isAnimating)
            return;

        disableMovementButton();

        // convert to seconds
        time *= 0.001;
        // Subtract the previous time from the current time
        var deltaTime = time - then;
        // Remember the current time for the next frame.
        then = time;

        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        //gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);

        // Animate the rotation
        modelXRotationRadians += -0.7 * deltaTime;
        targetModelXRotationRadians += -0.7 * deltaTime;
        targetModelXRotationRadians2 += -0.7 * deltaTime;
        modelYRotationRadians -= 0.7 * deltaTime; // Ruota verso sinistra (in senso orario) per la prima mesh
        targetModelYRotationRadians += -0.7 * deltaTime; // Ruota verso destra (in senso antiorario) per la seconda mesh
        targetModelYRotationRadians2 += -0.7 * deltaTime; // Ruota verso destra (in senso antiorario) per la seconda mesh

        // Clear the canvas AND the depth buffer.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        // Clear the canvas AND the depth buffer.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
        // Draw the first geometry.
        var matrix1 = m4.translate(m4.identity(), -1.0, 0.3, 0.5); // Trasla la prima mesh a sinistra
        matrix1 = m4.xRotate(matrix1, modelXRotationRadians);
        matrix1 = m4.yRotate(matrix1, modelYRotationRadians);
        gl.uniformMatrix4fv(matrixLocation, false, matrix1);
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    
        var modelMatrix2 = m4.identity();
        modelMatrix2 = m4.translate(modelMatrix2, 0.9, 0.3, 0.5);  // Translate the second element to the right
        modelMatrix2 = m4.xRotate(modelMatrix2, targetModelXRotationRadians2); // Apply rotation to the second mesh
        modelMatrix2 = m4.yRotate(modelMatrix2, targetModelYRotationRadians2); // Apply rotation to the second mesh
        gl.uniformMatrix4fv(matrixLocation, false, modelMatrix2);
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    
        // Check for WebGL errors
        var error = gl.getError();
        if (error !== gl.NO_ERROR)
            console.error('WebGL error:', error);
    
        requestAnimationFrame(drawSceneAnimate);
    }

    function disableMovementButton(){
        var up = document.getElementById("rotateUpButton");
        up.disabled = "disabled";
        // document.getElementById("rotateUpButton").disabled = true;
        document.getElementById("rotateDownButton").disabled = true;
        document.getElementById("rotateRightButton").disabled = true;
        document.getElementById("rotateLeftButton").disabled = true;
    }

    function enableMovementButton(){
        document.getElementById("rotateUpButton").disabled = false;
        document.getElementById("rotateDownButton").disabled = false;
        document.getElementById("rotateRightButton").disabled = false;
        document.getElementById("rotateLeftButton").disabled = false;
    }

    function loadObjs() {
        var mesh = [];
        var index = Math.floor(Math.random() * objs.length);
        mesh.push({ sourceMesh: 'data/' + objs[index] });
        mesh.push({ sourceMesh: 'data/' + objs[index] });
        LoadMesh(gl, mesh[0]);
        LoadMesh(gl, mesh[1]);
        console.log(objs[index]);
    }
}

main();