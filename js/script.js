
//zmienna globalna
const svgNS = "http://www.w3.org/2000/svg";

const octave =[
["c",       130.812784,     "w"],
["cis",     138.591317,     "b"],
["d",       146.832385,     "w"],
["dis",     155.563493,     "b"],
["e",       164.81378,      "w"],
["f",       174.614118,     "w"],
["fis",     184.997213,     "b"],
["g",       195.99772,      "w"],
["gis",     207.652351,     "b"],
["a",       220.000002,     "w"],
["ais",     233.081883,     "b"],
["b",       246.941653,     "w"],
["c1",  	261.625568,     "w"],
["cis1",	277.182634,     "b"],
["d1",	    293.664771,     "w"],
["dis1",	311.126987,     "b"],
["e1",	    329.62756,      "w"],
["f1",	    349.228235,     "w"],
["fis1",	369.994427,     "b"],
["g1",	    391.99544,      "w"],
["gis1",	415.304702,     "b"],
["a1",	    440.000005,     "w"],
["ais1",	466.163766,     "b"],
["b1",	    493.883306,     "w"],
["c2",      523.251136,     "w"],
["cis2",    554.365268,     "b"],
["d2",      587.329542,     "w"],
["dis2",    622.253974,     "b"],
["e2",      659.255121,     "w"],
["f2",      698.45647,      "w"],
["fis2",    739.988853,     "b"],
["g2",      783.99088,      "w"],
["gis2",    830.609404,     "b"],
["a2",      880.000009,     "w"],
["ais2",    932.327533,     "b"],
["b2",      987.766613,     "w"],

];

//------------------------------------------------------------------------------
//KLASY

class Synth
{
    static audioCtx = new AudioContext();
    static waveform = "sine"; //sine, square, sawtooth, triangle

}

class Sound 
{
    constructor(freq, note = "") 
    {
        this.freq = freq;
        this.noteName = note; 
        this.osc = null;
    }

    start() 
    {
        if (this.osc) return;
        this.osc = Synth.audioCtx.createOscillator();
        this.osc.type = Synth.waveform; 
        this.osc.frequency.value = this.freq;
        this.osc.connect(Synth.audioCtx.destination);
        this.osc.start();
    }

    stop() 
    {
        if (!this.osc) return;
        this.osc.stop();
        this.osc.disconnect();
        this.osc = null;
    }
}

class Key
{
    static noteNameHeight = 15;
    static wWidth = 50;
    static wHeight = 150;
    static bWidth = 30;
    static bHeight = 100; 

    constructor(sound, type, x, y)
    {

        //parametry wynikające z koloru
        let width = 0;
        let height = 0;
        let colorFill = "white";
        let cssClass = "";
        let textColor = "";

        switch (type)
        {
            case "w":
                width = Key.wWidth;
                height = Key.wHeight;
                colorFill = "white";
                cssClass = "white unpressed";
                textColor = "white";
                break;
            case "b":
                width = Key.bWidth;
                height = Key.bHeight;
                colorFill = "black";
                cssClass = "black unpressed";
                textColor = "black";
                break;
        }

        //utworzenie svg
        this.svg = document.createElementNS(svgNS, "svg");
        this.svg.setAttribute("x", x);
        this.svg.setAttribute("y", y);
        this.svg.setAttribute("width", width);
        this.svg.setAttribute("height", height + Key.noteNameHeight);
        this.svg.style.userSelect = "none";

        //utworzenie klawisza w svg
        this.rect = document.createElementNS(svgNS, "rect");
        this.rect.setAttribute("y", Key.noteNameHeight);
        this.rect.setAttribute("width", width);
        this.rect.setAttribute("height", height);
        this.rect.setAttribute("stroke", "black");
        this.rect.setAttribute("class", "key " + cssClass);
        this.rect.sound = sound;
        this.rect.setAttribute("id", sound.noteName);
        this.svg.appendChild(this.rect);

        //dodanie symbolu tonacji
        this.text = document.createElementNS(svgNS, "text");
        this.text.setAttribute("x", "50%");
        this.text.setAttribute("y", 10);
        this.text.setAttribute("text-anchor", "middle");
        this.text.setAttribute("font-family", "Arial");
        this.text.setAttribute("class", "noteName " + cssClass);
        this.text.textContent = sound.noteName;
        this.svg.appendChild(this.text);

        //dodanie eventów związanych z dźwiękiem
        this.addSound();

    }

