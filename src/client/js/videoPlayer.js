const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const centerPlayBtn = document.getElementById("centerPlay");
const centerPlayBtnIcon = centerPlayBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const volumeRange = document.getElementById("volume");
const currenTime = document.getElementById("currenTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");
const centerPlayBox = document.getElementById("centerPlayBox");
const textarea = document.querySelector("textarea");

let volumeValue = 0.5;
let controlsMovementTimeout = null;
let controlsTimeout = null;
let controlsKeydownTimeout = null;
let centerMovementTimeout = null;
let centerTimeout = null;
let centerKeydownTimeout = null;

const keyTimeoutReset = () => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  if (controlsKeydownTimeout) {
    clearTimeout(controlsKeydownTimeout);
    controlsKeydownTimeout = null;
  }
  if (controlsMovementTimeout) {
    clearTimeout(controlsMovementTimeout);
    controlsMovementTimeout = null;
  }
};

const handlePlayClick = () => {
  document.addEventListener("keydown", handlePlayKeydown);
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  centerPlayBox.classList.add("centerShowing");
  centerKeydownTimeout = setTimeout(hideCenterplay, 300);
  playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
  centerPlayBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handleEnded = () => {
  playBtnIcon.classList = "fas fa-play";
  centerPlayBtnIcon.classList = "fa-sharp fa-solid fa-rotate-right";
  clearTimeout(centerKeydownTimeout);
  centerPlayBox.classList.add("centerShowing");
  const { id } = videoContainer.dataset;
  fetch(`/api/videos/${id}/view`, {
    method: "POST",
  });
};

const handleMute = () => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteBtnIcon.classList = video.muted
    ? "fas fa-volume-mute"
    : "fas fa-volume-up";
  volumeRange.value = video.muted ? 0 : volumeValue;
  video.volume = video.muted ? 0 : volumeValue;
};

const handleInputVolumeChange = (event) => {
  const {
    target: { value },
  } = event;
  if (Number(value) === 0) {
    video.muted = true;
  } else {
    video.muted = false;
  }
  muteBtnIcon.classList = video.muted
    ? "fas fa-volume-mute"
    : "fas fa-volume-up";
  video.volume = value;
};

const handleChangeVolumeChange = (event) => {
  const {
    target: { value },
  } = event;
  if (Number(value) !== 0) {
    volumeValue = value;
  }
};

const formatTime = (seconds) =>
  new Date(seconds * 1000).toISOString().substring(14, 19);

const handleLoadedMetadata = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeline.max = Math.floor(video.duration);
  centerPlayBox.classList.add("centerShowing");
};

const handleTimeUpdate = () => {
  currenTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime);
};

const handleTimelineChange = (event) => {
  const {
    target: { value },
  } = event;
  video.currentTime = value;
};

const handleFullScreen = () => {
  const screenStatus = document.fullscreenElement;
  if (screenStatus) {
    document.exitFullscreen();
    fullScreenIcon.classList = "fas fa-expand";
  } else {
    videoContainer.requestFullscreen();
    fullScreenIcon.classList = "fas fa-compress";
  }
};

const hideControls = () => {
  videoControls.classList.remove("showing");
};

const hideCenterplay = () => {
  centerPlayBox.classList.remove("centerShowing");
};

const handleMouseMove = () => {
  keyTimeoutReset();
  videoControls.classList.add("showing");
  controlsMovementTimeout = setTimeout(hideControls, 2000);
};

const handleMouseLeave = () => {
  if (controlsKeydownTimeout) {
    clearTimeout(controlsKeydownTimeout);
    controlsKeydownTimeout = null;
  }
  controlsTimeout = setTimeout(hideControls, 2000);
};

const handlePlayKeydown = (event) => {
  window.onkeydown = function (e) {
    return e.keyCode !== 32;
  };
  if (centerKeydownTimeout) {
    clearTimeout(centerKeydownTimeout);
    centerKeydownTimeout = null;
  }
  const keyName = event.key;
  if (keyName === "F5") {
    location.reload();
  }
  if (keyName === " ") {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
    centerPlayBox.classList.add("centerShowing");
    centerKeydownTimeout = setTimeout(hideCenterplay, 300);
  }
  playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
  centerPlayBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handlePlayKeydownOff = () => {
  window.onkeydown = function (e) {
    return e.keyCode;
  };
  document.removeEventListener("keydown", handlePlayKeydown);
};

playBtn.addEventListener("click", handlePlayClick);
centerPlayBtn.addEventListener("click", handlePlayClick);
video.addEventListener("click", handlePlayClick);
video.addEventListener("ended", handleEnded);
video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleInputVolumeChange);
volumeRange.addEventListener("change", handleChangeVolumeChange);
timeline.addEventListener("input", handleTimelineChange);
fullScreenBtn.addEventListener("click", handleFullScreen);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
document.addEventListener("keydown", handlePlayKeydown);
if (textarea) {
  textarea.addEventListener("click", handlePlayKeydownOff);
}
