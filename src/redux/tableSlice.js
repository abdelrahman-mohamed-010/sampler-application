import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tables: [],
  activeTable: null,
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
  },
});

export const { addTable, setActiveTable, updateActiveTable, clearActiveTable } =
  tableSlice.actions;

export default tableSlice.reducer;
