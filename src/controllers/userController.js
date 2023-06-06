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
    req.flash("error", "Password confirmation doesn't match.");
    return res.redirect("/join");
  }
  if (usernameExists) {
    req.flash("error", "This username is already taken.");
    return res.redirect("/join");
  }
  if (emailExists) {
    req.flash("error", "This e-mail is already taken.");
    return res.redirect("/join");
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
  } catch {
    req.flash("error", "Can't make your account");
    return res.status(400).redirect("/join");
  }
};

export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });

export const postLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user.socialOnly) {
    req.flash("error", "Your account is socialOnly");
    return res.status(400).redirect("/login");
  }
  if (!user) {
    req.flash("error", "Email doesn't exist.");
    return res.status(400).redirect("/login");
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    req.flash("error", "Wrong Password");
    return res.status(400).redirect("/login");
  }
  req.session.loggedIn = true;
  req.session.user = user;

  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
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
    client_id: process.env.GH_CLIENT,
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
        socialOnly: true,
        avatar_url: userData.avatar_url,
        username: userData.login,
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
  return res.render("users/edit-profile", { pageTitle: "Edit Profile" });
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
  if (!checkExistEmail) {
    if (existEmail) {
      req.flash("error", "Already exist e-mail");
      return res.status(400).redirect("/users/edit");
    }
  }
  if (!checkExistUsername) {
    if (existUsername) {
      req.flash("error", "Already exist username");
      return res.status(400).redirect("/users/edit");
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
  return res.redirect(`/users/${_id}`);
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    req.flash("error", "Can't change password.");
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
    req.flash("error", "The current password is incorrect");
    return res.redirect("/users/change-password");
  }

  if (newPassword !== newPasswordConfirmation) {
    req.flash("error", "The password does not match the confirmation");
    return res.redirect("/users/change-password");
  }

  user.password = newPassword;
  await user.save();
  req.flash("info", "Password updated");
  return res.redirect("/users/logout");
};

export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate({
    path: "videos",
    populate: {
      path: "owner",
      model: "User",
    },
  });
  if (!user) {
    return res.status(404).render("404", { pageTitle: "User not found." });
  }
  return res.render("users/profile", { pageTitle: user.name, user });
};
