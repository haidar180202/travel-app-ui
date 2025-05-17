import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchArticleById } from '../redux/slices/articleSlice';
import { Button } from '../components/ui/Button';

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [data, setData] = useState<any>(null);

  const { loading, error } = useAppSelector((state) => state.articles);

  useEffect(() => {
    if (id) {
      dispatch(fetchArticleById(id))
        .unwrap()
        .then((res) => setData(res))
        .catch((err) => console.error('Error fetching article:', err));
    }
  }, [id, dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-10 text-lg font-medium">
        Error: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-gray-500 py-10">
        Article not found.
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto px-6 py-10 text-gray-800">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 mb-8 text-sm font-semibold text-blue-700 hover:text-blue-900 transition"
      >
        ← Kembali
      </button>

      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight mb-4">
        {data.title}
      </h1>

      <p className="text-sm text-gray-500 mb-6">
        {data.publishedAt
          ? `Dipublikasikan pada ${new Date(data.publishedAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}`
          : 'Tanggal tidak diketahui'}
      </p>

      {data.cover_image_url && (
        <div className="w-full mb-10 overflow-hidden rounded-2xl shadow-lg">
          <img
            src={data.cover_image_url}
            alt={data.title}
            className="w-full h-[420px] object-cover rounded-2xl transition-transform duration-500 hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.jpg';
            }}
          />
        </div>
      )}

      <div
        className="prose prose-lg prose-sky max-w-none mb-12 leading-relaxed text-justify text-gray-700"
        dangerouslySetInnerHTML={{ __html: data.description }}
      />

      <div className="flex flex-wrap gap-4 mt-10">
        <Button
          variant="primary"
          className="transition-all hover:shadow-lg hover:-translate-y-1"
          onClick={() =>
            window.open(`https://facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')
          }
        >
          📘 Bagikan ke Facebook
        </Button>
        <Button
          variant="secondary"
          className="transition-all hover:shadow-lg hover:-translate-y-1"
          onClick={() =>
            window.open(`https://twitter.com/intent/tweet?url=${window.location.href}`, '_blank')
          }
        >
          🐦 Bagikan ke Twitter
        </Button>
      </div>
    </div>
  );
};

export default ArticleDetail;
