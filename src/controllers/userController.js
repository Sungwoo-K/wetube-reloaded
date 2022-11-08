import fetch from "node-fetch";
import User from "../models/User" ;
import bcrypt from "bcrypt";

export const getJoin = (req,res) => {
    res.render("join", { pageTitle : "Join" });
};
export const postJoin = async(req,res) => {
    const {email, username, password, password2, name, location } = req.body;
    const usernameExists = await User.exists({username});
    const emailExists = await User.exists({email});
    if (password !== password2) {
        return res.render("join", {pageTitle : "Join", errorMessage : "Password confirmation doesn't match." })
    };
    if (usernameExists) {
        return res.render("join", {pageTitle : "Join", errorMessage : "This username is already taken." })
    };
    if (emailExists) {
        return res.render("join", {pageTitle : "Join", errorMessage : "This e-mail is already taken." })
    };
    try{
        await User.create({
            email,
            username,
            password,
            name,
            location,
        }) 
        return res.redirect("/login");
    } catch (error) {
        res.status(400).render("join", {pageTitle : "Join", errorMessage : error._message })
    };
};

export const getLogin  = (req, res) => res.render("login", { pageTitle:"Login"} );

export const postLogin = async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).render("login", { pageTitle:"Login", errorMessage: "Email doesn't exist."})
    }
    const match = await bcrypt.compare(password,user.password);
    if(!match) {
        return res.status(400).render("login", { pageTitle:"Login", errorMessage: "Wrong Password"})
    }
    req.session.loggedIn = true;
    req.session.user = user;

    return res.redirect("/");
    
};

export const startGithubLogin = (req, res) => {
    const baseUrl = "https://github.com/login/oauth/authorize";
    const config = {
        client_id:"4bb346773f5471751521",
        allow_signup:false,
        scope: "read:user user:email",
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl);
}

export const finishGithubLogin = async (req, res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id:"4bb346773f5471751521",
        client_secret:process.env.GH_SECRET,
        code:req.query.code,
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await (
        await fetch(finalUrl,{
            method:"POST",
            headers: {
                Accept: "application/json"
            }
        })
        ).json();
    if ("access_token" in tokenRequest) {
        const {access_token} = tokenRequest;
        const apiUrl = "https://api.github.com";
        const userData = await (
            await fetch(`${apiUrl}/user`, {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            })
        ).json();
        const emailData = await (
            await fetch(`${apiUrl}/user/emails`, {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            })
        ).json();

        const emailObj = emailData.find(email => email.primary === true && email.verified === true);
        let user = await User.findOne({email:emailObj.email});
        if (!user) {
            user = await User.create({
                email: emailObj.email,
                username: userData.login,
                avatar_url:userData.avatar_url,
                socialOnly:true,
                password: "",
                name: userData.name,
                location: userData.location
            })
        }
        req.session.loggedIn = true;
        req.session.user = user;
        return res.redirect("/");
    } else {
        return res.redirect("/login");
    }
};

export const see  = (req, res) => res.send("See User");
export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Remove User");
export const logout  = (req, res) => {
    req.session.destroy();
    return res.redirect("/");
};

