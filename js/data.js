var nbquestions =5
var LEVELDATA=[
    {
        "question": "Quel est le nom du premier réseau de communication de transfert de paquets ?",
        "ans":"arpanet",
    },
    {
        "question": "Quel est le nom du premier ordinateur commerciale IBM ?",
        "ans":"IBM 701",
    },
    {
        "question": "Quel est le nom de l'attaque qui a utilisé des ransomwares en 2017 ?",
        "ans":"wannacry",
    },
    {
        "question": "Donnez le nom de l'attaque existante : \"Moew\" ou \"Wouf\" ?",
        "ans":"moew",
    },
    {
        "question": "Combien de documents confidentiels ont fuitée pendant l'attaque de Panama Papers ? (en millions)",
        "ans":"11,5",
    },
    {
        "question": "Quel platforme de streaming à subit une fuite de données massive ?",
        "ans":"twitch",
    },
    {
        "question": "Quel est l'année d'invention du premier circuit integré?",
        "ans":"1958",
    },
    {
        "question": "Quel famille de système d'exploitation fut créé en 1991",
        "ans":"Linux",
    },
    {
        "question": "Quand fut fondé Facebook? (l'année)",
        "ans":"2004",
    },

]

function shuffle_array(array){
    for(let i= array.length-1; i>0;i--){
        const j = Math.floor(Math.random()*(i + 1))
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

shuffle_array(LEVELDATA)
LEVELDATA = LEVELDATA.slice(0, nbquestions)