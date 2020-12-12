const mongoose = require("mongoose");
const passport = require("passport");
const _ = require("lodash");
const router = require("../routes/index.router");
const User = mongoose.model("User");
const ObjectId = require("mongoose").Types.ObjectId;
module.exports.register = (req, res, next) => {
  var user = new User();
  user.fullName = req.body.fullName;
  user.email = req.body.email;
  user.phone = req.body.phone;
  user.password = req.body.password;
  user.save((err, doc) => {
    if (!err) res.send(doc);
    else {
      if (err.code == 11000)
        res.status(422).send(["Duplicate email adrress found."]);
      else return next(err);
    }
  });
};
/// For update
module.exports.edituser = (req, res) => {
  console.log("Edit user");
  console.log(req.params.id);
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`No record with given id : ${req.params.is}`);
  var user = {
    fullName: null,
    email: null,
    phone: null,
  };
  user.fullName = req.body.fullName;
  user.email = req.body.email;
  user.phone = req.body.phone;
  // user.password = req.body.password;
  User.findByIdAndUpdate(
    req.params.id,
    { $set: user },
    { new: true },
    (err, doc) => {
      if (!err) {
        res.send(doc);
      } else {
        console.log("Error in  Update :" + JSON.stringify(err, undefined, 2));
      }
    }
  );
};
module.exports.authenticate = (req, res) => {
  // call for passport authentication
  passport.authenticate("local", (err, user, info) => {
    // error from passport middleware
    if (err) return res.status(400).json(err);
    // registered user
    else if (user) return res.status(200).json({ token: user.generateJwt() });
    // unknown user or wrong password
    else return res.status(404).json(info);
  })(req, res);
};
module.exports.userProfile = (req, res) => {
  User.findOne({ _id: req._id }, (err, user) => {
    if (err)
      return res
        .status(404)
        .json({ status: false, message: "User record not found." });
    else
      return res.status(200).json({
        status: true,
        user: _.pick(user, ["fullName", "email", "phone"]),
      });
  });
};
///delete
module.exports.deleteUser = (req, res, next) => {
  User.findOneAndRemove(req.params.id, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.status(200).json({
        msg: data,
      });
    }
  });
};
