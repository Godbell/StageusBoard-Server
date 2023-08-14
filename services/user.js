import { User } from '../models/user.js';

let dummyUsers = [
  {
    idx: 0,
    username: 'test0',
    password: '12341234',
    nickname: 'testNickname0',
    firstName: 'kim',
    lastName: 'sus',
    email: 'example@example.com',
    createdAt: '2023-08-13 20:07:43',
  },
];

export const getUserProfile = (idx) => {
  if (isNaN(userIdx) || userIdx < 0) return null;

  try {
    // TODO: replace to db select
    const {
      idx: i,
      password,
      ...userData
    } = dummyUsers.find((user) => user.idx === idx);

    const user = new User(userData);
    console.log(user);

    return user;
  } catch (e) {
    console.log(e.message);
    return null;
  }
};

export const addUser = ({
  username,
  password,
  nickname,
  firstName,
  lastName,
  email,
}) => {
  const user = new User({});

  try {
    user.username = username;
    user.password = password;
    user.nickname = nickname;
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;

    // TODO: replace to db insert
    dummyUsers = [...dummyUsers, { ...user }];

    console.log(dummyUsers);
    return true;
  } catch (e) {
    console.log(e.message);
    return false;
  }
};

export const editUser = (
  idx,
  { password, nickname, firstName, lastName, email },
) => {
  if (isNaN(idx) || idx < 0) return false;

  try {
    const user = new User({});

    if (password) user.password = password;
    if (nickname) user.nickname = nickname;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;

    // TODO: replace to db update
    dummyUsers = dummyUsers.map((dummyUser) =>
      dummyUser.idx === idx
        ? {
            ...dummyUser,
            password: user.password ?? dummyUser.password,
            nickname: user.nickname ?? dummyUser.nickname,
            firstName: user.firstName ?? dummyUser.firstName,
            lastName: user.lastName ?? dummyUser.lastName,
            email: user.email ?? dummyUser.email,
          }
        : dummyUser,
    );

    console.log(dummyUsers);
    return true;
  } catch (e) {
    console.log(e.message);
    return false;
  }
};

export const deleteUser = (idx) => {
  if (isNaN(idx) || idx < 0) return false;

  try {
    dummyUsers = dummyUsers.filter((dummyUser) => dummyUser.idx !== idx);

    console.log(dummyUsers);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

export const checkSignInData = (username, password) => {
  // TODO: replace to db select password
  if (!username || !password) return false;

  const correctPassword = dummyUsers.find(
    (user) => user.username === username,
  )?.password;

  if (!correctPassword) {
    return false;
  }

  if (password === correctPassword) {
    return true;
  } else return false;
};