    //przekazanie głównego obiektu obrazka
    getSvg()
    {
        return this.svg;
    }

    //wprowadzanie dźwięków
    addSound(){

        const startEvents = ["mousedown", "pointerdown"];
        const stopEvents = ["mouseup", "mouseleave", "pointerup", "pointercancel", "pointerleave"];

        startEvents.forEach(
            e => this.rect.addEventListener(
                e, 
                () => {
                    this.rect.sound.start();
                    //zmiana koloru klawisza
                    this.rect.classList.remove("unpressed");
                    this.rect.classList.add("pressed");
                    //zmiana koloru ttonacji
                    this.text.classList.remove("unpressed");
                    this.text.classList.add("pressed");
                }
                
            )
        );

        stopEvents.forEach(
            e => this.rect.addEventListener(
                e, 
                () => {
                    this.rect.sound.stop();
                    //zmiana koloru klawisza
                    this.rect.classList.remove("pressed");
                    this.rect.classList.add("unpressed");
                    //zmiana koloru tonacji
                    this.text.classList.remove("pressed");
                    this.text.classList.add("unpressed");
                }
            )
        );

    }

}

class Keyboard{

    static keyboardWidth = Key.wWidth * octave.flat().filter(item => item === 'w').length;
    static keyboardHeight = Key.wHeight + Key.noteNameHeight;
    static keyboardPadding = 10; //wartość podawana z ręki

    constructor(x,y){

        //klawiatura
        this.keyBoard = document.createElementNS(svgNS, "svg");
        this.keyBoard.setAttribute("id","keyboard");
        // this.keyBoard.setAttribute(
        //     "viewBox", 
        //     "0 0 " + String(Keyboard.keyboardWidth + Keyboard.keyboardPadding ) 
        //     + " " + String( Keyboard.keyboardHeight + Keyboard.keyboardPadding ) );
        this.keyBoard.setAttribute("x", x);
        this.keyBoard.setAttribute("y", y);

        //tlo dla klawiatury
        this.rect = document.createElementNS(svgNS, "rect");
        this.rect.setAttribute("id","keyboardBackground");
        this.rect.setAttribute("width", Keyboard.keyboardWidth + Keyboard.keyboardPadding);
        this.rect.setAttribute("height", Keyboard.keyboardHeight + Keyboard.keyboardPadding);

        this.keyBoard.appendChild(this.rect);

        //utwowrzenie klawiszy i kolekcji
        const white = [];
        const black = [];
        let xPos = Keyboard.keyboardPadding / 2;
        let yPos = Keyboard.keyboardPadding / 2;

        //listy klawiszy
        for(let i =0; i < octave.length; i++)
        {
            if (octave[i][2] == 'w'){
                const key = new Key(new Sound(octave[i][1], octave[i][0]), 'w', xPos, yPos);
                white.push(key);
                xPos += Key.wWidth; 
            } else if (octave[i][2] == 'b')
            {
                xPos -= Key.bWidth / 2; 
                const key = new Key(new Sound(octave[i][1], octave[i][0]), 'b', xPos, yPos);
                black.push(key);
                xPos += Key.bWidth / 2; 
            }

        }
        //dodanie klawiszy
        while (white.length){
            this.keyBoard.appendChild(white.pop().getSvg());
        }
        while (black.length){
            this.keyBoard.appendChild(black.pop().getSvg());
        }

        //document.body.appendChild(keyBoard);

    }

    getSvg(){
        return this.keyBoard;
    }

}

class Logo
{
    constructor(x,y)
    {
        this.logo = document.createElementNS(svgNS, "svg");
        this.logo.setAttribute("width", 200);
        this.logo.setAttribute("height", 120);
        this.logo.setAttribute("x",x);
        this.logo.setAttribute("y",y);
        const circlePath = document.createElementNS(svgNS, "path");
        circlePath.setAttribute("d","M 80,110 m -30,0 a 50,50 0 1,1 60,0");
        circlePath.setAttribute("fill", "none")
        circlePath.setAttribute("id","circlePath");
        this.logo.appendChild(circlePath);
        const logoText = document.createElementNS(svgNS, "text");
        logoText.setAttribute("fill", "black");
        this.logo.appendChild(logoText);
        const logoTextPath = document.createElementNS(svgNS, "textPath");
        logoTextPath.setAttribute("href", "#circlePath");
        logoTextPath.setAttribute("textLength", "100%");
        logoTextPath.setAttribute("startOffset", "10%");
        logoTextPath.setAttribute("lengthAdjust", "spacingAndGlyphs");
        logoTextPath.textContent = "TECHNIKI MULTIMEDIALNE";
        logoText.appendChild(logoTextPath);
        const authorText = document.createElementNS(svgNS, "text");
        authorText.setAttribute("fill","black");
        authorText.textContent = "Tomasz Kutrzeba";
        authorText.setAttribute("x", "40%");
        authorText.setAttribute("y", "100%");
        authorText.setAttribute("text-anchor", "middle");
        this.logo.appendChild(authorText);
    }

