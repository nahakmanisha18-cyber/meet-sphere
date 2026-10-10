import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

export const createMeeting = createAsyncThunk( "meeting/createMeeting",
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                return rejectWithValue(
                    "Authentication required. Please login."
                );
            }
            const response = await api.post(
                "/meetings/create",
                {},
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
                "Failed to create meeting."
            );

        }
    }
);

export const joinMeeting = createAsyncThunk("meeting/joinMeeting",
    async (meetingId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                return rejectWithValue(
                    "Authentication required. Please login."
                );
            }
            const response = await api.post(
                "/meetings/join",
                {
                    meetingId: meetingId.trim(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(  error.response?.data?.message ||"Failed to join meeting.");

        }
    }
);

export const getMeeting = createAsyncThunk("meeting/getMeeting",
    async (meetingId, { rejectWithValue }) => {

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                return rejectWithValue(
                    "Authentication required. Please login."
                );
            }
            const response = await api.get(
                `/meetings/${meetingId.trim()}`,
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
                "Failed to fetch meeting."
            );

        }
    }
);

export const getMeetingParticipants = createAsyncThunk( "meeting/getMeetingParticipants",
    async (meetingId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                return rejectWithValue(
                    "Authentication required. Please login."
                );
            }
            const response = await api.get(
                `/meetings/${meetingId.trim()}/participants`,
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
                "Failed to fetch participants."
            );

        }
    }
);