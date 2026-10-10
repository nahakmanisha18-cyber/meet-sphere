import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const registerUser = createAsyncThunk("auth/registerUser",
    async (userData, { rejectWithValue }) => {
        try {
            const response = await api.post("/auth/register", userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || {
                    message: "Registration failed"
                }
            );
        }
    }
);

export const loginUser = createAsyncThunk( "auth/loginUser",
    async (loginData, { rejectWithValue }) => {

        try {
            const response = await api.post("/auth/login", loginData);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || {
                    message: "Login failed"
                }
            );
        }
    }
);