const mongoose = require("mongoose");
const User = require("./models/userModel");
const Post = require("./models/postModal");
const Hashtag = require("./models/hashtagModel");

async function seed() {
  // Create users
  const users = await User.insertMany([
    { name: "Alice Farmer", username: "alice", phone: "+911111111111", password: "hashed", country: "India", region: "Punjab" },
    { name: "Bob Grower", username: "bob", phone: "+922222222222", password: "hashed", country: "Pakistan", region: "Sindh" },
    { name: "Charlie Crops", username: "charlie", phone: "+933333333333", password: "hashed", country: "Bangladesh", region: "Dhaka" }
  ]);

  // Create posts
  await Post.insertMany([
    { userId: users[0]._id, text: "Harvest time! #farming #wheat", type: "update" },
    { userId: users[1]._id, text: "Market prices rising! #market #rice", type: "market" },
    { userId: users[2]._id, text: "Best tips for #equipment maintenance.", type: "tip" }
  ]);

  // Create hashtags
  await Hashtag.insertMany([
    { tag: "farming", postCount: 1 },
    { tag: "wheat", postCount: 1 },
    { tag: "market", postCount: 1 },
    { tag: "rice", postCount: 1 },
    { tag: "equipment", postCount: 1 }
  ]);

  console.log("Seed data inserted.");
  process.exit();
}

mongoose.connect("mongodb://127.0.0.1:27017/farmAI").then(seed);