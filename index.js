const express = require('express');
const app = express();
const multer = require("multer");
const path = require("path");
const mongoose = require('mongoose');
// Define the Mongoose schema for your data
const mySchema = new mongoose.Schema({
  name: String,
  age: Number,
  profile_url: String
});

// Define the Mongoose model for your data
const MyModel = mongoose.model('MyModel', mySchema);

// storage engine 

const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1048576 // 1 MB in bytes
    }
})
app.use('/profile', express.static('upload/images'));
app.post("/upload", upload.single('profile'), (req, res) => {

    // Create a new instance of your Mongoose model with the data you want to save
    const newData = new MyModel({
      name: req.body.name,
      age: req.body.age,
      profile_url: `http://localhost:3001/profile/${req.file.filename}`
    });

    // Save the data to the database using the save() method
    newData.save()
      .then(() => {
        res.json({
            success: 1,
            message: 'Data saved successfully'
        });
      })
      .catch(error => {
        res.json({
            success: 0,
            message: error.message
        });
      });
});

function errHandler(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        res.json({
            success: 0,
            message: err.message
        })
    }
}
app.use(errHandler);

// Connect to your MongoDB database
mongoose.connect('mongodb://localhost/my_database', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Start the server once the database connection is established
    app.listen(3001, () => {
        console.log("Server up and running");
    });
  })
  .catch(error => console.error('Error connecting to MongoDB:', error));
