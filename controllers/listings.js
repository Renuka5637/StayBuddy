const Listing = require("../models/listing")

module.exports.index = async (req,res) => {
   const allListings = await Listing.find({});
   res.render("listings/index.ejs",{allListings});
}

module.exports.renderNewForm = (req,res) => {
    console.log(req.user);
    
     res.render("listings/new.ejs");
}

module.exports.showListing = async (req,res) => {
    let {id} = req.params;
    const listing =  await Listing.findById(id).populate({path:"reviews",populate:{ path:"author"}}).populate("owner");
    if(!listing){
       req.flash("error"," Stay you requested for does not exist!");
       return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs",{listing});
}

module.exports.createListing = async(req,res,next) => {

    let url = req.file.path;
    let filename = req.file.filename;
    console.log(url,"..",filename);

    if(typeof req.body.listing.image === "string"){
        req.body.listing.image = { url:
            req.body.listing.image.url

        }
    }
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url,filename};
    await newListing.save();
    req.flash("success","New Stay Created!");
    res.redirect("/listings");

}

module.exports.renderEditForm = async (req,res) => {
    let {id} = req.params;
    const listing =  await Listing.findById(id);
    if(!listing){
       req.flash("error"," Stay you requested for does not exist!");
       return res.redirect("/listings");
    }
    res.render("edit.ejs",{listing});
}

module.exports.updateListing = async (req,res) => {
    let {id} = req.params;
    let listing =  await Listing.findByIdAndUpdate(id,{...req.body.listing});
   
    if( typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url,filename};
    await listing.save();
    }

    req.flash("success"," Your stay  is updated!");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing =  async (req,res) => {
    let {id}  = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success"," Stay Deleted!");
    res.redirect("/listings");
} 