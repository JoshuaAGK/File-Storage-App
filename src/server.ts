import router from './api/api';
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const handlebars = require('express-handlebars');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use('/', router);
app.listen(3000);
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