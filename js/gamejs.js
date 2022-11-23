
class GameEngine{
    /* 
    class for the main game engine. Must be called Once.
    Will create the differente pages of the game.
    */
    constructor(){
        this.initialised=0;
        this.imgBank={};
        this.onLoadFuncs={};
        this.objects={};
        this.actions={}
        GameObject.setengine(this);
        this.init();
    }
    
    init(){
        let objects=document.getElementsByClassName("_object");
        let toinitialise = [];
        for (let object of objects){
            let objectname = object.dataset["object"]
            objectname = objectname.toLowerCase()
            let obj =this.createObject(objectname, object.dataset["id"], object, null, false)
            if(obj){
                let params=null
                if(object.dataset["params"]){
                    params= JSON.parse(object.dataset["params"])
                }
                toinitialise.push([obj,params])
            }
        }
        for (let list of toinitialise){
            if(list[1]){
                try{
                    list[0].init(...list[1])
                }
                catch(e){console.warn(e)}
            }
            else{
                try{
                    list[0].init()
                }
                catch(e){console.warn(e)}
            }
        }
        this.initialised=1;
    }

    createObject(objectname, id=null, element=null, params=null, initialise=true){
        if (objectname in OBJECT_CLASSES){
            let obj = new OBJECT_CLASSES[objectname](id, element)
            if(initialise){
                if(params){
                    obj.init(...params)
                }
                else{
                    obj.init()
                }
            }
            return obj
            /*
            catch(e){
                console.log(`object not created. objectname:${objectname}, exception:${e}`)
                return null
            }
            */
        }
        else{
            return null
        }
    }

    addObject(id, object){
        this.objects[id]=object
    }
    getObject(id){
        return this.objects[id]
    }

    createAction(actionname, func){
        try{
            this.actions[actionname].push(func)
        }
        catch(e){
            this.actions[actionname]=[func]
        }
    }

    activateAction(...params){
        console.warn(params)
    }

    loadimg(imgname){
        var image= new Image()
        image.src= `../Images/${imgname}`
        image.onload= ()=>{
            this.imgBank[imgname]=image
            for (let onloadfunc of this.onLoadFuncs[imgname]){
                onloadfunc(imgname)
            }
        }
    }
    getimage(imgname, onloadfunc=null){
        console.warn("getting img: ", imgname)
        if (imgname in this.imgBank){
            return this.imgBank[imgname]
        }
        else{
            if(onloadfunc){
                if (imgname in this.onLoadFuncs){
                    this.onLoadFuncs[imgname].push(onloadfunc)
                }
                else{
                    this.onLoadFuncs[imgname]=[onloadfunc]
                }
            }
            return 0
        }
    }
}

class GameObject{
    /*
    Main class for all game objects. Every element of the game must extend from this class
    */
    static engine = null;
    static objectcounter=0;

    constructor(id=null, element=null){
        this.engine=GameObject.engine;
        this.active=false;
        if (id){
            this._id =id;  
        }
        else{
            this._id=GameObject.objectcounter;
            GameObject.objectcounter+=1;
        }
        if (element){
            this._element =element;
        }
        this.engine.addObject(this._id, this);
    }

    getId(){
        return this._id;
    }
    
    setStyle(style){
        this._element.style=style;
    }
    setActive(active){
        this.active=active;
    }
    createElement(type){
        this._element=document.createElement(type);
    }

    appendToElement(child){
        this._element.appendChild(child)
    }

    static setengine(engine){
        GameObject.engine=engine;
    }
}

class NavBar extends GameObject{
    init(){
        this.activepage= null;
        this.pages=null;
    }
    
    addPage(pageid, page){
        if (!this.pages){
            this.pages={}
            this.pages[pageid]=page
            this.activatePage(pageid)
        }
        else{
            this.pages[pageid]=page
        } 
    }

    activatePage(pageid){
        if (this.activepage){
            this.pages[this.activepage].hide();
        }
        this.pages[pageid].show();
        this.activepage=pageid;
    }

    createButton(pageid){
        let button = document.createElement("button");
        button.master = this
        button.classList.add("btn-game-page");
        button.innerText=pageid;
        button.addEventListener("click",function(){
            this.master.activatePage(pageid)
        });
        this._element.appendChild(button);
    }
}

