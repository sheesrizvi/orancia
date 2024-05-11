const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Wishlist = require("../models/wishlistModel");

const addWishlistItems = asyncHandler(async (req, res) => {
  const { items, user } = req.body;
  const wishlist = Wishlist.find({user: user})
  if (wishlist) {
    const olditems = wishlist.items
    const newitems = olditems.concat(items)
    wishlist.items = newitems
    const updatedWishlist = await wishlist.save()
    res.json(updatedWishlist)
  } else {
    const wishlist = await Wishlist.create({
        user, items
    })
    res.json(wishlist)
  }
});

const deleteWishlistItems = asyncHandler(async (req, res) => {
    const {items, user} = req.body
    const wishlist = await Wishlist.find({user: user});
    if (wishlist) {
        wishlist.items = wishlist.items.filter(i => !items.includes(i))
      res.json({ message: "Item removed" });
    } else {
      res.status(404);
      throw new Error("wishlist not found");
    }
  });


module.exports = {deleteWishlistItems, addWishlistItems}