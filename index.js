var express = require('express');
var session= require('express-session');
var fs=require('fs');
var app = express();
var ini = require('ini');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var PORT = process.env.PORT || 3000;
//var User = require('./user-model');
var uuid = require('uuid');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(express.static(__dirname + '/web'));
app.use(session({secret: 'aaassshhhhh',saveUninitialized: true,resave: true}));

//app.engine('html', require('html').renderFile);



var user=[
    {
        "username":"intesa",
        "password":"intesa"
    },

    {
        "username":"selfbi",
        "password":"selfbi"
    },
    {
        "username":"user3",
        "password":"user3"
    },
];





var ses;

app.get('/', function(req, res){
    ses=req.session;
    if(ses.username
    ){
        res.redirect('/main')
    }else{
        res.render('/index.html');
    }
});


app.post('/login', function(req, res){
              if(user.some(function(u){
                  return u.username=== req.body.username && u.password===req.body.password;
                  })){
                ses = req.session;
                ses.username = req.body.username;
                res.redirect('/main');
            } else {
                res.redirect('/');
            }
});
app.get('/main', function(req, res){
    ses=req.session;
    if(ses.username){
        res.sendFile(__dirname +'/views/main.html');
        //res.redirect('views/main.html');
        //console.log(ses);
    }else{
        res.redirect('/login');
    }
});

app.post('/logout',function(req,res){
    req.session.destroy(function(err) {
        if(err) {
            //console.log(err);
        } else {
            res.redirect('/');
        }
    });

});

app.get('/languages', function(req , res){
    //var id = req.parms.id;
    //var data =require('./data/languages.json');
    fs.readFile('./data/languages.json', 'utf-8', function(err, data){
        if(err)throw err;
        res.send(data);
    });
});

app.get('/jsonTable', function(req , res){
//var id = req.parms.id;
//var data =require('./data/languages.json');
    fs.readFile('./data/data-sample.json', 'utf-8', function(err, data){
        if(err)throw err;
        res.send(data);
    });
});

/**
 *GET
 * /all-translations
 **/
app.get('/all-translations', function(req , res){
    ses=req.session;
    if(ses.username) {
        res.send(getLangJson());
    }
});
/**
 * get/read valid language from languages.json
 * read from each languages path file and retrieve their properties
 * return a json with language properties
 *
 * **/
function getLangJson()
{
    try {
        var sourcePath= "./data";
        var fileName="/l10n.properties";

        if (fs.existsSync(sourcePath + "/languages.json"))
        {
            //Lettura linguaggi validi dal file json languages.json
            var LangJSON=JSON.parse(fs.readFileSync(sourcePath + "/languages.json"));
            //console.log(LangJSON.length);

            //#####MAX ci vorrebbe una map a due livelli e nessun gioco con le stringhe
            var langHashMap = new Object();
            //inizializzo il riferimento all hashmap object
            putDataLangToHashMap(sourcePath+"/base.properties",langHashMap,"base",true);

            //popolo hashmap object con tutte le lingue valide
            //#####MAX così i viene dichiarato come variabile globale, va ustao let (o var) - fatto
            for(let i=0;i<LangJSON.length;i++){
                //console.log(LangJSON[i].hasKeyFlag);
                putDataLangToHashMap(sourcePath+"/"+LangJSON[i].id+"/"+fileName,langHashMap,LangJSON[i].id,false);
                if(LangJSON[i].hasKeyFlag){
                    putDataLangToHashMap(sourcePath+"/"+LangJSON[i].id+"_desc"+"/"+fileName,langHashMap,LangJSON[i].id+"_desc",false);

                }
            }
            //console.log(langHashMap);

            //generazione il risultato json dall'hashmap
            var jsonOutput={"translations": [], error:false, message:null};
            for (var key in langHashMap) {
                //console.log(langHashMap[key]);
                jsonOutput.translations.push(langHashMap[key]);
            }
            //console.log(jsonOutput);
            return jsonOutput;
        }else
        {
            throw "directory '"+sourcePath + "/languages.json' inesistente";
        }
    }
    catch(err) {
        return {error:true,message:err};
    }

}
/***
 * args
 * pathFile: dir+file path to read
 * hashMapStructure: target data structure
 * isBaseProperty: if true initialize, else add property to initialized structure
 * */
