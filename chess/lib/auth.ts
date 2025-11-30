export function saveToken(token: string) {
  localStorage.setItem("token", token);
}

export function getToken() {
  
  return localStorage.getItem("token");
}

export function clearToken() {
  localStorage.removeItem("token");
  localStorage.removeItem('username');
}

export function saveUsername(username: string) {
  localStorage.setItem('username', username);
}

export function getUsername() {
  
  return localStorage.getItem('username');
}