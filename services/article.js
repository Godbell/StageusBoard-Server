import { Article } from '../models/article';

let dummyArticlesData = [
  {
    idx: 0,
    authorIdx: 0,
    title: 'test article #$!fadsf',
    content: 'dfsfasfasldfkmslkfd\n\nfdsfsf@#!@#\n\n\n0$@',
    createdAt: '2023-08-13 20:07:43',
  },
];

export const getArticle = (idx) => {
  if (isNaN(idx) || idx < 0) {
    return null;
  }

  // TODO: replace to db select
  const article = new Article(
    dummyArticlesData.find((dummyArticle) => dummyArticle.idx === idx),
  );

  if (article) {
    return article;
  } else return null;
};

export const addArticle = ({ authorIdx, title, content }) => {
  const article = new Article({});
  try {
    article.authorIdx = authorIdx;
    article.title = title;
    article.content = content;

    article.dummyArticlesData = [...dummyArticlesData, { ...article }];

    console.log(dummyArticlesData);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

export const editArticle = (idx, { authorIdx, title, content }) => {
  if (isNaN(idx) || idx < 0) {
    return false;
  }

  try {
    // TODO: replace to db update
    dummyArticlesData.map((dummyArticle) =>
      dummyArticle.idx === idx && dummyArticle.authorIdx === authorIdx
        ? {
            title,
            content,
          }
        : dummyArticle,
    );

    console.log(dummyArticlesData);
    return true;
  } catch (e) {
    console.log(e.message);
    return false;
  }
};

export const deleteArticle = (idx, authorIdx) => {
  if (isNaN(idx) || idx < 0) {
    return false;
  }

  // TODO: replace to db delete
  dummyArticlesData = dummyArticlesData.filter(
    (dummyArticle) =>
      !(dummyArticle.idx === idx && dummyArticle.authorIdx === authorIdx),
  );
  console.log(dummyArticlesData);

  return true;
};
