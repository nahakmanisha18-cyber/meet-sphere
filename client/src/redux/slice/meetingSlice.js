import { createSlice } from "@reduxjs/toolkit";
import { createMeeting, joinMeeting, getMeeting, getMeetingParticipants } from "../action/meetingAction";

const initialState = {
    meeting: null,
    joinedMeeting: null,
    participant: null,
    meetingDetails: null,
    participants: [],
    loading: false,
    error: null,
    success: false,
};


const meetingSlice = createSlice({
    name: "meeting",
    initialState,
    reducers: {
        clearMeetingState: (state) => {
            state.meeting = null;
            state.loading = false;
            state.error = null;
            state.success = false;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(createMeeting.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        }
        )

        builder.addCase(createMeeting.fulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            state.error = null;
            state.meeting = action.payload.meeting;
        }
        )

        builder.addCase(createMeeting.rejected, (state, action) => {
            state.loading = false;
            state.success = false;
            state.error = action.payload;
        }
        );

        builder.addCase(joinMeeting.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        });

        builder.addCase(joinMeeting.fulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            state.error = null;

            state.joinedMeeting = action.payload.meeting;
            state.participant = action.payload.participant;
        });

        builder.addCase(joinMeeting.rejected, (state, action) => {
            state.loading = false;
            state.success = false;

            state.error =
                action.payload ||
                "Failed to join meeting.";
        });

        builder.addCase(getMeeting.pending, (state) => {
            state.loading = true;
            state.error = null;
        });

        builder.addCase(getMeeting.fulfilled, (state, action) => {
            state.loading = false;
            state.error = null;

            state.meetingDetails = action.payload.meeting;
        });

        builder.addCase(getMeeting.rejected, (state, action) => {
            state.loading = false;

            state.error = action.payload ||  "Failed to fetch meeting.";
        });



        builder.addCase(getMeetingParticipants.pending,(state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            }
        );

        builder.addCase( getMeetingParticipants.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.success = true;
                state.participants =  action.payload.participants;
            }
        );

        builder.addCase( getMeetingParticipants.rejected, (state, action) => {
                state.loading = false;
                state.success = false;
                state.error = action.payload || "Failed to fetch participants.";
            }
        );

    },

});


export const {clearMeetingState} = meetingSlice.actions;
export default meetingSlice.reducer;