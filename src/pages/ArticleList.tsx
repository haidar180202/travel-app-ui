import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
fetchArticles,
setFilter,
setPage,
updateArticle,
deleteArticle,
createArticle,
} from "../redux/slices/articleSlice";
import type { RootState } from "../redux/store";
import { Link } from "react-router";
import debounce from "lodash.debounce";
import { fetchCategories } from "../redux/slices/categorySlice";

const ArticleList = () => {
const dispatch = useAppDispatch();
const { articles, loading, error, page, pageSize, total, filter } = useAppSelector(
(state: RootState) => state.articles
);

const { data: categories } = useAppSelector((state: RootState) => state.category);

const { email: user } = useAppSelector((state: RootState) => state.auth.user);

// Local states
const [search, setSearch] = useState(filter.search || "");
const [searchCategory, setSearchCategory] = useState(filter.category || "");
const [editModal, setEditModal] = useState<any | null>(null);
const [createModal, setCreateModal] = useState(false);
const [deleteModal, setDeleteModal] = useState<any | null>(null);
const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    cover_image_url: "",
    category: 0,
});
const [statusProses, setStatusProses] = useState("");

// Memoized total pages
const totalPages = useMemo(() => Math.ceil(total / pageSize), [total, pageSize]);

// Fetch categories if not loaded
useEffect(() => {
    if (!categories || categories.length === 0) {
        dispatch(fetchCategories());
    }
}, [dispatch, categories]);

// Fetch articles on page, pageSize, filter or statusProses change
useEffect(() => {
    dispatch(fetchArticles({ page, pageSize, filter }));
    if (statusProses) {
        const timeout = setTimeout(() => {
            setStatusProses("");
        }, 1000);
        return () => clearTimeout(timeout);
    }
}, [dispatch, page, pageSize, filter, statusProses]);

// Debounced search dispatch
// We debounce only the dispatch, not the state update for instant UI feedback
const debouncedSetFilter = useMemo(() => {
    return debounce((searchTerm: string) => {
        dispatch(setFilter({ ...filter, search: searchTerm }));
        dispatch(setPage(1));
    }, 500);
}, [dispatch, filter]);

// Cleanup debounce on unmount
useEffect(() => {
    return () => {
        debouncedSetFilter.cancel();
    };
}, [debouncedSetFilter]);

// Handlers memoized with useCallback to avoid re-creation on each render
const onSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearch(val);
        debouncedSetFilter(val);
    },
    [debouncedSetFilter]
);

const onCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
        const category = e.target.value;
        setSearchCategory(category);
        dispatch(setFilter({ ...filter, category }));
        dispatch(setPage(1));
    },
    [dispatch, filter]
);

// Open edit modal and set form data
const openEditModal = useCallback(
    (article: any) => {
        setEditModal(article);
        setEditForm({
            title: article.title || "",
            description: article.description || "",
            cover_image_url: article.cover_image_url || "",
            category: article?.category?.id || 0,
        });
    },
    []
);

// Open create modal and reset form
const openCreateModal = useCallback(() => {
    setCreateModal(true);
    setEditForm({
        title: "",
        description: "",
        cover_image_url: "",
        category: 0,
    });
}, []);

// Validate form fields
const isFormValid = useCallback(() => {
    return editForm.title.trim() !== "" && editForm.description.trim() !== "";
}, [editForm]);

// Submit edit article
const submitEdit = useCallback(async () => {
    if (!isFormValid()) {
        alert("Title and description are required.");
        return;
    }
    if (!editModal) return;
    try {
        await dispatch(updateArticle({ id: editModal.documentId, data: editForm })).unwrap();
        setStatusProses("berhasil mengubah data");
        setEditModal(null);
    } catch (error) {
        alert("Gagal mengupdate artikel");
    }
}, [dispatch, editForm, editModal, isFormValid]);

// Submit create article
const submitCreate = useCallback(() => {
    if (!isFormValid()) {
        alert("Title and description are required.");
        return;
    }
    dispatch(createArticle(editForm));
    setStatusProses("berhasil menambah data");
    setCreateModal(false);
}, [dispatch, editForm, isFormValid]);

// Confirm delete modal open
const confirmDelete = useCallback((article: any) => {
    setDeleteModal(article);
}, []);

// Handle delete article
const handleDelete = useCallback(() => {
    if (!deleteModal) return;
    dispatch(deleteArticle(deleteModal.documentId));
    setStatusProses("berhasil mendelete data");
    setDeleteModal(null);
}, [dispatch, deleteModal]);

