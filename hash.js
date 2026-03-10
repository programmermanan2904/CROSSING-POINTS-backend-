import bcrypt from "bcryptjs";

bcrypt.hash("123456", 10).then(hash => {
  console.log(hash);
});