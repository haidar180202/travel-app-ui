
const LandingPage = () => {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 px-4">
      <section className="text-center p-10 bg-white rounded-xl shadow-lg max-w-2xl w-full">
        <h1 className="text-4xl font-extrabold text-indigo-700 mb-4">
          Welcome to Travel Article App
        </h1>
        <p className="text-gray-600 text-lg mb-6">
          Discover, read, and share amazing travel experiences from all over the world.
        </p>
        <a
          href="/articles"
          className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors"
        >
          Explore Articles
        </a>
      </section>
    </main>
  );
};

export default LandingPage;
