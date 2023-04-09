const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const commentDeleteBtn = document.querySelectorAll(".commentDeleteBtn");

const createComments = (text, id) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.className = "video__comment";
  newComment.dataset.id = id;
  const span = document.createElement("span");
  span.innerText = `${text}`;
  const deleteIconBox = document.createElement("form");
  deleteIconBox.className = "commentDeleteBtn";
  const deleteIcon = document.createElement("button");
  deleteIcon.className = "fa-solid fa-xmark";
  deleteIconBox.appendChild(deleteIcon);
  newComment.appendChild(span);
  newComment.appendChild(deleteIconBox);
  videoComments.prepend(newComment);
  deleteIconBox.addEventListener("submit", handleCommentDelete);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;
  if (text == "") {
    return;
  }
  const comment = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
    }),
  });
  textarea.value = "";
  const commentData = await comment.json();
  if (comment.status === 201) {
    createComments(text, commentData._id);
  }
};

const handleCommentDelete = async (event) => {
  event.preventDefault();
  const commentId = event.target.parentNode.dataset.id;
  event.target.parentNode.remove();
  await fetch(`/api/videos/${commentId}/comment/delete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}

commentDeleteBtn.forEach((comment) =>
  comment.addEventListener("submit", handleCommentDelete)
);
