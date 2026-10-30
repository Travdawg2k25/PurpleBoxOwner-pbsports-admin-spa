// Auth — token + user storage for the PB Sports admin SPA.
// Rewired for pbsports-api: JWT bearer token, user object with is_admin.
class Auth {
  key = "pb_admin_user";
  tokenKey = "pb_admin_token";

  login(user, token) {
    localStorage.setItem(this.key, JSON.stringify(user));
    localStorage.setItem(this.tokenKey, token);
  }

  userInfo() {
    const raw = localStorage.getItem(this.key);
    return raw ? JSON.parse(raw) : null;
  }

  token() {
    return localStorage.getItem(this.tokenKey) || "";
  }

  isAdmin() {
    const u = this.userInfo();
    return !!(u && u.is_admin);
  }

  isUserAuthenticated() {
    return !!(localStorage.getItem(this.tokenKey) && this.isAdmin());
  }

  logout() {
    localStorage.removeItem(this.key);
    localStorage.removeItem(this.tokenKey);
  }
}

export default new Auth();