function putDataLangToHashMap(pathFile,hashMapStructure,langId,isBaseProperty)
{
    if (fs.existsSync(pathFile))
    {
        var content=String(fs.readFileSync(pathFile));
        //console.log(content);
        //console.log(filePath.split("/")[2]);

        //#####MAX Per gestire i path usare il package path
        //#####MAX Fragile usare il terzo elemento così estraendolo dal path, molto meglio passare l'id della linguga e comporre qua dentro il path - fatto
        var lang=langId;
        const lines= content.split(/\r?\n/);
        //console.log(lines);

        if(isBaseProperty)
        {
            for (let line of lines){
                if(line!==""){
                    const keyValue=line.split('=');
                    const valueLine= line.substr(line.indexOf("=") + 1);
                    //#####MAX perchè concateniamo le stringhe? questo rende tutto più complicato e comunque può creare problemi con i caratteri per cui fare escape - fatto
                    hashMapStructure[keyValue[0]]={"key":keyValue[0]};
                    hashMapStructure[keyValue[0]]["base"]=valueLine;
                    //console.log(hashMapStructure);
                }
            }
        }else
        {
            for (var key in hashMapStructure) {
                var currentValue=null;
                for (let line of lines){
                    if(line!==""){
                        const keyValue=line.split('=');
                        const valueLine= line.substr(line.indexOf("=") + 1);
                        if(keyValue[0]===key)
                        {
                            currentValue=valueLine
                        }
                    }
                }
                hashMapStructure[key][lang]=currentValue;
                //console.log(obj);
                //console.log(key);
            }
        }

    }else {
        if(isBaseProperty){
            throw "directory '"+pathFile + "' inesistente";
        }
    }
}

/**
 *
 * /translations
 **/
app.post('/translation', function (req, res) {
    const body = req.body;
    const key=req.body.key;
    const language=req.body.language;// I want to Check "base"
    const translation=req.body.translation;
    res.set('Content-Type', 'application/json');
    //console.log(req.body);
    var response=upsertLangFile(key,language,translation);
    res.send(response);

    logService("/translation POST",JSON.stringify(req.body),JSON.stringify(response));


});

/**
 * Method
 * inputs:
 *      key - key to search
 *      lang - lang directory/file to search
 *      value - value to upsert into the gived key
 *
 * return example:
 *      {status: Error/Value Updated, error:true/false, message: "error message"}
 * **/
function upsertLangFile(key,lang,value)
{
    try{
        if(!key){
            throw "mandatory key field"
        }


        let pathFile="./data/"+lang+"/l10n.properties";
        if (fs.existsSync(pathFile)){

            //read file values
            let fileContent=String(fs.readFileSync(pathFile));
            let lines= fileContent.split(/\r?\n/);
            let isKeyFounded=false;
            let isSameValue=false;
            for (i=0;i<lines.length;i++){
                if(lines[i]!==""){
                    const keyLine=lines[i].split('=')[0];
                    const valueLine= lines[i].substr(lines[i].indexOf("=") + 1);
                    if(key===keyLine){
                        lines[i]=keyLine+"="+value;
                        //console.log("matched"+"newline: "+keyLine+"="+value);
                        isKeyFounded=true;
                        if(valueLine===value){
                            isSameValue=true;
                        }
                    }
                }
            }
            newFileContent=lines.join('\r\n');
            //console.log(newFileContent);
            //write file values
            if(isKeyFounded){
                if(!isSameValue){
                    fs.writeFile(pathFile, newFileContent, function(err) {
                        if (err) throw err;
                    });
                }
            }else{
                fs.appendFileSync(pathFile, "\r\n"+key+"="+value);
            }
            return {status:"Value Updated",error:false,message:null};

        }else{
            //path del language file non trovato
            throw "language path '"+pathFile+"' not founded"
        }
    }catch(err){
        return {status: "Error", error:true, message: err};
    }

}



/**
 *
 * /translations header checkbox update
 **/
app.post('/updateIsReadyLang', function (req, res) {
    const body = req.body;
    const language=req.body.language;// I want to Check "base"
    const isReady=req.body.isReady;
    res.set('Content-Type', 'application/json');

    //console.log(req.body);
    res.send(updateIsReadyLang(language,isReady));




});

function updateIsReadyLang(lang,isReady){
    try {
        var sourcePath= "./data";
        if (fs.existsSync(sourcePath + "/languages.json"))
        {
            var keyFound=false;

            //Lettura linguaggi validi dal file json languages.json
            var LangJSON=JSON.parse(fs.readFileSync(sourcePath + "/languages.json"));

            for(let i=0;i<LangJSON.length;i++){
                if(LangJSON[i].id==lang){
                    //console.log(LangJSON[i].id);
                    LangJSON[i].isReady=isReady;
                    keyFound=true;
                }
            }
            fs.writeFile(sourcePath + "/languages.json", JSON.stringify(LangJSON, null, "\t"), function(err) {
                if (err) throw err;
            });


            if(keyFound){
                return {"error": false,"message": ""};
            }else{
                return {"error": true,"message": "language parameter not found"};
            }


        }else
        {
            throw "directory '"+sourcePath + "/languages.json' inesistente";
        }
    }
    catch(err) {
        return {error:true,message:err};
    }
}


/**
 *
 * /translations table value checkbox update
 **/
