const mongoose = require('mongoose');
const slugify = require('slugify');
//const validator = require('validator');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A Tour Must Have a Name'],
      unique: true,
      trim: true,
      maxlength: [
        40,
        'A Tour name must have less or equal 40 Characters ',
      ],
      minlength: [
        10,
        'A Tour name must have more or equal 10 Characters ',
      ],
      // validate: [
      //   validator.isAlpha,
      //   'Tour Name Contains Only Letter',
      // ],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating Must Be Above 1.0'],
      max: [5, 'The Rating Must Be Below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      required: [true, 'A Tour Must Hava A Duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A Tour Must Have Group Size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A Tour Must Have Difficulty Level'],
      enum: ['easy', 'medium', 'difficult'],
      message: 'Difficulty is Either Easy Medium , Difficult',
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      required: [true, 'A Tour Must Have a Price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this Keyword  only points to current  doc on NEW document Creation not on UPDATE Query
          return val < this.price;
        },
        message:
          "The Discount Price ({VALUE}) Can't Be More Than Price",
      },
    },
    summary: {
      type: String,
      trim: true, //Removes All The White Spaces From The String
      required: [true, 'A Tour Must Have a Description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, ' A Tour Must Have A Cover Image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    slug: String,
    startLocation: {
      //GeoSpatial Data Like Coordinates are Stored in GeoJson Data
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], //Longitude - Lattitude
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          deafault: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        adresse: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//Virtula Populate

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

//Document Middleware TODO:
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) =>
//     User.findById(id)
//   );
//   this.guides = await Promise.all(guidesPromises);
// });

// tourSchema.pre('save', function (next) {
//   console.log('Will Save Document');
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

//Query Middleware
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (next) {
  console.log(`The Query Took${Date.now() - this.start} ms`);
});

//Agrregation Middleware
// tourSchema('aggregate', function (next) {
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
