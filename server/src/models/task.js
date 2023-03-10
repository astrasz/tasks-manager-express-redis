
export const STATUS = {
    TO_DO: 'TO DO',
    IN_PROGRESS: 'IN PROGRESS',
    DONE: 'DONE'
}


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
        isAssociated: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        status: {
            type: DataTypes.ENUM([STATUS.TO_DO, STATUS.IN_PROGRESS, STATUS.DONE]),
            default: STATUS.TO_DO,
            // allowNull: false
        },
        value: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
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
            as: 'Associated',
            foreignKey: 'associatedId'
        })
    }

    return Task;
}

export default getTaskModel;