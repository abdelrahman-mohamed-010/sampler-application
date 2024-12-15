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
  },
});

export const { addTable, setActiveTable } = tableSlice.actions;
export default tableSlice.reducer;
