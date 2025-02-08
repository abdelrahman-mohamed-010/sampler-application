import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tables: JSON.parse(localStorage.getItem("savedTables") || "[]"),
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
      // Store updated tables in local storage
      localStorage.setItem("savedTables", JSON.stringify(state.tables));
    },
    storeTable: (state, action) => {
      // Check if a file with the same name already exists
      const index = state.tables.findIndex(
        (file) => file.name === action.payload.name
      );
      if (index >= 0) {
        state.tables[index] = action.payload; // update existing file
      } else {
        state.tables.push(action.payload); // add new file
      }
      // Store updated tables in local storage
      localStorage.setItem("savedTables", JSON.stringify(state.tables));
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

export const {
  addTable,
  storeTable,
  setActiveTable,
  updateActiveTable,
  clearActiveTable,
  setRandomSample,
  clearRandomSample,
} = tableSlice.actions;

export default tableSlice.reducer;
