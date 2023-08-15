import { Comment } from '../models/comment.js';

let dummyCommentsData = [
  {
    idx: 0,
    authorIdx: 0,
    articleIdx: 0,
    content: 'dfsfasfasldfkmslkfd\n\nfdsfsf@#!@#\n\n\n0$@',
    createdAt: '2023-08-13 20:07:43',
  },
];

export const getComment = (commentIdx) => {
  if (isNaN(commentIdx) || commentIdx < 0) {
    return null;
  }

  // TODO: replace to db select
  const comment = new Comment(
    dummyCommentsData.find((dummyComment) => dummyComment.idx === commentIdx),
  );

  if (comment) {
    return comment;
  } else return null;
};

export const getComments = (articleIdx) => {
  if (isNaN(articleIdx) || articleIdx < 0) {
    return null;
  }

  // TODO: replace to db select
  const comments = dummyCommentsData
    .filter((dummyComment) => dummyComment.articleIdx === articleIdx)
    .map((dummyComment) => new Comment(dummyComment));

  if (comments) {
    return comments;
  } else return null;
};

export const addComment = ({ authorIdx, articleIdx, content }) => {
  const comment = new Comment({});
  try {
    comment.authorIdx = authorIdx;
    comment.content = content;
    comment.articleIdx = articleIdx;

    dummyCommentsData = [...dummyCommentsData, { ...comment }];

    console.log(dummyCommentsData);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

export const editComment = ({ signedUserIdx, commentIdx, content }) => {
  if (isNaN(commentIdx) || commentIdx < 0) {
    return false;
  }

  try {
    // TODO: replace to db update
    dummyCommentsData.map((dummyComment) =>
      dummyComment.idx === commentIdx &&
      dummyComment.authorIdx === signedUserIdx
        ? {
            content,
          }
        : dummyComment,
    );

    console.log(dummyCommentsData);
    return true;
  } catch (e) {
    console.log(e.message);
    return false;
  }
};

export const deleteComment = (commentIdx, signedUserIdx) => {
  if (isNaN(commentIdx) || commentIdx < 0) {
    return false;
  }

  // TODO: replace to db delete
  dummyCommentsData = dummyCommentsData.filter(
    (dummyArticle) =>
      !(
        dummyArticle.idx === commentIdx &&
        dummyArticle.authorIdx === signedUserIdx
      ),
  );
  console.log(dummyCommentsData);

  return true;
};