app.post('/updateKeyFlagLang', function (req, res) {
    const body = req.body;

    const language=req.body.language;// I want to Check "base"
    const Key=req.body.key;
    const KeyFlag=req.body.keyflag;
    res.set('Content-Type', 'application/json');

    // console.log(req.body);


    var response=upsertLangFile(Key,language+"_desc",KeyFlag)
    res.send(response);

    logService("/updateKeyFlagLang POST",JSON.stringify(req.body),JSON.stringify(response));


});


app.post('/updateFormData' , function(req , res){
    //updateTranslationData(req);
    var key = req.body.key;
    var base=req.body.base;
    var translation= req.body.translation;

    if (translation== translation){

        res.redirect('/main.html');

    }else{
        res.redirect('/login.html');
    }

});


/*
    User.findOne({username: req.body.username}, function (err, user) {
        if (user) {
            // user found in db
            if (user.password === req.body.password) {
                create_session(req, res);

                 res.redirect('/home.html');

            } else {

                res.send('incorrect password');
            }
        }

        /*
        else {
            // user not found in db
            var new_user = new User({
                username: req.body.username,
                password: req.body.password
            });

            new_user.save( function (err, data) {
               //res.redirect('/');
                create_session(req, res);
            });
        }   *
    }); */

/**
 * log sul file service.log
 * dati loggati:
 * - service,
 * - request,
 * - response*/
function logService(service,req,res){

    var dt = new Date();
    var timeStamp = dt;

    var date=dt.getDate();
    var month=dt.getMonth()+1;
    var year=dt.getFullYear();
    var fullDate= (date+"-"+month+"-"+year);

    //date format as yyyymmdd
    var timeStampDay=fullDate;


    var logLine=timeStamp+";"+service+";"+req+";"+res;
    logLine = logLine.replace(/\r/g, "");

    var filePath='service_'+timeStampDay+'.log';
    fs.exists(filePath, (exists) => {
        if (exists) {

            fs.appendFile(filePath, "\n"+logLine, (err) => {
                if (err) throw err;
                //console.log('The "data to append" was appended to file!');
            });
        } else {
            fs.writeFile(filePath, logLine, (err) => {
                if (err) throw err;
                console.log('New file '+filePath+' has been saved!');
            });
        }
    });

}



/*
* /moveLangFile
* GET method that copy languages file into another directory
* */
app.get('/moveLangFile', function(req , res){
    var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));
    //console.log(config.langTargetPATH);
    var response=moveLangFile(config.langTargetPATH);
    res.send(response);

    logService("/moveLangFile GET",null,JSON.stringify(response));

});

function moveLangFile(targetDir){
    try {
        var sourcePath= "./data";
        var fileName="/l10n.properties";

        var jsonOutput={error:false, message:null};

        if (fs.existsSync(sourcePath + "/languages.json"))
        {
            //Lettura linguaggi validi dal file json languages.json
            var LangJSON=JSON.parse(fs.readFileSync(sourcePath + "/languages.json"));

            for(let i=0;i<LangJSON.length;i++){

                //se il path della lingua esiste, escludendo il path della descrizione
                if (fs.existsSync(sourcePath +"/"+ LangJSON[i].id+"/l10n.properties")&&LangJSON[i].id!="description")
                {
                    //console.log(LangJSON[i].id);

                    var readStream = fs.createReadStream(sourcePath +"/"+ LangJSON[i].id+"/l10n.properties");

                    //console.log("i: "+targetDir+"/"+LangJSON[i].id+"/l10n.properties");
//crea target path se non esiste
                    if (!fs.existsSync(targetDir+"/"+LangJSON[i].id)){
                        //console.log("non esiste: "+targetDir+"/"+LangJSON[i].id+"/l10n.properties");
                        fs.mkdirSync(targetDir+"/"+LangJSON[i].id, 0744)
                    }

                    readStream.pipe(fs.createWriteStream(targetDir+"/"+LangJSON[i].id+"/l10n.properties"));
                }
            }
            return jsonOutput;
        }else
        {
            throw "directory '"+sourcePath + "/languages.json' inesistente";
        }
    }
    catch(err) {
        return {error:true,message:err};
    }
}

/*
* /retrieveBaseLang
* GET method that retrieve base languages file into the current projct
* */
app.get('/retrieveBaseLang', function(req , res){

    var response=retrieveBaseLang();
    res.send(response);

    logService("/retrieveBaseLang GET",null,JSON.stringify(response));

});

function retrieveBaseLang(){
    try{
        var jsonOutput={error:false, message:null};
        var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));
        var sourcePathFile=config.langSourceBaseFilePATH;
        console.log(sourcePathFile);
        if(fs.existsSync(sourcePathFile)){
            var readStream = fs.createReadStream(sourcePathFile);
            readStream.pipe(fs.createWriteStream("./data/base.properties"));
        }

        return jsonOutput;
    }catch(err){
        return {error:true,message:err};
    }

}


app.listen(PORT);
console.log('Listening on port ' + PORT);