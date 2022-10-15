import User from "../models/User" ;
import bcrypt from "bcrypt";
import session from "express-session";

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

export const see  = (req, res) => res.send("See User");
export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Remove User");
export const logout  = (req, res) => res.send("Log Out");

