import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slice/authSlice";
import meetingReducer from "./slice/meetingSlice";
import messageReducer from "./slice/messageSlice";

const store = configureStore({
    reducer: {
        auth: authReducer,
        meeting: meetingReducer,
        message: messageReducer,
    },

});


export default store;