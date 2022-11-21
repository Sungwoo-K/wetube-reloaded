import fetch from "node-fetch";
import User from "../models/User";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => {
  res.render("join", { pageTitle: "Join" });
};
export const postJoin = async (req, res) => {
  const { email, username, password, password2, name, location } = req.body;
  const usernameExists = await User.exists({ username });
  const emailExists = await User.exists({ email });
  if (password !== password2) {
    return res.render("join", {
      pageTitle: "Join",
      errorMessage: "Password confirmation doesn't match.",
    });
  }
  if (usernameExists) {
    return res.render("join", {
      pageTitle: "Join",
      errorMessage: "This username is already taken.",
    });
  }
  if (emailExists) {
    return res.render("join", {
      pageTitle: "Join",
      errorMessage: "This e-mail is already taken.",
    });
  }
  try {
    await User.create({
      email,
      username,
      password,
      name,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    res
      .status(400)
      .render("join", { pageTitle: "Join", errorMessage: error._message });
  }
};

export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });

export const postLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, socialOnly: false });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle: "Login",
      errorMessage: "Email doesn't exist.",
    });
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res
      .status(400)
      .render("login", { pageTitle: "Login", errorMessage: "Wrong Password" });
  }
  req.session.loggedIn = true;
  req.session.user = user;

  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: "4bb346773f5471751521",
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: "4bb346773f5471751521",
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
    ).json();
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
    ).json();

    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        email: emailObj.email,
        username: userData.login,
        avatar_url: userData.avatar_url,
        socialOnly: true,
        password: "",
        name: userData.name,
        location: userData.location,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};

export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "Edit Profile" });
};

export const postEdit = async (req, res, next) => {
  const {
    session: {
      user: { _id, avatar_url },
    },
    body: { name, email, username, location },
    file,
  } = req;

  const sessionUser = req.session.user;

  //filter update user
  const existEmail = await User.exists({ email });
  const existUsername = await User.exists({ username });
  const checkExistEmail = sessionUser.email === email;
  const checkExistUsername = sessionUser.username === username;
  const emailExistErrMessage = "Already exist e-mail";
  const usernameExistErrMessage = "Already exist username";
  if (!checkExistEmail) {
    if (existEmail) {
      return res.status(400).render("edit-profile", {
        pageTitle: "Edit Profile",
        emailExistErrMessage,
      });
    }
  }
  if (!checkExistUsername) {
    if (existUsername) {
      return res.status(400).render("edit-profile", {
        pageTitle: "Edit Profile",
        usernameExistErrMessage,
      });
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      avatar_url: file ? file.path : avatar_url,
      name,
      email,
      username,
      location,
    },
    { new: true }
  );
  req.session.user = updatedUser;
  return res.redirect("/users/edit");
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    return res.redirect("/");
  }
  return res.render("users/change-password", { pageTitle: "Change Password" });
};

export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { oldPassword, newPassword, newPasswordConfirmation },
  } = req;
  const user = await User.findById(_id);

  const ok = await bcrypt.compare(oldPassword, user.password);

  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The current password is incorrect",
    });
  }

  if (newPassword !== newPasswordConfirmation) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The password does not match the confirmation",
    });
  }

  user.password = newPassword;
  await user.save();

  return res.redirect("/users/logout");
};

export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate("videos");
  console.log(user);
  if (!user) {
    return res.status(404).render("404", { pageTitle: "User not found." });
  }
  return res.render("users/profile", { pageTitle: user.name, user });
};
