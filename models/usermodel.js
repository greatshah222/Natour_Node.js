const crypto = require('crypto');
// built-in node module so need of any installation
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name'],
  },
  email: {
    type: String,
    required: [true, 'Please Provide Your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please Provide a Valid Email'],
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'An user must have a Password'],
    minlength: [8, 'A password Must have more than 8 character'],
    // password is not displayed to the user
    select: false,
  },
  // validator works only on save and create and not while updating like slugs in the tour controller
  passwordConfirm: {
    type: String,
    required: [true, 'Please Confirm Your Password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Doesnot match with password',
    },
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now(),
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  // for inacitve account
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// to change the password in hash
// it is async function cause hash is async function in password bcrypt
userSchema.pre('save', async function (next) {
  // if the password is not modified or not created
  if (!this.isModified('password')) {
    return next();
  }
  // only run the function if the
  // using bcrypt for changing password and it will also sort the password
  // install bcryptjs from npm
  // 12 is cost and better the password will be encrypted put 12 there. If the number is high the better the encryption but makes slow processing so put 12 their
  // hash is async function
  this.password = await bcrypt.hash(this.password, 12);
  // delete the password Confirm field and not store in db
  this.passwordConfirm = undefined; // we dont want to save it in db so put it undefined
  // required in model means it is required while input
});
// middleware for changing the property of changedPasswordAt
// isNew means just created or the document is new
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  // sometime the pwd change is late in db and if compared with timestamp it will not alllow to login
  // to overcome this problem we will put this property of 2 s in past
  this.passwordChangedAt = Date.now() - 2000;

  next();
});

// query Middleware
// if the user has active:false it will not be shown to the user on find on every find property like fincdand update or findanddelete
userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: true });
  next();
});

// instance method and is available in all the document
// for password check from db while login
// candidate password is the password that the user passes in the body and not hashed and user password is hashed so we use bcrypt.compare
// this.password will not be available becuase this is set to false in our model
// .correctPassword is just the name
// this.password; not possible that is why we have to pass the user password in the function as well
// compare function will return true if the candidatePassword and userPassword are true
userSchema.methods.correctPassword = async function (
  canditatePassword,
  userPassword
) {
  // returns true if pwd is same else false
  // we cant compare manually cause userpassword is hashed and candidate pwd is not hashed
  return await bcrypt.compare(canditatePassword, userPassword);
};
// for checking if user has changed the pwd
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  // we have to change the this.passwordChangedAT to timestamp cause iat is in timestamp and we have to dicide it by 1000 cause one will be in ms and other will be in s like
  // 1588723200000 1588856349
  // 10 is base of parseInt
  // timestamp means (the number of milliseconds since midnight, January 1, 1970 UTC),
  const changedTimeStamp = parseInt(
    this.passwordChangedAt.getTime() / 1000,
    10
  );

  if (this.passwordChangedAt) {
    //console.log(changedTimeStamp, JWTTimestamp);
    // 2020-05-06T00:00:00.000Z 1588856349
    return JWTTimestamp < changedTimeStamp; // it will return true cause the password was changed
  }
  // false means not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  // we need random token
  // creating token of 32 bytes using builtin node module called crypto
  // we  want to save this in db for security so hashing it
  // sha256 is algorithm and update(whatto change into hash) digest(change in hexadecimal like in the string )
  const resettoken = crypto.randomBytes(32).toString('hex');
  // saving the token in db
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resettoken)
    .digest('hex');

  console.log({ resettoken }, this.passwordResetToken);
  // setting time for resset for only 10 minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  // send the plain token to user not the hashed store in db
  return resettoken;
};
// model variable should be capital
const User = mongoose.model('User', userSchema);
module.exports = User;
