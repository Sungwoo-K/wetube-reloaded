import User from "../models/User";
import Video from "../models/Video";

export const home = async (req, res) => {
  const videos = await Video.find({});
  return res.render("home", { pageTitle: "Home", videos });
};

export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner");
  if (!video) {
    return res.render("404", { pageTitle: "Video Not found." });
  }
  return res.render("watch", { pageTitle: video.title, video });
};

export const getEdit = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    parmas: { id },
  } = req;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video Not found." });
  }
  if (String(_id) !== String(video.owner)) {
    return res.status(403).redirect("/");
  }
  res.render("edit", { pageTitle: `Edit: ${video.title}`, video });
};

export const postEdit = async (req, res) => {
  const { id } = req.params;
  const video = await Video.exists({ _id: id });
  const { title, description, hashtags } = req.body;
  if (!video) {
    return res.render("404", { pageTitle: "Video Not found." });
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  //here we will add a video to the videos array.
  const {
    session: {
      user: { _id },
    },
    file: { path: fileUrl },
    body: { title, description, hashtags },
  } = req;
  try {
    const newVideo = await Video.create({
      title,
      fileUrl,
      owner: _id,
      description,
      hashtags: Video.formatHashtags(hashtags),
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
    return res.redirect("/");
  } catch (err) {
    return res.render("upload", {
      pageTitle: "Upload Video",
      errorMessage: err._message,
    });
  }
};

export const deleteVideo = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    params: { id },
  } = req;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video Not found." });
  }
  if (String(_id) !== String(video.owner)) {
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndDelete(id);
  return res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(keyword, "i"),
      },
    });
  }
  return res.render("search", { pageTitle: "Search", videos });
};