class Page extends GameObject{
    /*
    Main class for a page.
    */
    init(navbarid){
        this._element.classList.add("game-page")
        this.navbar=this.engine.getObject(navbarid)
        this.navbar.addPage(this._id, this)
        this.navbar.createButton(this._id);
    }

    show(){
        this._element.classList.add("active");
    }
    hide(){
        this._element.classList.remove("active");
    }
}

/* Console */
class Console extends GameObject{
    init(msg=null){
        this.locked=0;
        this.setStyle(`width: 1000px; box-sizing: border-box; height: 600px;
        background: linear-gradient(180deg, #bbb 2.5%, #151515 2.5%); margin: 0 auto;
        border-top-right-radius: 5px;border-top-left-radius: 5px; zindex: 1`);
        let fakebuttons= document.createElement("div");
        fakebuttons.innerHTML=`<div class="fakeButtons"></div>
        <div class="fakeButtons fakeMinimize"></div>
        <div class="fakeButtons fakeZoom"></div>`;
        this.consoleBox=document.createElement("div");
        this.consoleBox.style=`display:block; overflow-y:scroll;height:95%;`;
        this._element.appendChild(fakebuttons);
        this._element.appendChild(this.consoleBox);
        this._element.setAttribute("tabindex",0);
        this.consolemessage = this.engine.createObject("consolemessage", null, null, [this, msg])
        this.consoleuserinput= this.engine.createObject("consoleuserinput", null, null, [this])
        if(msg){
            this.createMessage(msg);
        }
        this._element.addEventListener("keydown", this.userevent.bind(this));
        this.commands={
            "?":"${HELP}",
			"hackcess":"${HACKCESS_RES}"
        };
        this.variables={
            "HELP":"Help context",
            "DEFAULT": "Commande non reconnue.",
            "CORRECT_ANS": "Bonne réponse, vous passez au niveau suivant",
            "BAD_ANS":"mauvaise réponse, essayez encore.",
            "FINISH": "Bravo vous avez finit!",
			"HACKCESS_RES": "https://aladecouverteducyber.hackcess.org/"
        };
        this.levels=[];
        this.activeLevelIndex=0
        this.activeLevel=null;
        this.initLevels();
    }

    initLevels(){
        try{
            for(let leveldata of LEVELDATA){
                this.levels.push(this.engine.createObject("level",null, null,[this, leveldata]));
                this.loadlevel()
            }
        }catch(e){
            console.warn("error in levels init: ",e);
        }
    }

    loadlevel(){
        this.activeLevel=this.levels[this.activeLevelIndex]
        this.activeLevel.setUp()
    }

    userevent(e){
        if (!this.locked){
            if(e.keyCode==8){
                this.consoleuserinput.delete_char();
            }
            else if((e.keyCode>64 && e.keyCode<91)||(e.keyCode>47 && e.keyCode<58)||e.keyCode==32||e.keyCode==188){
                e.preventDefault();
                this.consoleuserinput.add_char(e.key);
            }
            if(e.keyCode==13){
                this.lock()
                let uinput = this.consoleuserinput.finish();
                if (uinput in this.commands){
                    let line = this.interpret(this.commands[uinput]);
                    this.createMessage(line);
                }
                else{
                    let res = this.activeLevel.interpret(uinput);
                    let line ="";
                    if (res){
                        if(this.activeLevelIndex==this.levels.length-1){
                            line = this.interpret(this.variables["FINISH"]);
                            this.createMessage(line);
                        }
                        else{
                            line = this.interpret(this.variables["CORRECT_ANS"]);
                            this.activeLevelIndex+=1;
                            this.createMessage(line);
                            this.loadlevel();
                        }
                    }
                    else{
                        line = this.interpret(this.variables["BAD_ANS"]);
                        this.createMessage(line);
                    }
                }
                this.unlock()
            }
        }
    }

