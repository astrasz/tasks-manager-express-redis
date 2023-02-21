import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { Sequelize } from 'sequelize';
import { configSettings } from '../config/config.js';


const env = process.env.NODE_ENV ?? 'dev'
const config = configSettings[env];

const sequelize = new Sequelize({
    database: config.database,
    dialect: config.dialect,
    username: config.username,
    password: config.password,
    host: config.host,
    models: [__dirname + '/*.js'],
    modelMatch: (filename, member) => {
        return filename.substring(0, filename.indexOf('.')) === member.toLowerCase();
    }
});

export default sequelize;

