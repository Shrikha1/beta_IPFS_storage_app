const ipfsClient = require('ipfs-http-client');
const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const fs = require('fs'); //package present in node.js (no need to install)
const files = require('ipfs-http-client/src/files');

const ipfs = new ipfsClient({host: 'localhost', port: '5001', protocol: 'http'});
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(fileUpload());

app.get('/', (req,res) => {
    res.render('welcome_login');
});

app.post('/upload', (req,res) =>{
    const file = req.files.file;
    const fileName = req.body.fileName;
    const filePath = 'files/'+fileName;

    //download the file from the server
    file.mv(filePath, async(err) => {
        if(err) {
            console.log('Error: failed to download the file');
            return res.status(500).send(err);
        }

        const fileHash = await addFile(fileName, filePath);
        fs.unlink(filePath, (err) => {
            if(err) console.log(err);
        });

        // rendering the page
        res.render('upload', {fileName, fileHash});
        
    })
});

const addFile = async(fileName, filePath) => {
    const file = fs.readFileSync(filePath); //buffer of the actual file using file path 
    const fileAdded = await ipfs.add({path: fileName, content: file});
    //console.log(fileAdded.cid.toString());
    // hash is the content identifier of the fileName
    const fileHash = fileAdded.cid.toString();

    return fileHash;
}

app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});