    interpret(line){
        let matches = [...line.matchAll(/(\$\{)(\w*)(\})/g)]
        for(let match of matches){
            try{
                line = line.replace(match[0], this.variables[match[2]])
            }catch(e){
                console.warn(e)
            }
        }
        return line
    }
    createMessage(msg){
        this.lock();
        this.consolemessage.setMsg(msg)
        this.consolemessage.create_elem()
    }
    finishMessage(){
        this.unlock()
        this.consoleuserinput.create_elem()
    }
    add_element(element){
        this.consoleBox.appendChild(element)
        this.consoleBox.scrollTop = this.consoleBox.scrollHeight
    }
    lock(){
        this.locked=1;
    }
    unlock(){
        this.locked=0;
    }
    setVariable(variablename, value){
        this.variables[variablename]=value;
    }
}

class ConsoleMessage extends GameObject{
    init(console, msg=null){
        this.parent=console;
        this.msg=msg;
    }
    setMsg(msg){
        this.msg=msg;
    }
    create_elem(){
        this.pointer=0;
        this.createElement("div");
        this.parent.add_element(this._element);
        this.animation= setInterval(this.draw.bind(this),10);
    }
    draw(){
        this._element.innerHTML= this.msg.slice(0, this.pointer)
        if(this.pointer==this.msg.length){
            clearInterval(this.animation)
            this.parent.finishMessage()
        }
        this.pointer+=1
    }
}

class ConsoleUserInput extends GameObject{
    init(console){
        this.blink=0;
        this.parent=console;
        this.userinput="";
        this.cursor="&#9646;";
    }
    create_elem(){
        this.createElement("div");
        this.userinput=""
        this._element.innerHTML='>';
        this.parent.add_element(this._element);
        this.animation= setInterval(this.draw.bind(this),400);
    }
    draw(){
        if (this.blink){
            this._element.innerHTML='>'+this.userinput+this.cursor;
            this.blink=0
        }else{
            this._element.innerHTML='>'+this.userinput;
            this.blink=1
        }
    }
    add_char(char){
        this.userinput=this.userinput+char
        this.draw()
    }
    delete_char(){
        this.userinput = this.userinput.slice(0, -1)
        this.draw()
    }
    get(){
        return this.userinput
    }
    finish(){
        this._element.innerHTML='>'+this.userinput;
        clearInterval(this.animation);
        return this.userinput
    }
}
class Level extends GameObject{
    init(console, settings){
        this.parent = console;
        this.settings = settings;
    }
    setUp(){
        if("question" in this.settings){
            this.parent.setVariable("HELP", this.settings["question"])
        }
    }
    interpret(uinput){
        if(uinput.toLowerCase() == this.settings["ans"].toLowerCase()){
            return 1
        }
        else{
            return 0
        }
    }
}


class Player extends GameObject{
    init(consoleid){
        this.console = this.engine.getObject(consoleid);
    }
}


function initGame(gameframe){
    new GameEngine(gameframe);
}

var OBJECT_CLASSES={
    "navbar":NavBar,
    "page":Page,
    "console": Console,
    "consoleuserinput": ConsoleUserInput,
    "consolemessage": ConsoleMessage,
    "level": Level
}

var gameframe=document.getElementById("game-frame");

if (gameframe){
    initGame(gameframe);
}
else{
    console.warn('Engine not initialised');
}


