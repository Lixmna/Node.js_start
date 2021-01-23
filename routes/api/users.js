var express = require('express');
var router = express.Router();

const bcrypt = require('bcryptjs');

const User = require('../../models/User');
const jwt = require('jsonwebtoken');

const keys = require('../../config/keys');

const passport = require('passport');

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
                    password: req.body.password,
                    token: 'null'
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
});

router.post('/login', (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    // email로 회원 찾기
    User.findOne({email})
        .then(user => {
            if(!user){
                errors.email = "해당하는 회원이 존재하지 않습니다.";
                return res.status(400).json(errors);
            }

            // 패스워드 확인
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if(isMatch) {
                        // 회원 비밀번호가 일치할 때
                        // JWT PAYLOAD 생성
                        const payload = {
                            id: user.id,
                            name: user.name
                        };

                        // JWT 토큰 생성
                        // 7일 동안 유효
                        const token = jwt.sign(payload, keys.secretOrKey, { expiresIn: '7d' });

                        user.token = token;
                        user.save((error, user) => {
                            if (error) {
                                return res.status(400).json({ error: "something wrong"});
                            }
                            console.log("여기들어왓는데 왜 쿠키가 안만들어짐?")
                            res.cookie(
                                'user', { id: '1004', name: 'kim', authorized: true }
                            );
                            return res.cookie("x_auth", user.token, {
                                maxAge: 1000*60*60*24*7,
                                httpOnly: true,
                            })
                                .status(200)
                                .json({ loginSuccess: true, userId: user.id, token: user.token});
                        });
                        
                    } else {
                        errors.password = "패스워드가 일치하지 않습니다.";
                        return res.status(400).json(errors);
                    }
                });
        })
});


const jwtMiddleware = (req, res, next) => {
  // 클라이언트 쿠키에서 token을 가져옵니다.
  let token = req.cookies.x_auth;

  // token을 decode 합니다.
  jwt.verify(token, keys.secretOrKey, (error, decoded) => {
    if (error) {
      return res
        .status(500)
        .json({ error: "token을 decode하는 데 실패 했습니다." });
    }
    // decoded에는 jwt를 생성할 때 첫번째 인자로 전달한 객체가 있습니다.
    // { random: user._id } 형태로 줬으므로 _id를 꺼내 씁시다
    User.findOne({ id: decoded.UserId }, (error, user) => {
      if (error) {
        return res.json({ error: "DB에서 찾는 도중 오류가 발생했습니다" });
      }
      if (!user) {
        return res
          .status(404)
          .json({ isAuth: false, error: "token에 해당하는 유저가 없습니다" });
      }
      if (user) {
        //  다음에 사용할 수 있도록 req 객체에 token과 user를 넣어준다.
        req.token = token;
        req.user = user;
      }
      next();
    });
  });
};

router.post("/auth", jwtMiddleware, async (req, res) => {
    res.send(req.cookies.x_auth);
    res.status(200).json({
      isAuth: true,
      id: req.user.id,
      name: req.user.name,
    });
});

router.post("/logout", jwtMiddleware, (req, res) => {

    return res.cookie("x_auth", "").json({ logoutSuccess: true });
});

router.get('/current', passport.authenticate('jwt', { session: false}), (req, res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
    });
});

module.exports = router;