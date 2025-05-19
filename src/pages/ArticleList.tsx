import  { useEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
    fetchArticles,
    setPage,
    updateArticle,
    deleteArticle,
    createArticle,
} from "../redux/slices/articleSlice";
import type { RootState } from "../redux/store";
import { Link } from "react-router";

import { fetchCategories } from "../redux/slices/categorySlice";

const ArticleList = () => {
    const dispatch = useAppDispatch();
    const { articles, loading, error, page, pageSize, total, filter } = useAppSelector(
        (state: RootState) => state.articles
    );

    const { data: categories } = useAppSelector((state: RootState) => state.category);

    const { user } = useAppSelector((state: RootState) => state.auth);

    const [editModal, setEditModal] = useState<any | null>(null);
    const [deleteModal, setDeleteModal] = useState<any | null>(null);
    const [createModal, setCreateModal] = useState<boolean>(false);
    const [editForm, setEditForm] = useState({
        title: "",
        description: "",
        cover_image_url: "",
        category: 0
    });
    const [statusProses, setStatusProses] = useState("");



    const totalPages = Math.ceil(total / pageSize);

    useEffect(() => {
        if (!categories || categories.length === 0) {
            dispatch(fetchCategories()); // pastikan fetchCategories() ada di categorySlice
        }
    }, [dispatch, categories]);

    useEffect(() => {
        dispatch(fetchArticles({ page, pageSize, filter }));
        const timeout = setTimeout(() => {
            setStatusProses("");
        }, 1000);
        return () => clearTimeout(timeout);
    }, [dispatch, page, pageSize, filter, statusProses]);


    const openEditModal = (article: any) => {
        console.log(article)
        setEditModal(article);
        setEditForm({
            title: article.title || "",
            description: article.description || "",
            cover_image_url: article.cover_image_url || "",
            category: article?.category?.id || null
        });
    };


    const openCreateModal = () => {
        setCreateModal(true);
        setEditForm({
            title: "",
            description: "",
            cover_image_url: "",
            category: 0
        });
    };

    const isFormValid = () => editForm.title.trim() && editForm.description.trim();

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

    const confirmDelete = (article: any) => {
        setDeleteModal(article);
    };

    const handleDelete = () => {
        dispatch(deleteArticle(deleteModal.documentId));
        setStatusProses("berhasil mendelete data");
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

                <select
                    value={editForm?.category}
                    onChange={(e) => setEditForm({ ...editForm, category: Number(e.target.value) })}
                    className="px-4 py-2 rounded-lg border border-gray-300 w-full mb-4"
                >

                    {categories?.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>


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
                                alt={article.title || "Unknown title"}
                                className="w-full h-48 object-cover"
                            />
                        </Link>
                        <div className="p-5">
                            <h2 className="text-lg font-semibold text-blue-800 mb-2 line-clamp-2">
                                {article.title}
                            </h2>
                            <p className="text-sm text-gray-600 line-clamp-3">{article.description}</p>
                            <div className="mt-4 flex justify-between">
                                {article?.user?.email === user?.email ? (
                                    <>
                                        <button
                                            onClick={() => openEditModal(article)}
                                            className="text-sm text-blue-600 hover:underline focus:outline-none focus:ring-1 focus:ring-blue-400 rounded"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(article)}
                                            className="text-sm text-red-600 hover:underline focus:outline-none focus:ring-1 focus:ring-red-400 rounded"
                                        >
                                            🗑 Delete
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-red-900 font-bold">You Dont Have To Modify Is Not Your</div>
                                    </>
                                )}

                                
                            </div>

                            <Link to={`/articles/${article.documentId}`}>
                                    <button
                                            onClick={() => openEditModal(article)}
                                            className="btn text-sm text-blue-600 hover:underline mt-5"
                                        >
                                            View Detail
                                        </button>
                                </Link>
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

            {/* Modals */}
            {editModal && renderFormModal(true)}
            {createModal && renderFormModal(false)}
            {deleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-lg font-semibold text-red-600 mb-4">
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
