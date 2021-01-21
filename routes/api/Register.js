const express = require("express");
var router = express.Router();

const User = require("../models/User");
const bcrypt = require("bcrypt");
const saltRounds = 10;

authRouter.post("/login", (req, res) => {
  console.log(req.body);
});

authRouter.post("/register", async (req, res) => {
  let { userEmail, nickname, password, passwordCheck } = req.body;
  // 빈값이 오면 팅겨내기
  if (
    userEmail === "" ||
    nickname === "" ||
    password === "" ||
    passwordCheck === ""
  ) {
    return res.json({ registerSuccess: false, message: "정보를 입력하세요" });
  }

  // 비밀번호가 같지 않으면 팅겨내기
  if (password !== passwordCheck)
    return res.json({
      registerSuccess: false,
      message: "비밀번호가 같지 않습니다",
    });

  const sameEmailUser = await User.findOne({ email: userEmail });
  if (sameEmailUser !== null) {
    return res.json({
      registerSuccess: false,
      message: "이미 존재하는 이메일입니다",
    });
  }

  const sameNickNameUser = await User.findOne({ nickname });
  if (sameNickNameUser !== null) {
    return res.json({
      registerSuccess: false,
      message: "이미 존재하는 닉네임입니다.",
    });
  }

  // 솔트 생성 및 해쉬화 진행
  bcrypt.genSalt(saltRounds, (err, salt) => {
    // 솔트 생성 실패시
    if (err)
      return res.status(500).json({
        registerSuccess: false,
        message: "비밀번호 해쉬화에 실패했습니다.",
      });
    // salt 생성에 성공시 hash 진행

    bcrypt.hash(password, salt, async (err, hash) => {
      if (err)
        return res.status(500).json({
          registerSuccess: false,
          message: "비밀번호 해쉬화에 실패했습니다.",
        });

      // 비밀번호를 해쉬된 값으로 대체합니다.
      password = hash;

      const user = await new User({
        email: userEmail,
        nickname,
        password,
      });

      user.save((err) => {
        if (err) return res.json({ registerSuccess: fasle, message: err });
      });
      return res.json({ registerSuccess: true });
    });
  });
});

module.exports = router;