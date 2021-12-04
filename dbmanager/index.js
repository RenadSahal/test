const mysql = require('mysql2');
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const fs = require('fs');
const csv = require('fast-csv');
const multer = require('multer')
const path = require('path')
const db = require('./dbConnection');
const { register } = require('./controllers/registerController');
const routes = require('./routes');
app.use(express.json());
app.use(routes);
const logger = require('./logger')


db.connect((err) => {
    if (!err)
        console.log('DB Connected');
    else
        console.log(err);
        logger.log({ level: "error", message: err });
});
app.listen(3000, () => console.log("Server is on port 3000"));


//APIS 
app.get('/db/files', (req, res) => {
    db.query('SELECT * FROM files', (err, rows, fields) => {
        logger.log({ level: "info", message: "get files from db" });
        if (!err)
        
            res.send(rows)
        else
            console.log(err);
            logger.log({ level: "error", message: err });

    })
});
app.get('/db/user', (req, res) => {
    db.query('SELECT * FROM user', (err, rows, fields) => {
        logger.log({ level: "info",   message: "get user from db" });;
        if (!err)
        
            res.send(rows)
        else
            console.log(err);
            logger.log({ level: "error", message: err });
    })
});

//Delete According to file ID 
app.delete('/db/files/delete/:id',(req,res)=>{

     db.query("DELETE FROM files WHERE File_ID = ?", [req.body.File_ID], (err, rows, fields) => {
        logger.log({ level: "info", message: "delete" }); 
        if (!err)
            res.send(rows);
        else
            console.log(err);
    }); 
 });
//Adding new file 
app.post('/db/files/add', (req, res) => {

    db.query("INSERT INTO files(File_Name) values (?)", [req.body.File_Name], (err, rows, fields) => {
        logger.log({ level: "info", message: req.body });
        if (!err)
            res.send(rows);
        else{
            console.log(err);
            logger.log({ level: "error", message: err });
        }
    });
});
//update due id to file name 
app.put('/db/files/update', (req, res) => {
    let sql = "UPDATE files SET File_Name = ?  WHERE File_ID = ? ";
    db.query(sql, [req.body.File_Name, req.body.File_ID]);
    res.status(200).json("row edited");
    logger.log({ level: "info", message: req.body }); 

});

app.use(express.static("./public"))
// body-parser middleware use
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))
 
 
db.connect(function (err) {
    if (err) {
        logger.log({ level: "error", message: err.message });
        return console.error('error: ' + err.message);
    }
    console.log('Connected to the MySQL server.');
})
 
//! Use of Multer
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './uploads/')    
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
    
})
 
var upload = multer({
    storage: storage
});
 
 
//route for Home page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// upload csv to database
app.post('/uploadfile', upload.single("uploadfile"), (req, res) =>{
    UploadCsvDataToMySQL(__dirname + '/uploads/' + req.file.filename);

   
})

function UploadCsvDataToMySQL(filePath){
    let stream = fs.createReadStream(filePath);
    let csvData = [];
    let csvStream = csv
        .parse()
        .on("data", function (data) {
            csvData.push(data);
        })
        .on("end", function () {
            // Remove Header ROW
            csvData.shift();
  
            // Open the MySQL connection
            db.connect((error) => {
                if (error) {
                    console.error(error);
                } else {
                    let query = 'INSERT INTO files (File_Name) VALUES ?';
                    db.query(query, [csvData], (error, response) => {
                        console.log(error || response);
                        logger.log({ level: "error", message: error });

                    });
                }
            });
             
            // delete file after saving to MySQL database
            // -> you can comment the statement to see the uploaded CSV file.
            fs.unlinkSync(filePath)
        });
  
    stream.pipe(csvStream);

    console.warn("data Saved");


//create connection
const PORT = process.env.PORT || 8000
app.listen(PORT, () => console.log(`Server is running at port ${PORT}`))
}

//// register and login
    // Handling Errors
    app.use((err, req, res, next) => {
        logger.log({ level: "info", message: req.body });
        logger.log({ level: "error", message: err });
        // console.log(err);
        err.statusCode = err.statusCode || 500;
        err.message = err.message || "Internal Server Error";
        res.status(err.statusCode).json({
          message: err.message,
        });
    });
    
