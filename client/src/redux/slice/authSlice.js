import { createSlice } from "@reduxjs/toolkit";
import { registerUser, loginUser } from "../action/authAction";
const storedUser = localStorage.getItem("user");
const storedToken = localStorage.getItem("token");
const initialState = {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken || null,
    loading: false,
    error: null,
    success: false,
};
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.error = null;
            localStorage.removeItem("user");
            localStorage.removeItem("token");
        },
        clearAuthError: (state) => {
            state.error = null;
        },
        clearAuthSuccess: (state) => {
            state.success = false;
        },
    },

    extraReducers: (builder) => {

        builder.addCase(registerUser.pending, (state) => {

            state.loading = true;
            state.error = null;
            state.success = false;
        })

        builder.addCase(registerUser.fulfilled, (state, action) => {

            state.loading = false;
            state.success = true;
            state.error = null;
        })

        builder.addCase(registerUser.rejected, (state, action) => {

            state.loading = false;
            state.success = false;

            state.error =
                action.payload?.message ||
                "Registration failed";
        });


        builder.addCase(loginUser.pending, (state) => {

            state.loading = true;
            state.error = null;
        })

        builder.addCase(loginUser.fulfilled, (state, action) => {

            state.loading = false;
            state.error = null;

            state.user = action.payload.user;
            state.token = action.payload.token;

            localStorage.setItem(
                "token",
                action.payload.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(action.payload.user)
            );
        })

        builder.addCase(loginUser.rejected, (state, action) => {

            state.loading = false;

            state.error =
                action.payload?.message ||
                "Login failed";
        });
    },
});


export const { logout, clearAuthError, clearAuthSuccess} = authSlice.actions;
export default authSlice.reducer;