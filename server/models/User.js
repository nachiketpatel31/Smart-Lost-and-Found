const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    collegeId: {
      type: String,
      required: [true, 'College / Student ID is required'],
      unique: true,
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    accountStatus: {
      type: String,
      enum: ['active', 'deactivated'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

// Strip password from JSON representations
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
