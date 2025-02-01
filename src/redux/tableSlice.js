import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tables: [],
  activeTable: null,
  randomSample: null,
};

const tableSlice = createSlice({
  name: "tables",
  initialState,
  reducers: {
    addTable: (state, action) => {
      state.tables.push(action.payload);
      state.activeTable = action.payload;
    },
    setActiveTable: (state, action) => {
      state.activeTable = action.payload;
    },
    updateActiveTable: (state, action) => {
      state.activeTable = { ...state.activeTable, ...action.payload };
    },
    clearActiveTable: (state) => {
      state.activeTable = null;
    },
    setRandomSample: (state, action) => {
      state.randomSample = action.payload;
    },
    clearRandomSample: (state) => {
      state.randomSample = null;
    },
  },
});

export const { addTable, setActiveTable, updateActiveTable, clearActiveTable, setRandomSample, clearRandomSample } =
  tableSlice.actions;

export default tableSlice.reducer;
