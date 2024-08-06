
import Cookies from 'js-cookie';

export const isCookieSet = (cookieName) => {
  return Cookies.get(cookieName) !== undefined;
};
