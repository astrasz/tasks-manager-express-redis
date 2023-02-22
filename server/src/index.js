import express from 'express';
import { engine } from 'express-handlebars'
import bodyParser from 'body-parser';
import { sequelize } from './models/sequelize.js';
import cookieParser from 'cookie-parser';
import routes from './routes/routes.js'
import redisClient from './services/redis.js';
import { DEFAULT_EXPIRATION } from './services/redis.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();
const port = 5000;

// cookie
app.use(cookieParser());

// view engine
app.engine('handlebars', engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.set('views', './src/views');

//body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

// routes
app.use(routes);

app.get('/', async (req, res, next) => {
    const todoId = req.query.todoId;

    redisClient.get('todos', async (error, todos) => {
        if (error) console.log('Err: ', error);

        if (todos != null) {
            // return res.json(JSON.parse(todos));
            return res.render('tasks', {
                'tasks': todos
            })
        }
        const url = new URL('https://jsonplaceholder.typicode.com/todos');
        const params = new URLSearchParams();
        if (todoId) {
            params.append('id', todoId);
        }
        const data = await fetch(url + '?' + params,
            {
                method: 'GET'
            })
            .then(response => response.json());

        redisClient.setEx('todos', DEFAULT_EXPIRATION, JSON.stringify(data));

        res.json(data);
    })
})

app.use(errorHandler);

sequelize.sync({ force: true })
    .then(() => {
        console.log('Database connection has been established');
        console.log('models', sequelize.models);
        const server = app.listen(port, () => console.log(`Server is running on port: ${port}`));
    })
    .catch((err) => console.log('Unable to connect to the database', err));
