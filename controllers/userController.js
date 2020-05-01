const fs = require('fs');

const users = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/users.json`));

exports.getAllUsers = ((req, res) => {
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        data: {
            users: users
        }
    })
})

exports.getUser = ((req, res) => {
    //console.log(req.params.id);
    const id = (req.params.id * 1);
    if (id > users.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'User Not found Invalid id'
        })
    }
    const user = users.find(el => el._id === id)

    res.status(200).json({
        status: 'success',
        message: 'done'
    })

});

exports.createUser = ((req, res) => {
    newId = (users.length) + 1;
    console.log(newId);
    res.status(200).json({
        status: 'success',
        message: 'done'
    })

});
exports.updateUser = ((req, res) => {
    console.log(req.params);

});
exports.deleteUser = ((req, res) => {
    if (req.params.id * 1 > users.length) {
        return res.staur(401).json({
            status: 'fail',
            message: 'Invalid user Id '
        })
    }
    res.status(204).json({
        status: 'success',
        data: null
    })
})