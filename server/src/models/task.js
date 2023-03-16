
export const STATUS = {
    TO_DO: 'TO DO',
    IN_PROGRESS: 'IN PROGRESS',
    DONE: 'DONE'
}

export const STATE = {
    PROCESSED: 'PROCESSED',
    UNPROCESSED: 'UNPROCESSED'
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
        description: DataTypes.TEXT,
        isAssociated: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        status: {
            type: DataTypes.ENUM([STATUS.TO_DO, STATUS.IN_PROGRESS, STATUS.DONE]),
            defaultValue: STATUS.TO_DO,
            allowNull: false
        },
        isProcessed: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false
        },
        value: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    }, {
        logging: true,
        paranoid: true
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