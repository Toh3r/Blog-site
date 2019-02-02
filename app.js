//Import libraries
var express          = require("express"),
	app              = express(),
	bodyParser       = require("body-parser"),
	mongoose         = require("mongoose"),
	methodOverride   = require("method-override"),
	expressSanitizer = require("express-sanitizer");

//Connect to DB
mongoose.connect("mongodb://localhost/restful_blog_app");

//configure app
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
//express-sanitizer - always after body-parser
app.use(expressSanitizer());
app.use(methodOverride("_method"));

//configure mongo/mongoose
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

//ROOT route
app.get("/", function(req, res){
	//redirect to blogs page
	res.redirect("/blogs");
})

//INDEX route
app.get("/blogs", function(req, res){
	//get blogs from DB
	Blog.find({}, function(err, blogs){
		if(err){
			console.log(err);
		} else { //render index.ejs page with blogs (blog data) from DB
			res.render("index", {blogs: blogs})
		}
	});
});

//CREATE ROUTE
app.post("/blogs", function(req, res){
	//Sanatize body of blog(don't allow <script> tags)
	req.body.blog.body = req.sanitize(req.body.blog.body);
	//Create blog (add blog to DB)
	Blog.create(req.body.blog, function(err, newBlog){
		if(err){
			//Go back to new.ejs page
			res.render("new");
		} else {
			//redirect to blog page
			res.redirect("/blogs");
		}
	});
});

//NEW ROUTE
app.get("/blogs/new", function(req, res){
	//Show form to enter a new blog
	res.render("new");
});

//SHOW ROUTE
app.get("/blogs/:id", function(req, res){
	//Get particular (clicked) blog from db using id
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		} else {
			res.render("show", {blog: foundBlog});
		}
	});
});

//EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		} else {
			//pass through details of blog so they can be displayed on edit page
			res.render("edit", {blog: foundBlog})
		}
	});
});

//UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	//Update the selected blog
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if(err){
			res.redirect("/blogs");
		} else {
			//Go back to show page displaying updated blog
			res.redirect("/blogs/" + req.params.id);
		}
	});
});

//DELETE ROUTE
app.delete("/blogs/:id", function(req, res){
	//Destroy blog using its unique id
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs");
		}
	});
});

//Listen on port 2200
app.listen("2200", function(){
	console.log("Server is running on port 2200...");
});