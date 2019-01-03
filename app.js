 const express        = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    methodOverride  = require("method-override"),
    tool            = require("./models/tool"),
    expressValidator= require("express-validator"),
    expressSession  = require("express-session"),
    multer          = require('multer'),
    GridFsStorage   = require('multer-gridfs-storage'),
    Grid            = require('gridfs-stream'),
    path            = require('path'),
    crypto          = require("crypto"),
//    cloudinary      = require('cloudinary'),
    cookieParser    = require('cookie-parser');
    
    // const storage         = multer.diskStorage({
    //     filename: function (req, file, callback) {
    //             callback(null, Date.now()+file.Originalname);
    //         }
    //     });
                            
    // const imageFilter     = function(req, file, cb){
    //     if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    //     return cb(new Error('Only image files are allowed!'), false);
    // }
    //     cb(null, true);
    // };
    
    // const upload          = multer({storage: storage, fileFilter: imageFilter});
    
// cloudinary.config({ 
//   cloud_name: 'alastairnoble', 
//   api_key: '744287698531812', 
//   api_secret: 'TZI8nNT009rBwiV34ZNlshH7l4I'
// });

mongoose.connect("mongodb://localhost/toolbox");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(methodOverride("_method")); 
app.use(expressValidator());
app.use(cookieParser());
app.use(expressSession({secret:"max", saveUninitialized:false,resave:false}));

const mongoURI = 'mongodb://toolbox:Toolbox69@ds037508.mlab.com:37508/toolbox';
const conn = mongoose.createConnection(mongoURI);

let gfs;

conn.once('open', function () {
  gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');

});

const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads'
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });

app.set("view engine", "ejs");

app.get("/error",function(req,res){
    res.render("errorpage");
});
app.get("/", function(req, res) {
    res.render("home");
});
app.get("/contact", function(req, res) {
    res.render("contact");
});
app.get("/about", function(req, res) {
    res.render("about");
});
app.get("/cookies", function(req, res) {
    res.render("cookies");
});
app.get("/privacy", function(req, res) {
    res.render("privacy");
});
app.get("/legal", function(req, res) {
    res.render("legal");
});

app.get("/sell", function(req, res) {
    res.render("sell", {title:"form validaition", success:false, errors: req.session.errors});
    req.session.errors = null;
});

app.post("/sell", upload.single('image'), function(req, res) {
    // cloudinary.uploader.upload(req.file.path, function(result) {
    //     req.body.tool.image.url = result.secure_url;
    //     req.body.tool.image.id = result.public_id;
        req.body.tool.image = req.file.filename;
        
        
        // req.check("tool.phone","Invalid Phone Number").isMobilePhone("any");
        // req.check("tool.password","Password must be more than 5 characters").isLength({min:5});
        // req.check("tool.price","Price must be a number").isNumeric();
        // req.check("tool.desc","Description cannot be empty").isLength({min:1});
        
        // var errors = req.validationErrors();
        
        // if (errors){
        //         req.session.errors = errors;
        //         res.redirect("/sell")     
        // } 
        // else {
            tool.create(req.body.tool, function(err, newlycreated){
                if(err){
                console.log(err);
                res.render("error page");
                
                }
                else{
                   res.redirect("/buy");  
                }
            });
        // }
    // });
});

app.get("/buy", function(req, res){
    if(req.query.search && req.query.search!="All Tools"&& req.query.keyword){
        const regex = new RegExp(escapeRegex(req.query.keyword), 'gi');
        tool.find({drop: req.query.search, desc: regex}, function (err, sometools){
            if(err){
                console.log(err);
            } else{
            res.render("buy", {tools :sometools});
            }
        });
    }
    else if(req.query.keyword){
            const regex = new RegExp(escapeRegex(req.query.keyword), 'gi');
            tool.find({desc: regex}, function (err, sometools){
                if(err){
                    console.log(err);
                } else{
                res.render("buy", {tools :sometools});
                }
            });  
        }
    else if(req.query.search && req.query.search!="All Tools"){
        tool.find({drop: req.query.search}, function (err, sometools){
            if(err){
                console.log(err);
            } else{
            res.render("buy", {tools :sometools});
            }
        });
    }
    else{
        tool.find({},function(err, alltools){
            if(err){
                console.log(err);
                res.render("errorpage");
            } else{
               res.render("buy", {tools: alltools});
            }
        });
    }
});

app.get('/image/:filename', (req, res) =>{
    gfs.files.findOne({filename: req.params.filename}, (err, file) => {
     if(err){
         res.send(err);
     }
      if(!file || file.length === 0){
          return res.status(404).json({
              err: 'no file exists'
          }); 
      }  
      if(file.contentType === 'image/jpeg' ||file.contentType === 'image/png'){
          const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
      } else {
          res.status(404).json({
              err: 'not an image'
          });
      }
    });
});

app.get("/buy/:id/edit", function(req,res){
    tool.findById(req.params.id, function(err, foundTool){
        if(err){
            res.redirect("errorpage");
        }
        else if(req.query.pass==foundTool.password){
             res.render("edit", {tool: foundTool});
         }else{
            // alert(req.que folder?+ " is the wrong password ass eater faggot head the password is obviously " + foundTool.password);
        }
    });
    
});

app.get("/buy/:id", function(req, res){
    tool.findById(req.params.id, function(err,foundTool){
        if(err){
            console.log(err);
        }else{
            res.render("details", {tool:foundTool});
        }
    });
});

app.put("/buy/:id",function(req,res){
    tool.findByIdAndUpdate(req.params.id, req.body.tool, function(err, updatedTool){
        if(err){
            res.redirect("/errorpage");
        }else{
            res.redirect("/buy/" + req.params.id);
        }
    });
});

app.delete("/buy/:id", function(req, res){
    tool.findByIdAndRemove(req.params.id, function(err){
      if(err){
            res.redirect("/errorpage");
        }else{
            res.redirect("/buy");
        }
    });

});

app.get("*", function(req, res) {
    res.send("you fucked up homo");
});

function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

app.listen(process.env.PORT, process.env.IP, function() { console.log("its running boi") });

//kill -9 $(lsof -i:$PORT -t)