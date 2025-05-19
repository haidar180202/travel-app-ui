import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = "https://extra-brooke-yeremiadio-46b2183e.koyeb.app/api";

export interface Article {
    id: number | string;
    title: string;
    content: string;
    documentId: string | number;
    author?: string;
    publishedAt?: string;
    imageUrl?: string;
}

export interface ArticleFilter {
    search?: string;
    category?: string;
    [key: string]: any;
}

export interface ArticleState {
    articles: Article[];
    selectedArticle: Article | null;
    total: number;
    page: number;
    pageSize: number;
    loading: boolean;
    error: string | null;
    filter: ArticleFilter;
}

const initialState: ArticleState = {
    articles: [],
    selectedArticle: null,
    total: 0,
    page: 1,
    pageSize: 4,
    loading: false,
    error: null,
    filter: {},
};



export const fetchArticles = createAsyncThunk<
    { data: Article[]; meta: { pagination: { total: number } } },
    { page?: number; pageSize?: number; filter?: ArticleFilter }
>("articles/fetchArticles", async (params, { rejectWithValue }) => {
    try {
        const { page = 1, pageSize = 4, filter = {} } = params;

        const query = new URLSearchParams({
            "pagination[page]": page.toString(),
            "pagination[pageSize]": pageSize.toString(),
            "populate[populate][user]": "*",
            "populate[user]": "*",
            "populate[category]": "*",
            
        });

        // Tambahkan filter dengan format yang benar
        if (filter.search) {
            query.append("filters[title][$eqi]", filter.search); // eqi = equal insensitive (case-insensitive)
        }

        if (filter.category) {
            query.append("populate[category]", filter.category);
        }

        const response = await axios.get(`${API_BASE}/articles?${query.toString()}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
// console.log(`first00009999 ${response.data.category.id}`)
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch articles");
    }
});

export const fetchArticleById = createAsyncThunk<Article, number | string>(
    "articles/fetchArticleById",
    async (id, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.get(`${API_BASE}/articles/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch article");
        }
    }
);

// tambahkan add
export const createArticle = createAsyncThunk<Article, Partial<Article>>(
    "articles/createArticle",
    async (data, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(`${API_BASE}/articles`,  { data: data } , {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to create article");
        }
    }
);


export const updateArticle = createAsyncThunk<
    Article,
    { id: number | string; data: Partial<Article> }
>("articles/updateArticle", async ({ id, data }, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.put(`${API_BASE}/articles/${id}`, {data} , {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Failed to update article");
    }
});


// Tambahan: Delete
export const deleteArticle = createAsyncThunk<
    { id: number | string },
    number | string
>("articles/deleteArticle", async (id, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_BASE}/articles/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return { id };
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Failed to delete article");
    }
});


const articleSlice = createSlice({
    name: "articles",
    initialState,
    reducers: {
        setFilter(state, action: PayloadAction<ArticleFilter>) {
            state.filter = action.payload;
            state.page = 1;
        },
        setPage(state, action: PayloadAction<number>) {
            state.page = action.payload;
        },
        setPageSize(state, action: PayloadAction<number>) {
            state.pageSize = action.payload;
            state.page = 1;
        },
        clearSelectedArticle(state) {
            state.selectedArticle = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchArticles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchArticles.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.articles = payload.data;
                state.total = payload.meta.pagination.total;
            })
            .addCase(fetchArticles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchArticleById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchArticleById.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.selectedArticle = payload;
            })
            .addCase(fetchArticleById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createArticle.fulfilled, (state, { payload }) => {
                state.articles.unshift(payload); // menambahkan artikel baru ke awal list
                state.total += 1;
            })

            // Update Article
            .addCase(updateArticle.fulfilled, (state, { payload }) => {
                state.articles = state.articles.map((article) =>
                    article.id === payload.id ? payload : article
                );
                // optional: update selectedArticle if it's the one being updated
                if (state.selectedArticle?.id === payload.id) {
                    state.selectedArticle = payload;
                }
            })
            .addCase(deleteArticle.fulfilled, (state, { payload }) => {
                state.articles = state.articles.filter((article) => article.id !== payload.id);
                state.total -= 1;
            });
    },
});

export const { setFilter, setPage, setPageSize, clearSelectedArticle } = articleSlice.actions;

export default articleSlice.reducer;