// Modal form component to reduce duplication
const FormModal = useCallback(
    ({ isEdit }: { isEdit: boolean }) => (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
                <h2 className="text-xl font-semibold text-blue-700 mb-4">
                    {isEdit ? "Edit Article" : "Create New Article"}
                </h2>
                <input
                    type="text"
                    placeholder="Title"
                    className="w-full mb-3 px-3 py-2 border rounded"
                    value={editForm.title}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                />
                <textarea
                    placeholder="Description"
                    className="w-full mb-3 px-3 py-2 border rounded"
                    rows={4}
                    value={editForm.description}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                />
                <input
                    type="text"
                    placeholder="Image URL"
                    className="w-full mb-4 px-3 py-2 border rounded"
                    value={editForm.cover_image_url}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, cover_image_url: e.target.value }))}
                />
                <select
                    value={editForm.category}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, category: Number(e.target.value) }))}
                    // className="px-4 py-2 rounded-lg border border-gray-300"
                    className="w-full mb-4 px-3 py-2 border rounded"
                >
                     <option value="">All Categories</option>
                    {categories?.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
                <div className="flex justify-end gap-2 mt-4">
                    <button
                        onClick={() => (isEdit ? setEditModal(null) : setCreateModal(false))}
                        className="px-4 py-2 rounded bg-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={isEdit ? submitEdit : submitCreate}
                        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    ),
    [editForm, categories, submitEdit, submitCreate]
);

return (
    <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold text-center text-blue-800 mb-10 tracking-tight">
            🌍 Travel Articles & Guides
        </h1>

        {/* Search & Add */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-10">
            <form onSubmit={(e) => e.preventDefault()} className="flex w-full sm:w-auto gap-2">
                <input
                    type="text"
                    placeholder="Search articles..."
                    value={search}
                    onChange={onSearchChange}
                    className="w-full sm:w-96 px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    aria-label="Search articles"
                />
                <select
                    value={searchCategory}
                    onChange={onCategoryChange}
                    className="px-4 py-2 rounded-lg border border-gray-300"
                    aria-label="Filter by category"
                >
                    <option value="">All Categories</option>
                    {categories?.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </form>

            <button
                onClick={openCreateModal}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                aria-label="Create new article"
            >
                ➕ Create Article
            </button>
        </div>

        {/* Loading/Error/Empty */}
        {loading && (
            <div className="flex justify-center py-10" role="status" aria-live="polite">
                <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
        )}
        {error && (
            <p className="text-red-600 text-center font-semibold mb-6" role="alert">
                Error: {error}
            </p>
        )}
        {!loading && articles.length === 0 && (
            <p className="text-center text-gray-500" role="status" aria-live="polite">
                No articles found.
            </p>
        )}

        {/* Article Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article: any) => (
                <div
                    key={article.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden transform transition hover:scale-[1.02] hover:shadow-lg"
                >
                    <Link to={`/articles/${article.documentId}`}>
                        <img
                            src={article.cover_image_url || "/placeholder.jpg"}
                            alt={article.title || "Unknown title"}
                            className="w-full h-48 object-cover"
                            loading="lazy"
                        />
                    </Link>
                    <div className="p-5">
                        <h2 className="text-lg font-semibold text-blue-800 mb-2 line-clamp-2">
                            {article.title}
                        </h2>
                        <p className="text-sm text-gray-600 line-clamp-3">{article.description}</p>
                        <div className="mt-4 flex justify-between">
                            {article.user.email === user ? (
                                <>
                                    <button
                                        onClick={() => openEditModal(article)}
                                        className="text-sm text-blue-600 hover:underline"
                                        aria-label={`Edit article titled ${article.title}`}
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        onClick={() => confirmDelete(article)}
                                        className="text-sm text-red-600 hover:underline"
                                        aria-label={`Delete article titled ${article.title}`}
                                    >
                                        🗑 Delete
                                    </button>
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Pagination */}
        <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
                disabled={page <= 1 || loading}
                onClick={() => dispatch(setPage(page - 1))}
                className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 transition"
                aria-label="Previous page"
            >
                ⬅ Previous
            </button>
            <p className="text-gray-700 font-medium" aria-live="polite" aria-atomic="true">
                Page {page} of {totalPages}
            </p>
            <button
                disabled={page >= totalPages || loading}
                onClick={() => dispatch(setPage(page + 1))}
                className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 transition"
                aria-label="Next page"
            >
                Next ➡
            </button>
        </div>

        {/* Modals */}
        {editModal && <FormModal isEdit={true} />}
        {createModal && <FormModal isEdit={false} />}
        {deleteModal && (
            <div
                className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-dialog-title"
            >
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                    <h2
                        id="delete-dialog-title"
                        className="text-lg font-semibold text-red-600 mb-4"
                    >
                        Are you sure you want to delete this article?
                    </h2>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setDeleteModal(null)}
                            className="px-4 py-2 bg-gray-200 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
);
};

export default ArticleList;