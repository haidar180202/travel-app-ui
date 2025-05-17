import React, { useEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
    fetchArticles,
    setFilter,
    setPage,
    updateArticle,
    deleteArticle,
    createArticle, // <-- pastikan action ini tersedia di redux
} from "../redux/slices/articleSlice";
import type { RootState } from "../redux/store";
import { Link } from "react-router";
import debounce from "lodash.debounce";

const ArticleList = () => {
    const dispatch = useAppDispatch();
    const { articles, loading, error, page, pageSize, total, filter } = useAppSelector(
        (state: RootState) => state.articles
    );

    const [search, setSearch] = useState(filter.search || "");
    const [editModal, setEditModal] = useState<any | null>(null);
    const [deleteModal, setDeleteModal] = useState<any | null>(null);
    const [createModal, setCreateModal] = useState<boolean>(false);

    const [editForm, setEditForm] = useState({
        title: "",
        description: "",
        cover_image_url: "",
    });

    const totalPages = Math.ceil(total / pageSize);

    useEffect(() => {
        dispatch(fetchArticles({ page, pageSize, filter }));
    }, [dispatch, page, pageSize, filter]);

    // Debounced search dispatch
    const debouncedSearch = useCallback(
        debounce((searchTerm: string) => {
            dispatch(setFilter({ ...filter, search: searchTerm }));
        }, 500),
        [dispatch, filter]
    );

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        debouncedSearch(e.target.value);
    };

    const openEditModal = (article: any) => {
        setEditModal(article);
        setEditForm({
            title: article.title,
            description: article.description,
            cover_image_url: article.cover_image_url,
        });
    };

    const openCreateModal = () => {
        setCreateModal(true);
        setEditForm({
            title: "",
            description: "",
            cover_image_url: "",
        });
    };

    const isFormValid = () => {
        return editForm.title.trim() && editForm.description.trim();
    };

    const submitEdit = () => {
        if (!isFormValid()) return alert("Title and description are required.");
        dispatch(updateArticle({ id: editModal.documentId, data: editForm }));
        setEditModal(null);
    };

    const submitCreate = () => {
        if (!isFormValid()) return alert("Title and description are required.");
        dispatch(createArticle(editForm));
        setCreateModal(false);
    };

    const confirmDelete = (article: any) => {
        setDeleteModal(article);
    };

    const handleDelete = () => {
        dispatch(deleteArticle(deleteModal.id));
        setDeleteModal(null);
    };

    const renderFormModal = (isEdit = true) => (
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
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
                <textarea
                    placeholder="Description"
                    className="w-full mb-3 px-3 py-2 border rounded"
                    rows={4}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Image URL"
                    className="w-full mb-4 px-3 py-2 border rounded"
                    value={editForm.cover_image_url}
                    onChange={(e) => setEditForm({ ...editForm, cover_image_url: e.target.value })}
                />
                <div className="flex justify-end gap-2">
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
                    />
                </form>
                <button
                    onClick={openCreateModal}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                    ➕ Create Article
                </button>
            </div>

            {/* Loading/Error/Empty */}
            {loading && (
                <div className="flex justify-center py-10">
                    <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full" />
                </div>
            )}
            {error && <p className="text-red-600 text-center font-semibold mb-6">Error: {error}</p>}
            {!loading && articles.length === 0 && (
                <p className="text-center text-gray-500">No articles found.</p>
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
                                alt={article.title || "data tidak diketahui"}
                                className="w-full h-48 object-cover"
                                // onError={(e) => {
                                //     (e.target as HTMLImageElement).src = "/placeholder.jpg";
                                // }}
                            />
                        </Link>
                        <div className="p-5">
                            <h2 className="text-lg font-semibold text-blue-800 mb-2 line-clamp-2">
                                {article.title}
                            </h2>
                            <p className="text-sm text-gray-600 line-clamp-3">{article.description}</p>
                            <div className="mt-4 flex justify-between">
                                <button
                                    onClick={() => openEditModal(article)}
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    onClick={() => confirmDelete(article)}
                                    className="text-sm text-red-600 hover:underline"
                                >
                                    🗑 Delete
                                </button>
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
                >
                    ⬅ Previous
                </button>
                <p className="text-gray-700 font-medium">
                    Page {page} of {totalPages}
                </p>
                <button
                    disabled={page >= totalPages || loading}
                    onClick={() => dispatch(setPage(page + 1))}
                    className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 transition"
                >
                    Next ➡
                </button>
            </div>

            {/* Modal Edit & Create */}
            {editModal && renderFormModal(true)}
            {createModal && renderFormModal(false)}

            {/* Delete Modal */}
            {deleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg text-center">
                        <h3 className="text-lg font-semibold mb-4 text-red-600">
                            Are you sure you want to delete this article?
                        </h3>
                        <p className="text-sm text-gray-700 mb-6">{deleteModal.title}</p>
                        <div className="flex justify-center gap-4">
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
