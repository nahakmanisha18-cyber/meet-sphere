import { createSlice } from "@reduxjs/toolkit";

import { getMeetingMessages } from "../action/messageAction";

const initialState = {
    messages: [],
    loading: false,
    error: null,
    success: false,
};

const messageSlice = createSlice({
    name: "message",
    initialState,

    reducers: {
        addMessage: (state, action) => {
            const message = action.payload;
            const alreadyExists =
                state.messages.some(
                    (item) => item._id === message._id
                );
            if (!alreadyExists) {
                state.messages.push(
                    message
                );
            }
        },

        clearMessages: (state) => {
            state.messages = [];
            state.loading = false;
            state.error = null;
            state.success = false;
        },

        setMessages: (state, action) => {
            state.messages = action.payload || [];
        },
    },

    extraReducers: (builder) => {
        builder.addCase(getMeetingMessages.pending, (state) => {
            state.loading = true;
            state.error = null;
        })

        builder.addCase(getMeetingMessages.fulfilled, (state, action) => {
            state.loading = false;
            state.error = null;
            state.messages = action.payload.messages || [];
        })

        builder.addCase(getMeetingMessages.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || "Failed to load messages.";
        })

    },

});

export const { addMessage, clearMessages, setMessages } = messageSlice.actions;
export default messageSlice.reducer;