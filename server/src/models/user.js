const getUserModel = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            primaryKey: true,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    }, {
        logging: true
    })

    User.asscociate = (models) => {
        User.hasMany(models.Task, {
            onDelete: 'CASCADE',
            foreignKey: 'ownerId',
        });
        User.hasMany(models.Task, {
            foreignKey: 'doerId',
        })
    }

    return User;
}



// User.hasMany(Task)

// User.hasMany(Task)

export default getUserModel;