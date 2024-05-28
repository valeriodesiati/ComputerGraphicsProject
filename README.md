<header id="header">

# Relazione Progetto Computer Graphics A. A. 2023/2024

Studente: Valerio Desiati

Matricola: 0001138895

CdS: LM Informatica

</header>

<nav>

*   [Introduzione e obiettivi](#introduzione)
*   [Interfaccia](#interfaccia)
*   [Implementazione](#implementazione)
*   [Riferimenti](#riferimenti)

</nav>

<main>

<section id="introduzione">

## Introduzione e obiettivi

Sviluppare una "3D-WebApp" usando WebGL (HTML5, CSS e contesto webgl), linguaggi JavaScript e GLSL, su browser Chrome.

#### Specifiche richieste

*   Progettazione ed implementazione di un'applicazione 3D interattiva composta da almeno un oggetto principale di tipo mesh poligonale caricato da file (formato OBJ Wavefront).
*   Definizione della scenografia illuminando e texturando gli oggetti della scena.
*   Geometria 3D da visualizzare in proiezione prospettica.
*   Gestione dell'interazione 3D usando sia la tastiera che il mouse e opzionalmente un gamepad.
*   Illuminazione e sfumatura (gli oggetti 3D devono essere illuminati da almeno una luce).
*   Texture mapping (almeno due oggetti 3D devono avere una texture applicata e almeno una deve essere una foto dell'autore).
*   Pannello di controllo su schermo (si preveda un pannello di controllo in cui usando testo e grafica 2D si visualizzino le opzioni a disposizione dell'utente, ecc.).
*   Fruibilità dispositivo mobile (gestione eventi touch).
*   Advanced rendering (opzionale), si preveda l'attivazione/disattivazione di almeno una tecnica di resa avanzata come per esempio: ombre, trasparenze, riflessioni, bump-mapping, ecc.

#### Specifiche implementate

*   Progettazione ed implementazione di un'applicazione 3D interattiva composta da almeno un oggetto principale di tipo mesh poligonale caricato da file (formato OBJ Wavefront).
*   Definizione della scenografia illuminando e texturando gli oggetti della scena.
*   Geometria 3D da visualizzare in proiezione prospettica.
*   Gestione dell'interazione 3D usando sia la tastiera che il mouse e opzionalmente un gamepad.
*   Illuminazione e sfumatura (gli oggetti 3D devono essere illuminati da almeno una luce).
*   Texture mapping (almeno due oggetti 3D devono avere una texture applicata e almeno una deve essere una foto dell'autore).
*   Pannello di controllo su schermo (si preveda un pannello di controllo in cui usando testo e grafica 2D si visualizzino le opzioni a disposizione dell'utente, ecc.).
*   Fruibilità dispositivo mobile (gestione eventi touch).

</section>

<section id="interfaccia">

## Interfaccia
![Alt text](https://github.com/valeriodesiati/ComputerGraphicsProject/blob/main/doc/demo/scena_iniziale.png "Scena iniziale")
Al centro della scena si trovano due oggetti di tipo mesh (file OBJ), adeguatamente texturizzati. L'applicazione delle texture è stata effettuata tramite Blender 4.0\. Gli oggetti sono stati texturizzati con 11 texture diverse (10 tra texture a tinta unita e texture che richiamano lo stile di alcuni materiali e 1 foto dell'autore).

### Controlli a Disposizione dell'Utente

Continuando ad esplorare la scena si trovano tutti i controlli a disposizione dell'utente.

#### A sinistra si trovano

*   Slider per modificare le variabili uniform responsabili dell'illuminazione (così che l'utente possa testare diverse combinazioni).
*   Relativo tasto di reset per reimpostare le luci di default.
*   Slider per modificare il posizionamento della camera.
*   Relativo tasto di reset per reimpostare le coordinate di default della camera.
*   Selettore per decidere cosa muovere con i pulsanti freccia e WASD da tastiera. L'utente può decidere se utilizzare suddetti tasti per il movimento delle mesh o della camera.

#### A destra si trovano

*   Controller per i movimenti degli ingranaggi (in alto, in basso, a destra e a sinistra).
*   Pulsante per modificare in modo randomico la texture delle mesh.
*   Pulsante per iniziare e terminare un'animazione delle mesh.

Video demo interfaccia:  
![Video demo](https://github.com/valeriodesiati/ComputerGraphicsProject/blob/main/doc/demo/demo.mp4 "Video demo")

Notare, come si può evincere anche dal codice sorgente, che l'interfaccia risulta responsive e user - friendly anche in ambiente mobile, è infatti prevista una gestione degli eventi anche su touchscreen.</section>

<section id="implementazione">

## Implementazione

Il progetto è stato realizzato utilizzando principalmente WebGL e Javascript.  
Il file principale è _**rendering.js**_ all'interno della cartella _**resources**_ nella directory dei codici sorgente.  
In questo file, dopo essersi assicurati che WebGL sia supportato e dopo aver acquisito il contesto, si iniziano le operazioni di rendering:

1.  Si caricano i file obj texturizzati.
2.  Si inizia con l'impostazione del programma GLSL, che andrà a sua volta a visualizzare e compilare il vertex shader e il fragment shader.
3.  Successivamente si passa alla creazione e al binding dei buffer per vertici e normali.
4.  Si continua impostando le variabili uniform di default per quanto riguarda l'illuminazione della scena.

Di seguito lo snippet Javascript per l'impostazione delle uniform di default per l'illuminazione della scena:

    diffuse = [0.7, 0.7, 0.7];
    ambient = [1.0, 1.0, 1.0];
    specular = [0, 0, 0];
    emissive = [0.0, 0.0, 0.0];
    u_lightDirection = [0.5, -0.5, 0.5];
    ambientLight = [0.2, 0.2, 0.2];
    colorLight = [1.5, 1.5, 1.5];
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

    var diffuseSlider = document.getElementById("diffuseSlider");
    diffuseSlider.addEventListener("input", function() {
    	var value = parseFloat(diffuseSlider.value);
    	diffuse = [value, value, value];
    	gl.uniform3fv(gl.getUniformLocation(program, "diffuse"), diffuse);
    });

    //altri slider...

Dopo altre operazioni si passa ad impostare la camera sulla scena andando ad impostare la matrice di proiezione, la matrice della camera e la matrice di view.

    var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zmin, 200);
    var cameraPosition = [4.5, 4.5, 2];
    var up = [0, 0, 1];
    var target = [0, 0, 0];
    var cameraMatrix = m4.lookAt(cameraPosition, target, up);
    var viewMatrix = m4.inverse(cameraMatrix); 

    var cameraPositionSliderX = document.getElementById("cameraPositionSliderX");
    cameraPositionSliderX.addEventListener("input", function() {
    	var value = parseFloat(cameraPositionSliderX.value);
    	cameraPosition[0] = value; // Imposta la posizione X della telecamera
    	cameraMatrix = m4.lookAt(cameraPosition, target, up);
    	viewMatrix = m4.inverse(cameraMatrix);
    	gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
    });

    //altri slider...

Si passa quindi alla gestione degli eventi generati dall'interfaccia, nell'ordine:

*   Drag delle mesh tramite mouse.
*   Drag delle mesh tramite touchscreen.
*   Pulsantiera per movimento delle mesh e cambio texture.
*   Gestione per la scelta dell'utente di muovere le mesh o la camera.

Un esempio dei metodi utilizzati per il movimento delle mesh:

    function rotateUp() {
    	targetModelXRotationRadians += Math.PI / 22.5; //Incrementa la rotazione X per la prima mesh
    	targetModelXRotationRadians2 += Math.PI / 22.5; //Incrementa la rotazione X per la seconda mesh
    	console.log('rotateUpButton');
    	drawScene(); //Aggiorna la scena con la nuova rotazione
    }

Un esempio dei metodi utilizzati per il movimento della camera:

    function rotateCameraUp() {
    	//Se è arrivato al limite non fare nulla
    	if(cameraPosition[1] == 10)
    		return;

    	//Altrimenti si incrementa la coordinata Y
    	cameraPosition[1] += 0.5;
    	cameraMatrix = m4.lookAt(cameraPosition, target, up);
    	viewMatrix = m4.inverse(cameraMatrix);
    	gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
    	drawScene(); //Aggiorna la scena con la nuova rotazione

    	//Si regolano gli slider di conseguenza
    	cameraPositionSliderX.value = cameraPosition[0];
    	cameraPositionSliderY.value = cameraPosition[1];
    	cameraPositionSliderZ.value = cameraPosition[2];
    }

Infine, troviamo i due metodi per il rendering della scena, uno per la scena "statica" e uno per la scena "animata". Il funzionamento di questi due metodi è del tutto analogo, viene configurata la viewport, il face culling (per scartare le facce dei poligoni che sono rivolte nella direzione opposta rispetto alla camera, migliorando le prestazioni di rendering) e il depth test (per determinare quali oggetti sono visibili nella scena e quali sono nascosti da altri oggetti).  
Si passa poi all'interpolazione dei valori di rotazione dei modelli, per poter avere un aggiornamento continuo e infine alla creazione delle matrici di modellazione.  

I due metodi sono _drawScene()_ e _drawSceneAnimate(time)_, nella seconda si avvia un'animazione delle mesh tramite il ricalcolo e l'incremento continuo delle coordinate:

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

</section>

<section id="riferimenti">

## Riferimenti

Di seguito un elenco non esaustivo dei riferimenti utilizzati per lo sviluppo di questo progetto:

*   Slide e sorgenti del corso
*   [WebGL Fundamentals](https://webglfundamentals.org/)
*   [Load Obj with Mtl](https://webglfundamentals.org/webgl/lessons/webgl-load-obj-w-mtl.html)
*   [Directional Lighting](https://webglfundamentals.org/webgl/lessons/webgl-3d-lighting-directional.html)

</section>

[Torna su](#header)</main>
