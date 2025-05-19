// src/store/slices/categorySlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 📌 Base URL untuk API
const BASE_URL = "https://extra-brooke-yeremiadio-46b2183e.koyeb.app/api/categories";

// 📌 Ambil token dari localStorage
const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// 📌 Tipe data kategori
interface Category {
  id: number;
  name: string;
  [key: string]: any; // jika ada properti tambahan
}

// 📌 State awal
interface CategoryState {
  data: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  data: [],
  loading: false,
  error: null,
};

// 🔄 Async Thunks

export const fetchCategories = createAsyncThunk("category/fetchAll", async (_, { signal }) => {
  const response = await axios.get(BASE_URL, { headers: getHeaders(), signal });
  return response.data; // { data, meta }
});

export const createCategory = createAsyncThunk("category/create", async (name: string) => {
  const response = await axios.post(BASE_URL, { data: { name } }, { headers: getHeaders() });
  return response.data; // { data }
});

export const updateCategory = createAsyncThunk(
  "category/update",
  async ({ id, name }: { id: number; name: string }) => {
    const response = await axios.put(`${BASE_URL}/${id}`, { data: { name } }, { headers: getHeaders() });
    return response.data.data;
  }
);

export const deleteCategory = createAsyncThunk("category/delete", async (id: number) => {
  await axios.delete(`${BASE_URL}/${id}`, { headers: getHeaders() });
  return id;
});

// 🧩 Slice
const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    resetError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 📦 Fetch All
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch categories";
      })

      // ➕ Create
      .addCase(createCategory.fulfilled, (state, action) => {
        state.data.push(action.payload.data);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.error = action.error.message || "Failed to create category";
      })

      // ✏️ Update
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.data.findIndex((cat) => cat.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.error = action.error.message || "Failed to update category";
      })

      // 🗑️ Delete
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.data = state.data.filter((cat) => cat.id !== action.payload);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.error = action.error.message || "Failed to delete category";
      });
  },
});

// 🔁 Export
export const { resetError } = categorySlice.actions;
export default categorySlice.reducer;
