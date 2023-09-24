import jsonwebtoken from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const signIn = (userIdx, isAdmin) => {
  return jsonwebtoken.sign(
    {
      userIdx,
      isAdmin,
    },
    process.env.TOKEN_SECRET,
    { expiresIn: '1h' },
  );
};

export const confirmPasswordReset = (pwResetUserIdx) => {
  return jsonwebtoken.sign(
    {
      pwResetUserIdx,
    },
    process.env.TOKEN_SECRET,
    { expiresIn: '1h' },
  );
};

export const verifyToken = (token, keyRequired = undefined) => {
  const errorUnauthorized = {
    status: 401,
    message: 'unauthorized',
  };

  let verifiedToken;
  try {
    verifiedToken = jsonwebtoken.verify(token, process.env.TOKEN_SECRET);
  } catch (e) {
    throw errorUnauthorized;
  }

  if (keyRequired !== undefined && verifiedToken[keyRequired] === undefined) {
    throw errorUnauthorized;
  }

  return verifiedToken;
};
