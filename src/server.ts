import router_api from './api/api';
import router_routes from './api/routes';

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const handlebars = require('express-handlebars');
const cookieParser = require('cookie-parser')

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser())

app.use('/api/', router_api);
app.use('/', router_routes);

app.set('view engine', 'hbs');
app.set('views', __dirname + '/client/private/views/');
app.use(express.static(__dirname + "/client/public"));

app.engine('.hbs', handlebars.engine({
    extname: ".hbs",
    defaultLayout: "main",
    partialsDir: __dirname + "/client/private/views/partials",
    helpers: {}
}));

export default app;