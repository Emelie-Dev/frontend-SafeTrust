import Cookies from "js-cookie";

const SESSION_COOKIE = "firebase-token";

export function setSessionCookie(token: string) {
  Cookies.set(SESSION_COOKIE, token, {
    expires: 7,
    path: "/",
    secure: window.location.protocol === "https:",
    sameSite: "strict",
  });
}

export function clearSessionCookie() {
  Cookies.remove(SESSION_COOKIE, { path: "/", sameSite: "strict" });
}
