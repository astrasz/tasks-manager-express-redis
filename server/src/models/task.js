const getTaskModel = (sequelize, DataTypes) => {
    const Task = sequelize.define('Task', {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: DataTypes.STRING,
        subTask: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        logging: true
    }
    )

    Task.associate = (models) => {
        Task.belongsTo(models.User, {
            as: 'Owner',
            foreignKey: 'ownerId'
        })
        Task.belongsTo(models.User, {
            as: 'Doer',
            foreignKey: 'doerId'
        })
        Task.belongsTo(models.Task, {
            as: 'MainTask',
            foreignKey: 'mainTaskId'
        })
    }

    return Task;
}

export default getTaskModel;