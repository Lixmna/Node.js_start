var express = require('express');
var router = express.Router();

const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { User } = require("./models/User");

app.post("/login", (req, res) => {
    // 해당 email이 있는지 확인
    User.findOne({ email: req.body.email }, (error, user) => {
      // 에러는 500
      if (error) {
        return res.status(500).json({ error: "오류" });
      }
  
      // 찾는 유저가 없다?
      if (!user) {
        return res.status(403).json({
          loginSuccess: false,
          message: "해당되는 이메일이 없습니다.",
        });
      }
  
      // email이 맞으니 pw가 일치하는지 검증합니다.
      if (user) {
        const checkPW = () => {
          bcryptjs.compare(req.body.password, user.password, (error, isMatch) => {
            if (error) {
              return res.status(500).json({ error: "something wrong" });
            }
            if (isMatch) {
              // 비밀번호가 맞으면 token을 생성해야 합니다.
              // secret 토큰 값은 특정 유저를 감별하는데 사용합니다.
  
              // 토큰 생성 7일간 유효
              const token = jwt.sign({ userID: user._id }, SECRET_TOKEN, {expiresIn: '7d'});
  
              // 해당 유저에게 token값 할당 후 저장
              user.token = token;
              user.save((error, user) => {
                if (error) {
                  return res.status(400).json({ error: "something wrong" });
                }
  
                // DB에 token 저장한 후에는 cookie에 토큰을 저장하여 이용자를 식별합니다.
                return res
                  .cookie("x_auth", user.token, {
                    maxAge: 1000 * 60 * 60 * 24 * 7, // 7일간 유지
                    httpOnly: true,
                  })
                  .status(200)
                  .json({ loginSuccess: true, userId: user._id });
              });
            } else {
              return res.status(403).json({
                loginSuccess: false,
                message: "비밀번호가 틀렸습니다.",
              });
            }
          });
        };
        checkPW();
      }
    });
});
  
app.listen(port, () =>
console.log(`Example app listening at http://localhost:${port}`)
);

const jwtMiddleware = (req, res, next) => {
// 클라이언트 쿠키에서 token을 가져옵니다.
let token = req.cookies.x_auth;

// token을 decode 합니다.
jwt.verify(token, SECRET_TOKEN, (error, decoded) => {
    if (error) {
    return res
        .status(500)
        .json({ error: "token을 decode하는 데 실패 했습니다." });
    }
    // decoded에는 jwt를 생성할 때 첫번째 인자로 전달한 객체가 있습니다.
    // { random: user._id } 형태로 줬으므로 _id를 꺼내 씁시다
    User.findOne({ _id: decoded.UserId }, (error, user) => {
    if (error) {
        return res.json({ error: "DB에서 찾는 도중 오류가 발생했습니다" });
    }
    if (!user) {
        return res
        .status(404)
        .json({ isAuth: false, error: "token에 해당하는 유저가 없습니다" });
    }
    if (user) {
        // 🚨 다음에 사용할 수 있도록 req 객체에 token과 user를 넣어줍니다
        req.token = token;
        req.user = user;
    }
    next();
    });
});
};

app.post("/api/users/auth", jwtMiddleware, async (req, res) => {
res.status(200).json({
    isAuth: true,
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    name: req.user.name,
});
});

authRouter.post("/logout", jwtMiddleware, (req, res) => {
// 쿠키를 지웁니다.

return res.cookie("x_auth", "").json({ logoutSuccess: true });
});
module.exports = router;