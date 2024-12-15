// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import tableReducer from "./tableSlice";

export const store = configureStore({
  reducer: {
    tables: tableReducer,
  },
});

export default store;
