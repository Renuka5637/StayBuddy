const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner ,validateListing} = require("../middleware.js");

const listingController = require("../controllers/listings.js");
const multer  = require('multer')//Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files. It is written on top of busboy for maximum efficiency.
// Multer will not process any form which is not multipart (multipart/form-data).

const {storage} = require("../cloudConfig.js");
const upload = multer({ storage })// now stores in cloudinary storage.this gives us multer method where in uploads folder files will be stored.
// it will automatically create a uploads folder
// upload.single('avatar'): // req.files is array of `photos` files
  // req.body will contain the text fields, if there were any
router
.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn,  upload.single('listing[image]'), validateListing,wrapAsync(listingController.createListing));


//New Route
router.get("/new", isLoggedIn,listingController.renderNewForm)


router
.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn,isOwner, upload.single('listing[image]'),validateListing,wrapAsync(listingController.updateListing))
.delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));



//Edit Route
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.renderEditForm));




module.exports = router;