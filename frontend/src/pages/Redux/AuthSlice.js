import { createSlice } from "@reduxjs/toolkit";

 
const storedUser = localStorage.getItem("user");

const initialState = {
  token: localStorage.getItem("token") || null,
  user: storedUser ? JSON.parse(storedUser) : null,
  isAuth: !!localStorage.getItem("token"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.isAuth = true;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuth = false;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
 
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("user", JSON.stringify(state.user));
    },
  },
});

export const { login, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;