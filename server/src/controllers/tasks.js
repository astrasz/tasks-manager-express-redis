import redisClient from '../services/redis.js';
import { DEFAULT_EXPIRATION } from '../services/redis.js';

export const getTasks = async (req, res, next) => {
    const todoId = req.query.todoId;

    redisClient.get('todos', async (error, todos) => {
        if (error) console.log('Err: ', error);

        if (todos != null) {
            // return res.json(JSON.parse(todos));
            return res.render('tasks', {
                tasks: todos,
                loggedIn: true
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
}