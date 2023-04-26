import router from './api/api';
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const handlebars = require('express-handlebars');
const cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser())
app.use('/', router);
app.set('view engine', 'hbs');
app.set('views', __dirname + '/client/private/views/');

app.engine('.hbs', handlebars.engine({
    extname: ".hbs",
    defaultLayout: "main",
    partialsDir: __dirname + "/client/private/views/partials",
    helpers: {
        helloworld: () => {
            return "Hello world!";
        }
    }
}));

export default app;