    getSvg()
    {
        return this.logo;
    }

}
class Space {

    static spaceWidth = Keyboard.keyboardWidth + Keyboard.keyboardPadding + 10;
    static spaceHeight = Keyboard.keyboardHeight + Keyboard.keyboardPadding + 10 + 10 + 120;

    constructor()
    {

        this.space = document.createElementNS(svgNS, "svg");
        this.space.setAttribute(
            "viewBox", 
            "0 0 " + String(Space.spaceWidth) 
            + " " + String(Space.spaceHeight));
        this.board = document.createElementNS(svgNS, "rect");
        this.board.setAttribute("id", "board");
        this.board.setAttribute("width", Space.spaceWidth);
        this.board.setAttribute("height",Space.spaceHeight);
        this.space.appendChild(this.board);
    }
    getSvg()
    {
        return this.space;
    }
}

class Wave {

    constructor(){

        this.shape = document.createElementNS(svgNS, "svg");
        this.shape.setAttribute("width", 300);
        this.shape.setAttribute("height", 125);
        this.shape.setAttribute("x", 200);
        this.shape.setAttribute("y", 0);

        this.text = document.createElementNS(svgNS, "text");
        this.text.setAttribute("x","0");
        this.text.setAttribute("y","15%");
        this.text.textContent = "Fala akustyczna:";
        this.shape.appendChild(this.text);

        this.sine = document.createElementNS(svgNS, "path");
        this.sine.setAttribute("d", "M0 42.5 C4.375 35 13.125 35 17.5 42.5 C21.875 50 30.625 50 35 42.5 C39.375 35 48.125 35 52.5 42.5 C56.875 50 65.625 50 70 42.5 C74.375 35 83.125 35 87.5 42.5 C91.875 50 100.625 50 105 42.5");
        this.sine.setAttribute("class", "shape checked");
        this.sine.wave = "sine";
        this.shape.appendChild(this.sine);

        this.rectangle = document.createElementNS(svgNS, "polyline");
        this.rectangle.setAttribute("points","0,70 15,70 15,55 30,55 30,70 45,70 45,55 60,55 60,70 75,70 75,55 90,55 90,70 105,70");
        this.rectangle.setAttribute("class", "shape");
        this.rectangle.wave = "square";
        this.shape.appendChild(this.rectangle);

        this.sawTooth = document.createElementNS(svgNS, "polyline");
        this.sawTooth.setAttribute("points","0,95 20,80 20,95 40,80 40,95 60,80 60,95 80,80 80,95 100,80 100,95");
        this.sawTooth.setAttribute("class", "shape");
        this.sawTooth.wave = "sawtooth";
        this.shape.appendChild(this.sawTooth);

        this.triangle = document.createElementNS(svgNS, "polyline");
        this.triangle.setAttribute("points","0,120 15,105 30,120 45,105 60,120 75,105 90,120 105,105 ");
        this.triangle.setAttribute("class", "shape");
        this.triangle.wave = "triangle";
        this.shape.appendChild(this.triangle);

        this.addCheck();

    }

    getSvg()
    {
        return this.shape;
    }

    addCheck()
    {
        const shapes = [this.sine, this.rectangle, this.sawTooth, this.triangle];

        shapes.forEach(s => {
            s.addEventListener("click", () => {
                document.querySelector(".shape.checked").classList.remove("checked");
                s.classList.add("checked");
                Synth.waveform = s.wave;
            });
        });

    }

}

//---------------------------------------------------------------------------
//MAIN

const space = new Space().getSvg();
space.appendChild((new Keyboard(5,130)).getSvg());
space.appendChild((new Logo(0,0)).getSvg());
space.appendChild((new Wave()).getSvg());
document.body.appendChild(space);







