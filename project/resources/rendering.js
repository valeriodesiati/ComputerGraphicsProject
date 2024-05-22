"use strict";

//Array di valori che rappresentano le posizioni 3D di tutti i vertici dei due modelli.
//Ogni vertice è definito da tre valori che specificano le sue coordinate X, Y e Z.
var positions = [];

//Array di valori che rappresentano le normali per ciascun vertice.
//Le normali indicano la direzione perpendicolare alla superficie della mesh in un punto specifico
var normals = [];

//Array di valori che rappresentano le coordinate di texture per ciascun vertice.
//Ogni valore nell'array texcoords indica come mappare la texture sui vertici dell'ingranaggio.
var texcoords = [];

//Numero totale di vertici presenti in entrambe le mesh
var numVertices;

//Variabili che memorizzano gli angoli di rotazione ATTUALI del primo ingranaggio lungo gli assi X e Y, espressi in radianti.
var modelXRotationRadians, modelYRotationRadians;

//Variabili che memorizzano gli angoli di rotazione TARGET degli ingranaggi lungo gli assi X e Y, espressi in radianti. 
var targetModelXRotationRadians, targetModelYRotationRadians;
var targetModelXRotationRadians2, targetModelYRotationRadians2;


//Variabili per la definizione delle proprietà di illuminazione della scena 3D
var diffuse, ambient, specular, emissive, u_lightDirection, ambientLight, colorLight, opacity;

//Flag per l'animazione
var isAnimating = true;
//Tempo per animazione
var then = 0;

//OBJ disponibili, tutti con diverse texture
const objs = ["Gear_BaseColor.obj", "Gear_blue.obj", "Gear_diffuse.obj", "Gear_foto_mia.obj", "Gear_glossiness.obj", "Gear_metallic.obj",
                "Gear_normal.obj", "Gear_pink.obj", "Gear_red.obj", "Gear_roughness.obj", "Gear_specular.obj"];
                
