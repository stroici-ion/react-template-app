import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/slice";
import tasksReducer from "./tasks/slice";
import projectsReducer from "./projects/slice";
import usersReducer from "./users/slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: tasksReducer,
    projects: projectsReducer,
    users: usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
