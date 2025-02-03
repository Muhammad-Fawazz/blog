const mongoose = require("mongoose");
const { data } = require("./data.js");
const Blog = require("../models/blog.js");

const mongoURL = "mongodb://127.0.0.1:27017/blog";

mongoose.connect(mongoURL)
    .then(() => console.log("Connected!"))
    .catch((err) => console.error("MongoDB connection error:", err));


const initDB = async () => {
    try {
        await Blog.deleteMany({});
        const initData = data.map((obj) => ({ ...obj, owner: "679dead1d213cc9f145b9072" }))
        await Blog.insertMany(initData);
        console.log("Data initialized successfully.");

        mongoose.connection.close();
        console.log("Database connection closed.");
    } catch (error) {
        console.error("Error initializing database:", error);
    }
}

initDB();

