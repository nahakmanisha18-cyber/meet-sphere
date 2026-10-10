import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";


export const getMeetingMessages = createAsyncThunk("message/getMeetingMessages",
    async (meetingId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const response = await api.get(
                `/meeting-messages/${meetingId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Failed to load messages."
            );
        }
    }
);