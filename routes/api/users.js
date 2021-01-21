var express = require('express');
var router = express.Router();

const bcrypt = require('bcryptjs');

const User = require('../../models/User');

router.get('/', (req, res) => {
    res.send("패스포트 모듈 테스트");
});

router.post('/register', (req, res) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if(user) {
                return res.status(400).json({
                    email: "해당 이메일을 가진 사용자가 존재합니다."
                })
            } else {
                const newUser = new User({
                    email: req.body.email,
                    name: req.body.name,
                    password: req.body.password
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;

                        newUser.password = hash;

                        newUser.save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err));
                    })
                })
            }
        })
})

module.exports = router;