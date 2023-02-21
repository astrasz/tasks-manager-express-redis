import express from 'express';
import redis from 'redis';
import { engine } from 'express-handlebars'
import bodyParser from 'body-parser';

const app = express();
const port = 5000;

// redis
const redisClient = redis.createClient({
    legacyMode: true,
    socket: {
        host: 'redis',
        port: 6379
    }
})

redisClient.connect().then(() => console.log('Redis connected')).catch(console.error);

const DEFAULT_EXPIRATION = 3600;

// view engine
app.engine('handlebars', engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.set('views', './src/views');

//body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/todos', async (req, res, next) => {
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

app.listen(5000, () => console.log('App is running on port ' + port));