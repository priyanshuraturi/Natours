const fs = require('fs');
const mongoose = require('mongoose');
const env = require('dotenv');

const Tour = require('../../models/tourModel');
// const Review = require('../../models/reviewModel');
// const User = require('../../models/userModel');

env.config({ path: '../../config.env' });

const db = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connection Succesful');
  });

const tourData = JSON.parse(
  fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')
);
const userData = JSON.parse(
  fs.readFileSync(`${__dirname}/users.json`, 'utf-8')
);
const reviewData = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);
//IMPORT DATA INTO DATABASE
const importData = async () => {
  try {
    await Tour.create(tourData);
    //await User.create(userData, { validateBeforeSave: false });
    // await Review.create(reviewData);
    console.log('Data Succesfully Logged');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

//DELETE ALL THE DATA FROM THE COLLECTION
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    //await User.deleteMany();
    // await Review.deleteMany();
    console.log('Data Succesfully Deleted');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

console.log(process.argv);
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
