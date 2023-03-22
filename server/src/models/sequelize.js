import { Sequelize } from 'sequelize';
import { configSettings } from '../config/config.js';

import getUserModel from './user.js';
import getTaskModel from './task.js';

const env = process.env.NODE_ENV ?? 'dev'
const config = configSettings[env];

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: false
})

const models = {
    User: getUserModel(sequelize, Sequelize),
    Task: getTaskModel(sequelize, Sequelize)
}

Object.keys(models).forEach((key) => {
    if (models[key].associate) {
        models[key].associate(models);
    }
})

export { sequelize };
export default models;