/* 

class Scene extends GameObject{
    init(){
        this.scene=this._element;
        this._element.className+= " game-scene"
        this.listeners={};
        this.scene.style.width="100%";
        this.scene.style.height="800px";
        this.scrollx=0;
        this.scrolly=0;
        window.addEventListener('keydown', this.update.bind(this));
        this.scene.addEventListener('mousedown', this.update.bind(this));
        this.scene.addEventListener('mouseover', this.update.bind(this));
        this.scene.addEventListener('mousemove', this.update.bind(this));
        this.scene.addEventListener("contextmenu", e => e.preventDefault());
    }

    update(event){
        if (event.type=='keydown'){
            if (event.code in this.listeners){
                for (let listener of this.listeners[event.code]){
                    listener[0](...listener.slice(1,listener.length))
                }
            }
        }
        if (event.type=='mouseover'){
            if ('mouseover' in this.listeners){
                for (let listener of this.listeners['mouseover']){
                    listener[0](...listener.slice(1,listener.length))
                }
            }
        }
        if (event.type=='mousedown'){
            let rect = this.scene.getBoundingClientRect();
            if (event.button in this.listeners){
                for (let listener of this.listeners[event.button]){
                    listener[0]([this.scrollx+event.clientX-rect.left, this.scrolly+event.clientY-rect.top], ...listener.slice(1,listener.length))
                }
            }
        }
        if (event.type=='mousemove'){
        }
    }

    createLayer(){
        let layer = new Layer(this.scene)
        layer.init()
        return layer
    }

    addListener(code, func){
        try{
            this.listeners[code].push(func)
        }
        catch(e){
            this.listeners[code]=[func]
        }
    }
    scroll(dx,dy){
        this.scrollx+=dx
        this.scrolly+=dy
        if(this.scrollx>this.scene.scrollWidth-this.scene.offsetWidth){
            this.scrollx=this.scene.scrollWidth-this.scene.offsetWidth
        }
        else if(this.scrollx<0){
            this.scrollx=0
        }
        if(this.scrolly>this.scene.scrollHeight-this.scene.offsetHeight){
            this.scrolly=this.scene.scrollHeight-this.scene.offsetHeight
        }
        else if(this.scrolly<0){
            this.scrolly=0
        }
        this.scene.scroll(this.scrollx,this.scrolly)
    }
}

class SceneObject extends GameObject{
    constructor(scene){
        super()
        this.scene=scene
    }
    addEvent(event, func){
    }
}

class Layer extends SceneObject{
    init(){
        this.canvases={};
        this.createElement("div");
        this._element.style.position="absolute";
        this.scene.appendChild(this._element);
    }
    createCanvas(imgname=null, pos=[0,0]){
        let canvas = new Canvas(this.scene);
        canvas.init(this, pos)
        if (imgname){
            this.engine.loadimg(imgname);
            canvas.setimg(imgname);
        }
        return canvas._id
    }
    createTextCanvas(imgname){
        var canvas = new Canvas(this, pos);
        if (imgname){
            this.engine.loadimg(imgname);
            canvas.setimg(imgname);
        }
        this.addcanvas(canvas);
    }
    addcanvas(canvas){
        this.canvases[canvas._id]=canvas
    }
}
class Canvas extends SceneObject{
    init(layer, pos=[0,0]){
        this.layer=layer;
        this.createElement("canvas")
        this._element.style.position="absolute"
        this.context=this._element.getContext("2d")
        this.pos=pos;
        this.grid=0;
        this.layer._element.appendChild(this._element)
        this.setpos()
    }
    setimg(imgname){
        let img = this.engine.getimage(imgname, this.setimg.bind(this));
        if (img !=0){
            this.render(img);
        }
    }
    move(x,y){
        this.pos[0]=x;
        this.pos[1]=y;
        this.setpos()
    }
    setpos(){
        this._element.style.left=`${this.pos[0]}px`
        this._element.style.top=`${this.pos[1]}px`
    }
    setsize(width, height){
        this._element.width=width;
        this._element.height=height;
    }
    render(img){
        this.setsize(img.naturalWidth, img.naturalHeight)
        this.context.drawImage(img, 0, 0)
        if (this.grid){
            let y = 0;
            let x = 0;
            this.context.lineWidth = 0.3;
            this.context.strokeStyle='black'
            while (y<this._element.height){
                x=0;
                while(x<this._element.width){
                    this.context.strokeRect(x,y,this.cell_size, this.cell_size);
                    x+=this.cell_size;
                }
                y+=this.cell_size;
            }
        }
    }
    hide(){
        this._element.style.display = "none";
    }
    show(){
        this._element.style.display = "block";
    }
    set_grid(cell_size){
        this.grid=1
        this.cell_size=cell_size
    }
}

class TextCanvas extends Canvas{

}

class Ui extends GameObject{
    init(){
        
    }
    createButton(){}
}


async function getJson(filename){
    response = await fetch("/jsondata",{
        method: 'POST',
        headers: {
            'content-Type': "application/x-www-form-urlencoded"
        },
        body: `datafile=${filename}`
    })
    return response.json()
}

*/