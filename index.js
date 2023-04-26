const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');

//Initalizing the database.
const Database = require('./ContactDB');
const db = new Database();
db.initialize();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.locals.pretty = true;

//Middleware to attach the database to the request object
app.use((req, res, next) => {
    req.db = db;
    next();
});

//Middleware for sessions.
app.use(session({
    secret: 'cmps369',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}))

app.use(flash());

//Middleware to allow the pug templates to see the session.
app.use((req, res, next) => {
    if (req.session.user) {
        res.locals.user = {
            id: req.session.user.ID,
            first_name: req.session.user.First_Name,
            last_name: req.session.user.Last_Name
        }
    }
    next();
})

app.set('view engine', 'pug');

//Handles the routing for public directory.
app.use(express.static('public'))

//Handles all the routes dealing with obtaining the contacts.
app.use('/contacts', require('./routes/contacts'));

//Handles all the routes dealing with accounts.
app.use('/', require('./routes/accounts'));

//Handles the routes dealing with contact creation.
app.use('/create', require('./routes/create_contact'));

//Handles all the routes dealing with specific contact IDs.
app.use('/', require('./routes/ID'));

//Handles the routes dealing with the home page.
app.use('/', (req, res) => {
    res.render('home', {msg: req.flash('msg')});
});

/*
//Handles all the routes dealing with specific contact IDs.
app.use('/', require('./routes/ID'));
*/

app.listen(8080, () => {
    console.log('Server is running on port 8080')
});
