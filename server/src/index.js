import express from 'express';
import { engine } from 'express-handlebars'
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import flash from 'connect-flash';
import methodOverride from 'method-override';
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

import models, { sequelize } from './models/sequelize.js';
import routes from './routes/routes.js'
import errorHandler from './middlewares/errorHandler.js';
import passport from 'passport';
import setPassport from './middlewares/passport.js';
import authService from './services/auth.js'
import * as helpers from './views/helpers/hbs-helpers.js'
import customMethodOverride from './middlewares/customMethodOverride.js';


const app = express();
const port = 5000;

// static folder
app.use(express.static(__dirname + 'public'));


// body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))



// passport && session
setPassport(passport, authService.verifyPassword, models.User);

app.use(cookieParser());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 }
}))
app.use(flash())

app.use(passport.initialize());
app.use(passport.session());


// view engine
app.engine('handlebars', engine({
    defaultLayout: 'main',
    helpers: helpers,
    partialsDir: __dirname + '/views/partials'
}));
app.set('view engine', 'handlebars');
app.set('views', './src/views');

// method-override
app.use(methodOverride('_method'))
app.use(customMethodOverride);

// routes
app.use(routes);

// errors
app.use(errorHandler);

sequelize.sync({ alter: true })
    .then(() => {
        console.log('Database connection has been established');
        const server = app.listen(port, () => console.log(`Server is running on port: ${port}`));
    })
    .catch((err) => console.log('Unable to connect to the database', err));
