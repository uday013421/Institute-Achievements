const express = require('express');
const mongoose = require('mongoose');
const Collection = require("./mongo"); // Your MongoDB model
const path = require("path");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcryptjs = require('bcryptjs');
const { registerPartials } = require('hbs');
const hbs = require('hbs');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

const templatePath = path.join(__dirname, "../templates");
const publicPath = path.join(__dirname, "../public");
const partials_path = path.join(__dirname, "../templates/partials");

app.set('view engine', 'hbs');
app.set("views", templatePath);
app.use(express.static(publicPath));
hbs.registerPartials(partials_path);

// Hash and compare passwords
async function hashPass(password) {
    return await bcryptjs.hash(password, 10);
}

async function compare(userPass, hashPass) {
    return await bcryptjs.compare(userPass, hashPass);
}


// Render the login page
app.get("/", (req, res) => {
    res.render("login");
});
//admin login route
app.get("/adminLogin", (req, res) => {
    res.render("adminLogin");
});
//faculty
app.get("/facultyLogin", (req, res) => {
    res.render("facultyLogin");
});
app.get("/dashadmin", (req, res) => {
    res.render("dashadmin");
});
app.get("/student", (req, res) => {
    res.render("student");
});
// Render the signup page
app.get("/signup", (req, res) => {
    res.render("signup");
});
// Admin Signup Route
app.get("/admin/signup", (req, res) => {
    res.render("adminSignup");
});

// Faculty Signup Route
app.get("/faculty/signup", (req, res) => {
    res.render("facultySignup");
});

app.get("/department/computer", (req, res) => {
    res.render("computerDepartment");
});

// Route for Mechanical department
app.get("/department/mechanical", (req, res) => {
    res.render("mechanicalDepartment"); 
});

// Route for Automobile department
app.get("/department/automobile", (req, res) => {
    res.render("automobileDepartment"); 
});

// Route for Electrical and Computer Science department
app.get("/department/electrical-computer-science", (req, res) => {
    res.render("electricalComputerScienceDepartment"); 
});
app.get("/admin/dashboard", (req, res) => {
    res.render("adminDashboard");
});
app.get("/navbar", (req, res) => {
    res.render("navbar ");
});


// Student Signup Route
app.post("/signup", async (req, res) => {
    try {
        const { email, password, department } = req.body;

        // Check if a student with the same email already exists
        const existingStudent = await Collection.findOne({ email });

        if (existingStudent) {
            return res.status(400).send("Student already exists");
        }

        // Create the new student object
        const data = {
            email,
            password: await hashPass(password), // Hash the password
            role: 'student', // Assign 'student' role
            department // Save department to the database
        };

        // Save the new student to the database
        await Collection.insertMany([data]);

        // Redirect to the selected department after signup
        switch (department) {
            case 'Computer':
                return res.redirect("/department/computer");
            case 'Mechanical':
                return res.redirect("/department/mechanical");
            case 'Automobile':
                return res.redirect("/department/automobile");
            case 'Electrical and Computer Science':
                return res.redirect("/department/electrical-computer-science");
            default:
                return res.send("Department not found");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error signing up student");
    }
});



app.post("/admin/signup", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if an admin with the same email already exists
        const existingAdmin = await Collection.findOne({ email });

        if (existingAdmin) {
            return res.status(400).send("Admin already exists");
        }

        // Create the new admin object
        const data = {
            email,
            password: await hashPass(password), // Hash the password
            role: 'admin' // Assign 'admin' role
        };

        // Save the new admin to the database
        await Collection.insertMany([data]);
        
        // Redirect to admin dashboard after successful signup
        res.render("dashadmin.hbs");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error signing up admin");
    }
});


// Faculty Signup Route
app.post("/faculty/signup", async (req, res) => {
    try {
        const { email, password, department } = req.body;

        // Check if a faculty member with the same email already exists
        const existingFaculty = await Collection.findOne({ email });

        if (existingFaculty) {
            return res.status(400).send("Faculty member already exists");
        }

        // Create the new faculty object
        const data = {
            email,
            password: await hashPass(password), // Hash the password
            role: 'faculty', // Assign 'faculty' role
            department // Save department to the database
        };

        // Save the new faculty to the database
        await Collection.insertMany([data]);
        
        // Redirect to the selected department after signup
        switch (department) {
            case 'Computer':
                return res.redirect("/department/computer");
            case 'Mechanical':
                return res.redirect("/department/mechanical");
            case 'Automobile':
                return res.redirect("/department/automobile");
            case 'Electrical and Computer Science':
                return res.redirect("/department/electrical-computer-science");
            default:
                return res.send("Department not found");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error signing up faculty");
    }
});



// Admin route to create faculty (with department assignment)
app.post("/admin/create-faculty", async (req, res) => {
    try {
        const { email, password, department } = req.body;
        const check = await Collection.findOne({ email });

        if (check) {
            return res.send("Faculty already exists");
        }

        const data = {
            email,
            password: await hashPass(password),
            role: 'faculty',
            department // Save department to the database
        };

        await Collection.insertMany([data]);
        // res.send("Faculty created successfully");
        res.render("adminDashboard", { alertMessage: "Faculty created successfully" });
    } catch (err) {
        console.error(err);
        res.send("Error creating faculty");
    }
});

// Admin login route
app.post("/admin/login", async (req, res) => {
    try {
        const user = await Collection.findOne({ email: req.body.email });

        if (!user || user.role !== 'admin') {
            return res.status(401).send("Admin not found");
        }

        const passCheck = await compare(req.body.password, user.password);

        if (passCheck) {
            // Optionally, you can set a session or a token here if needed

            // Redirect to admin dashboard after successful login
            res.render("dashadmin");
        } else {
            res.status(401).send("Wrong password");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error logging in");
    }
});


// Faculty login route
app.post("/faculty/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the faculty member by email
        const user = await Collection.findOne({ email });

        // Check if the user exists and is a faculty member
        if (!user || user.role !== 'faculty') {
            return res.status(401).send("Faculty not found or not authorized");
        }

        // Compare the provided password with the hashed password in the database
        const passCheck = await compare(password, user.password);

        if (passCheck) {
            // Redirect based on department
            switch (user.department) {
                case 'Computer':
                    return res.redirect("/department/computer");
                case 'Mechanical':
                    return res.redirect("/department/mechanical");
                case 'Automobile':
                    return res.redirect("/department/automobile");
                case 'Electrical and Computer Science':
                    return res.redirect("/department/electrical-computer-science");
                default:
                    return res.send("Department not found");
            }
        } else {
            res.status(401).send("Wrong password");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error logging in");
    }
});


// Student login route
app.post("/student/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the student by email
        const user = await Collection.findOne({ email });

        // Check if the user exists and is a student
        if (!user || user.role !== 'student') {
            return res.status(401).send("Student not found or not authorized");
        }

        // Compare the provided password with the hashed password in the database
        const passCheck = await compare(password, user.password);

        if (passCheck) {
            // Redirect based on department
            switch (user.department) {
                case 'Computer':
                    return res.redirect("/department/computer");
                case 'Mechanical':
                    return res.redirect("/department/mechanical");
                case 'Automobile':
                    return res.redirect("/department/automobile");
                case 'Electrical and Computer Science':
                    return res.redirect("/department/electrical-computer-science");
                default:
                    return res.status(404).send("Department not found");
            }
        } else {
            return res.status(401).send("Wrong password");
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send("Error logging in");
    }
});


// Logout route
app.post("/logout", (req, res) => {
    res.clearCookie("jwt");
    res.redirect("/");
});

// Listen on a specified port
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