function main() {
    var canvas = document.getElementById("canvas");

    //Contesto WebGL per il canvas
    var gl = canvas.getContext("webgl");

    //Verifica se il contesto WebGL è stato ottenuto correttamente
    if (!gl) {
        console.error("Errore: Impossibile ottenere il contesto WebGL. La tua scheda grafica potrebbe non supportare WebGL.");
        return;
    }
    
    //Caricamento OBJ
    loadObjs();

    //Imposta il programma GLSL
    var program = webglUtils.createProgramFromScripts(gl, ["3d-vertex-shader", "3d-fragment-shader"]);

    //Attivazione programma
    gl.useProgram(program);

    //Recupera le posizioni degli attributi di vertex
    var positionLocation = gl.getAttribLocation(program, "a_position");
    var normalLocation = gl.getAttribLocation(program, "a_normal");
    var texcoordLocation = gl.getAttribLocation(program, "a_texcoord");

    //Crea un buffer per le posizioni dei vertici
    var positionBuffer = gl.createBuffer();

    //Associa il buffer all'ARRAY_BUFFER (ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    //Carica le posizioni dei vertici nel buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    //Crea un buffer per le normali
    var normalsBuffer = gl.createBuffer();

    //Associa il buffer all'ARRAY_BUFFER (ARRAY_BUFFER = normalsBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);

    //Carica le normali nel buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    //Coordinate di texture
    var texcoordBuffer = gl.createBuffer();

    //Associa il buffer all'ARRAY_BUFFER (ARRAY_BUFFER = texcoordBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

    //Imposta le coordinate di texture
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);

    //Impostazione di default delle proprietà di illuminazione della scena 3D
    diffuse = [0.7, 0.7, 0.7];          //Luce diffusa dagli oggetti
    ambient = [1.0, 1.0, 1.0];          //Luce ambientale della scena
    specular = [0, 0, 0];               //Luce speculare riflessa in una posizione specifica
    emissive = [0.0, 0.0, 0.0];         //Emissione di luce propria
    u_lightDirection = [0.5, -0.5, 0.5] //Direzione della luce
    ambientLight = [0.2, 0.2, 0.2];     //Intensità complessiva della luce ambientale
    colorLight = [1.5, 1.5, 1.5];       //Luce neutrale
    opacity = 1.0;                      //Opacità

    //Imposta le variabili uniform per l'illuminazione
    //  gl.uniform3fv è una funzione utilizzata per impostare una uniform di tipo vettore a 3 elementi (float) nel programma attivo.
    //  gl.getUniformLocation(program, "diffuse") recupera la uniform con un determinato nome nel programma shader.
    //Allo stesso modo si ha:
    //  gl.uniform1f, funzione utilizzata per impostare una uniform composta da un solo elemento (float).
    gl.uniform3fv(gl.getUniformLocation(program, "diffuse" ), diffuse );
    gl.uniform3fv(gl.getUniformLocation(program, "ambient" ), ambient); 
    gl.uniform3fv(gl.getUniformLocation(program, "specular"), specular );	
    gl.uniform3fv(gl.getUniformLocation(program, "emissive"), emissive );
    gl.uniform3fv(gl.getUniformLocation(program, "u_lightDirection" ), u_lightDirection );
    gl.uniform3fv(lightWorldDirectionLocation, m4.normalize([-1, 3, 5]));
    gl.uniform3fv(gl.getUniformLocation(program, "ambientLight" ), ambientLight );
    gl.uniform3fv(gl.getUniformLocation(program, "u_colorLight" ), colorLight );
    gl.uniform1f(gl.getUniformLocation(program, "opacity"), opacity);   
    
    //Impostazione della luce "dimmerabile".
    //L'utente ha a disposizione gli slider per modificare tutte le intensità delle luci di scena.
    //Il tutto viene gestito tramite eventi.
    //Ogni volta che una uniform viene modificata tramite slider, viene reimpostata,
    //in modo da avere un risultato immediato nella scena.
    var diffuseSlider = document.getElementById("diffuseSlider");
    diffuseSlider.addEventListener("input", function() {
        var value = parseFloat(diffuseSlider.value);
        diffuse = [value, value, value];
        gl.uniform3fv(gl.getUniformLocation(program, "diffuse"), diffuse);
    });

    var specularSlider = document.getElementById("specularSlider");
    specularSlider.addEventListener("input", function() {
        var value = parseFloat(specularSlider.value);
        specular = [value, value, value];
        gl.uniform3fv(gl.getUniformLocation(program, "specular"), specular);
    });

    var emissiveLightSlider = document.getElementById("emissiveLightSlider");
    emissiveLightSlider.addEventListener("input", function() {
        var value = parseFloat(emissiveLightSlider.value);
        emissive = [value, value, value];
        gl.uniform3fv(gl.getUniformLocation(program, "emissive"), emissive);
    });

    var opacitySlider = document.getElementById("opacitySlider");
    opacitySlider.addEventListener("input", function() {
        var value = parseFloat(opacitySlider.value);
        opacity = value;
        gl.uniform1f(gl.getUniformLocation(program, "opacity"), opacity);   
    });

    var lightDirectionSlider = document.getElementById("lightDirectionSlider");
    lightDirectionSlider.addEventListener("input", function() {
        var value = parseFloat(lightDirectionSlider.value);
        u_lightDirection = [value, value, value];
        gl.uniform3fv(gl.getUniformLocation(program, "u_lightDirection"), u_lightDirection);
    });

    //L'utente ha inoltre la possibilità di reimpostare le luci di default.
    //Si reimpostano le uniform originali e si resettano gli slider.
    var resetLights = document.getElementById("resetLights");
    resetLights.addEventListener("click", function () {
        diffuse = [0.7, 0.7, 0.7];
        specular = [0, 0, 0];
        emissive = [0.0, 0.0, 0.0]
        u_lightDirection = [0.5, -0.5, 0.5]
        opacity = 1.0;

        gl.uniform3fv(gl.getUniformLocation(program, "diffuse" ), diffuse );
        gl.uniform3fv(gl.getUniformLocation(program, "ambient" ), ambient); 
        gl.uniform3fv(gl.getUniformLocation(program, "specular"), specular );	
        gl.uniform3fv(gl.getUniformLocation(program, "emissive"), emissive );
        gl.uniform3fv(gl.getUniformLocation(program, "u_lightDirection" ), u_lightDirection );
        gl.uniform3fv(lightWorldDirectionLocation, m4.normalize([-1, 3, 5]));
        gl.uniform3fv(gl.getUniformLocation(program, "ambientLight" ), ambientLight );
        gl.uniform3fv(gl.getUniformLocation(program, "u_colorLight" ), colorLight );
        gl.uniform1f(gl.getUniformLocation(program, "opacity"), opacity);

        lightDirectionSlider.value = 0.5;
        specularSlider.value = 0;
        diffuseSlider.value = 0.7;
        emissiveLightSlider.value = 0.0;
        opacitySlider.value = 1.0;
    });
    
    //Attivazione dell'attributo "a_position" nel vertex shader.
    //Gli attributi vertex sono variabili usate dal vertex shader per accedere ai dati associati a ciascun vertice del modello 3D.
    //In questo caso, "a_position" riceve le coordinate 3D (x, y, z) dei vertici.
    gl.enableVertexAttribArray(positionLocation);

    // Associa il buffer delle posizioni all'attributo "a_position"
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var size = 3;              //Numero di elementi che compongono ogni posizione di un vertice (3D -> size = 3)
    var type = gl.FLOAT;       //Tipo di dato dei valori nel buffer
    var normalize = false;     //I dati non devono essere normalizzati
    var stride = 0;            //Non bisogna saltare elementi nel buffer
    var offset = 0;            //Posizione dalla quale iniziare la lettura, 0 -> inizio buffer
    
    //Configura come interpretare i dati nel buffer delle posizioni
    gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

    //Abilita l'attributo "a_normal"
    gl.enableVertexAttribArray(normalLocation);

    //Associa il buffer delle normali all'attributo "a_normal"
    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    
    //Configura come interpretare i dati nel buffer delle normali
    gl.vertexAttribPointer(normalLocation, size, type, normalize, stride, offset);

    //Abilita l'attributo "a_texcoord"
    gl.enableVertexAttribArray(texcoordLocation);

    //Associa il buffer delle coordinate di texture all'attributo "a_texcoord"
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    
    //Configura come interpretare i dati nel buffer delle coordinate di texture
    size = 2;
    gl.vertexAttribPointer(texcoordLocation, size, type, normalize, stride, offset);
    
    //Imposta l'angolo di campo visivo (FOV) e le rotazioni delle mesh
    var fieldOfViewRadians = degToRad(30);
    
    //Nessuna rotazione di default sugli assi X e Y
    modelXRotationRadians = degToRad(0);
    modelYRotationRadians = degToRad(0);
    
    //Calcola il rapporto di aspetto della viewport (porzione del canvas utilizzata per il rendering della scena 3D)
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    
    //Imposta la distanza minima e massima per il clipping
    var zmin = 0.1;
    
    //Crea la matrice di proiezione con la funzione m4.perspective trasformando le coordinate dei vertici 3D in coordinate dello schermo 
    //tenendo conto dell'angolo di campo visivo (FOV), del rapporto di aspetto, della distanza minima di clipping (`zmin`) e 
    //della distanza massima di clipping
    var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zmin, 200);

    //Imposta la posizione della telecamera
    var cameraPosition = [4.5, 4.5, 2];

    //Imposta la direzione dell'asse per l'orientamento delle telecamera
    var up = [0, 0, 1];
    
    //Imposta il punto target della telecamera (origine della scena)
    var target = [0, 0, 0];

    //Calcola la matrice della camera con la funzione m4.lookAt
    var cameraMatrix = m4.lookAt(cameraPosition, target, up);
    
    //Calcola la matrice di view con la funzione m4.inverse.
    //La matrice di view viene utilizzata per trasformare le coordinate dallo spazio della camera allo spazio del mondo.
    var viewMatrix = m4.inverse(cameraMatrix); 

    //L'utente può modificare la posizione della camera tramite slider sui tre assi X, Y e Z.
    //Al movimento degli slider, le uniform vengono aggiornate di conseguenza.
    var cameraPositionSliderX = document.getElementById("cameraPositionSliderX");
    cameraPositionSliderX.addEventListener("input", function() {
        var value = parseFloat(cameraPositionSliderX.value);
        cameraPosition[0] = value; // Imposta la posizione X della telecamera
        cameraMatrix = m4.lookAt(cameraPosition, target, up);
        viewMatrix = m4.inverse(cameraMatrix);
        gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
    });

    var cameraPositionSliderY = document.getElementById("cameraPositionSliderY");
    cameraPositionSliderY.addEventListener("input", function() {
        var value = parseFloat(cameraPositionSliderY.value);
        cameraPosition[1] = value; // Imposta la posizione Y della telecamera
        cameraMatrix = m4.lookAt(cameraPosition, target, up);
        viewMatrix = m4.inverse(cameraMatrix);
        gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
    });
    
    var cameraPositionSliderZ = document.getElementById("cameraPositionSliderZ");
    cameraPositionSliderZ.addEventListener("input", function() {
        var value = parseFloat(cameraPositionSliderZ.value);
        cameraPosition[2] = value; // Imposta la posizione Z della telecamera
        cameraMatrix = m4.lookAt(cameraPosition, target, up);
        viewMatrix = m4.inverse(cameraMatrix);
        gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
    });

    //L'utente ha la possibilità di reimpostare le coordinate della camera di default.
    //Si reimpostano le uniform originali e si resettano gli slider.
    var resetCamera = document.getElementById("resetCamera");
    resetCamera.addEventListener("click", function () {
        //Si riposizionano la camera nelle coordinate di default in maniera animata
        var duration = 500; //Durata
        var numFrames = 30; //Numero di frame per l'animazione

        var targetCameraPosition = [4.5, 4.5, 2]; //Coordinate target, quelle di default
        var startCameraPosition = cameraPosition.slice(); //Coordinate correnti

        var frame = 0;
        var interval = setInterval(function () {
            frame++;
            var progress = frame / numFrames;
            if (progress >= 1) {
                clearInterval(interval);
                progress = 1;
            }

            //Interpolazione delle coordinate della camera
            for (var i = 0; i < 3; i++)
                cameraPosition[i] = startCameraPosition[i] + (targetCameraPosition[i] - startCameraPosition[i]) * progress;
            
            //Si ricalcolano le matrici camera e view con le nuove coordinate
            cameraMatrix = m4.lookAt(cameraPosition, target, up);
            viewMatrix = m4.inverse(cameraMatrix);
            gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);

        }, duration / numFrames);

        cameraPositionSliderX.value = cameraPositionSliderY.value = 4.5;
        cameraPositionSliderZ.value = 2;
    });

    //Recupera le uniform locations dal programma
    var matrixLocation = gl.getUniformLocation(program, "u_world"); //Matrice del modello
    var textureLocation = gl.getUniformLocation(program, "diffuseMap"); //Locazione dell'uniform "diffuseMap"
    var viewMatrixLocation = gl.getUniformLocation(program, "u_view"); //Matrice di view
    var projectionMatrixLocation = gl.getUniformLocation(program, "u_projection"); //Matrice di proiezione
    var lightWorldDirectionLocation = gl.getUniformLocation(program, "u_lightDirection"); //Direzione luce nella scena
    var viewWorldPositionLocation = gl.getUniformLocation(program, "u_viewWorldPosition"); //Posizione della telecamera nella scena

    //Invia le matrici di view e proiezione agli shader
    //La matrice di view trasforma le coordinate dallo spazio della camea allo spazio della scena
    gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
    
    //La matrice di proiezione trasforma le coordinate dallo spazio della scena allo spazio dello schermo tenendo conto
    //dell'angolo di campo visivo, del rapporto di aspetto e di altri parametri.
    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);

    //Imposta la direzione della luce nella scena
    gl.uniform3fv(lightWorldDirectionLocation, m4.normalize([-1, 3, 5]));
    
    //Imposta la posizione della telecamera nella scena
    gl.uniform3fv(viewWorldPositionLocation, cameraPosition);
    
    //Imposta l'uniform texture unit per la texture diffuse
    gl.uniform1i(textureLocation, 0);
    
    //Funzione per passare da gradi a radianti
    function degToRad(d) {
        return d * Math.PI / 180;
    }

    //Funzione per l'animazione continua della scena.
    //La funzione drawScene aggiorna la posizione e l'aspetto degli oggetti 
    //nella scena, creando l'effetto di animazione.
    requestAnimationFrame(drawScene);

    //Variabili per la gestione del movimento tramite touchscreen o mouse
    var isDragging = false;
    var lastMouseX = 0;
    var lastMouseY = 0;

    //Se il mouse è cliccato
    canvas.addEventListener("mousedown", function(event) {
        isDragging = true;
        
        //Si salvano le coordinate
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    });

    //Se il mouse ha il focus sulle mesh ed è premuto
    canvas.addEventListener("mousemove", function onMouseMove(event) {
        //Se si sta muovendo
        if (isDragging) {
            var deltaX = event.clientX - lastMouseX;
            var deltaY = event.clientY - lastMouseY;

            //Interpolazione della rotazione del cubo in base ai movimenti del mouse
            //Si vuole che gli ingranaggi appaiano come se stessero ruotando
            targetModelXRotationRadians -= deltaY * 0.01;
            targetModelYRotationRadians += deltaX * 0.01;
            targetModelXRotationRadians2 -= deltaY * 0.01;
            targetModelYRotationRadians2 -= deltaX * 0.01;

            lastMouseX = event.clientX;
            lastMouseY = event.clientY;

            drawScene();
        }
    });

    //Se si solleva il mouse non c'è più movimento
    canvas.addEventListener("mouseup", function(event) {
        isDragging = false;
    });
    
    //Inizio tocco con touchscreen
    canvas.addEventListener("touchstart", function(event) {
        isDragging = true;
        var touch = event.touches[0];

        //Si salvano le coordinate
        lastMouseX = touch.clientX;
        lastMouseY = touch.clientY;
    });
    
    //Se il si muove il dito tramite touchscreen
    canvas.addEventListener("touchmove", function onTouchMove(event) {
        //Se si sta muovendo
        if (isDragging) {
            var deltaX = event.clientX - lastMouseX;
            var deltaY = event.clientY - lastMouseY;

            //Interpolazione della rotazione del cubo in base ai movimenti del mouse
            //Si vuole che gli ingranaggi appaiano come se stessero ruotando
            targetModelXRotationRadians -= deltaY * 0.01;
            targetModelYRotationRadians += deltaX * 0.01;
            targetModelXRotationRadians2 -= deltaY * 0.01;
            targetModelYRotationRadians2 -= deltaX * 0.01;

            lastMouseX = event.clientX;
            lastMouseY = event.clientY;

            drawScene();
        }
    });

    //Fine tocco con touchscreen
    canvas.addEventListener("touchend", function(event) {
        isDragging = false;
    });

    //Aggiungi variabili per memorizzare la rotazione del mouse
    targetModelXRotationRadians = targetModelXRotationRadians2 = modelXRotationRadians;
    targetModelYRotationRadians = targetModelYRotationRadians2 = modelYRotationRadians;

    //Per modificare la texture si carica un nuovo obj
    document.getElementById("randomTexture").addEventListener("click", function () {
        loadObjs();
    });

    //Rotazione verso l'alto
    document.getElementById("rotateUpButton").addEventListener("click", function() {
        rotateUp();
    });
    
    //Rotazione verso il basso
    document.getElementById("rotateDownButton").addEventListener("click", function() {
        rotateDown();
    });

    //Rotazione verso destra
    document.getElementById("rotateRightButton").addEventListener("click", function() {
        rotateRight();
    });

    //Rotazione verso sinistra
    document.getElementById("rotateLeftButton").addEventListener("click", function() {
        rotateLeft();
    });

    //Pulsante per iniziare animazione (rotazione automatica)
    document.getElementById("startAnimation").addEventListener("click", function() {
        isAnimating = true;

        //Si disegna una nuova scena con l'animazione
        requestAnimationFrame(drawSceneAnimate);
    });

    //Per fermare l'animazione
    document.getElementById("stopAnimation").addEventListener("click", function() {
        isAnimating = false;
    });

    //Gestione eventi di movimento delle mesh tramite tastiera
    //w o freccia su -> rotazione verso l'alto
    //s o freccia giù -> rotazione verso il basso
    //d o freccia dx -> rotazione verso destra
    //a o freccia sx -> rotazione verso sinistra
    //spazio -> nuova texture
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
        //Ruota il modello verso l'alto (antiorario)
        targetModelXRotationRadians += Math.PI / 22.5; //Incrementa la rotazione X per la prima mesh
        targetModelXRotationRadians2 += Math.PI / 22.5; //Incrementa la rotazione X per la seconda mesh
        console.log('rotateUpButton');
        drawScene(); //Aggiorna la scena con la nuova rotazione
    }
    
    function rotateDown() {
        //Ruota il modello verso il basso (orario)
        targetModelXRotationRadians -= Math.PI / 22.5; //Decrementa la rotazione X per la prima mesh
        targetModelXRotationRadians2 -= Math.PI / 22.5; //Decrementa la rotazione X per la seconda mesh
        console.log('rotateDownButton');
        drawScene(); //Aggiorna la scena con la nuova rotazione
    }
    
    function rotateRight() {
        //Ruota il modello verso destra (orario)
        targetModelYRotationRadians += Math.PI / 22.5; //Incrementa la rotazione Y per la prima mesh
        targetModelYRotationRadians2 -= Math.PI / 22.5; //Decrementa la rotazione Y per la seconda mesh
        console.log('rotateRightButton');
        drawScene(); //Aggiorna la scena con la nuova rotazione
    }
    
    function rotateLeft() {
        //Ruota il modello verso sinistra (antiorario)
        targetModelYRotationRadians -= Math.PI / 22.5; //Decrementa la rotazione Y per la prima mesh
        targetModelYRotationRadians2 += Math.PI / 22.5; //Incrementa la rotazione Y per la seconda mesh
        console.log('rotateLeftButton');
        drawScene(); //Aggiorna la scena con la nuova rotazione
    }

    //Funzione per disegnare la scena statica
    function drawScene() {
        //Configura la viewport specificando che l'area di rendering inizia dall'angolo (0, 0) 
        //e copre l'intera dimensione della canvas (width e height).
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        
        //Abilita il back-face culling scartando le facce dei poligoni che sono rivolte nella direzione opposta 
        //rispetto alla telecamera, migliorando le prestazioni di rendering.
        gl.enable(gl.CULL_FACE);
        
        //Abilitando il depth test, WebGL confronta la profondità di ciascun frammento con il valore presente 
        //nel depth buffer. Solo i frammenti con profondità minore o uguale a quella già memorizzata nel depth buffer 
        //vengono scritti sullo schermo. Questo meccanismo è fondamentale per la corretta gestione della sovrapposizione 
        //degli oggetti nella scena 3D.
        gl.enable(gl.DEPTH_TEST);
        
        //Aggiorna la rotazione del modello con interpolazione
        modelXRotationRadians += (targetModelXRotationRadians - modelXRotationRadians) * 0.1;
        modelYRotationRadians += (targetModelYRotationRadians - modelYRotationRadians) * 0.1;
        
        //Pulisce il color buffer (colore di ogni pixel) e il depth buffer (memorizza la profondità di ogni frammento)
        //prima di disegnare la nuova scena
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        //Crea la matrice di modellazione per la prima mesh
        var matrix1 = m4.translate(m4.identity(), -1.0, 0.3, 0.5); // Trasla a sinistra
        matrix1 = m4.xRotate(matrix1, modelXRotationRadians);
        matrix1 = m4.yRotate(matrix1, modelYRotationRadians);
        //Invia la matrice al vertex shader
        gl.uniformMatrix4fv(matrixLocation, false, matrix1);
        //Disegna la mesh
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
        
        //Stessa cosa per la seconda mesh
        var modelMatrix2 = m4.identity();
        modelMatrix2 = m4.translate(modelMatrix2, 0.9, 0.3, 0.5); //Trasla a destra
        modelMatrix2 = m4.xRotate(modelMatrix2, targetModelXRotationRadians2);
        modelMatrix2 = m4.yRotate(modelMatrix2, targetModelYRotationRadians2);
        gl.uniformMatrix4fv(matrixLocation, false, modelMatrix2);
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
            
        //Controlla la presenza di errori WebGL
        var error = gl.getError();
        if (error !== gl.NO_ERROR)
            console.error('Errore WebGL:', error);
        
        requestAnimationFrame(drawScene);
    }
    
    //Funzione per disegnare la scena animata
    function drawSceneAnimate(time){
        
        //Configura la viewport specificando che l'area di rendering inizia dall'angolo (0, 0) 
        //e copre l'intera dimensione della canvas (width e height).
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        
        //Abilita il back-face culling scartando le facce dei poligoni che sono rivolte nella direzione opposta 
        //rispetto alla telecamera, migliorando le prestazioni di rendering.
        gl.enable(gl.CULL_FACE);
        
        //Abilitando il depth test, WebGL confronta la profondità di ciascun frammento con il valore presente 
        //nel depth buffer. Solo i frammenti con profondità minore o uguale a quella già memorizzata nel depth buffer 
        //vengono scritti sullo schermo. Questo meccanismo è fondamentale per la corretta gestione della sovrapposizione 
        //degli oggetti nella scena 3D.
        gl.enable(gl.DEPTH_TEST);
        
        //Se isAnimating è false si interrompe la scena animata e si torna alla normale
        if (!isAnimating)
            return;

        //Converte il tempo in secondi
        time *= 0.001;
        //Si calcola il delta del tempo, sottraendo tempo precedente e attuale
        var deltaTime = time - then;
        //Si salva il tempo corrente per il prossimo frame
        then = time;

        //Si anima la rotazione andando a moltiplicare i radianti di rotazione di entrambe le mesh, su entrambi gli assi, per una costante e per il delta time
        modelXRotationRadians += -0.7 * deltaTime;
        targetModelXRotationRadians += -0.7 * deltaTime;
        targetModelXRotationRadians2 += -0.7 * deltaTime;
        modelYRotationRadians -= 0.7 * deltaTime;
        targetModelYRotationRadians += -0.7 * deltaTime;
        targetModelYRotationRadians2 -= -0.7 * deltaTime;

        //Pulisce il color buffer (colore di ogni pixel) e il depth buffer (memorizza la profondità di ogni frammento)
        //prima di disegnare la nuova scena
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        //Crea la matrice di modellazione per la prima mesh
        var matrix1 = m4.translate(m4.identity(), -1.0, 0.3, 0.5); // Trasla a sinistra
        matrix1 = m4.xRotate(matrix1, modelXRotationRadians);
        matrix1 = m4.yRotate(matrix1, modelYRotationRadians);
        //Invia la matrice al vertex shader
        gl.uniformMatrix4fv(matrixLocation, false, matrix1);
        //Disegna la mesh
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
        
        //Stessa cosa per la seconda mesh
        var modelMatrix2 = m4.identity();
        modelMatrix2 = m4.translate(modelMatrix2, 0.9, 0.3, 0.5); //Trasla a destra
        modelMatrix2 = m4.xRotate(modelMatrix2, targetModelXRotationRadians2);
        modelMatrix2 = m4.yRotate(modelMatrix2, targetModelYRotationRadians2);
        gl.uniformMatrix4fv(matrixLocation, false, modelMatrix2);
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
            
        //Controlla la presenza di errori WebGL
        var error = gl.getError();
        if (error !== gl.NO_ERROR)
            console.error('Errore WebGL:', error);
        
        requestAnimationFrame(drawSceneAnimate);
    }

    //Funzione per il caricamento degli OBJ
    function loadObjs() {
        //Array di mesh
        var mesh = [];

        //Si calcola indice random
        var index = Math.floor(Math.random() * objs.length);
        
        //Si inseriscono all'interno dell'array due mesh
        mesh.push({ sourceMesh: 'data/' + objs[index] });
        mesh.push({ sourceMesh: 'data/' + objs[index] });
        LoadMesh(gl, mesh[0]);
        LoadMesh(gl, mesh[1]);
        console.log(objs[index]);
    }
}

main();