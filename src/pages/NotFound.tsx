const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 px-4">
      <h1 className="text-9xl font-extrabold text-blue-600 mb-6">404</h1>
      <h2 className="text-3xl sm:text-4xl font-semibold text-gray-800 mb-4">
        Page Not Found
      </h2>
      <p className="text-gray-600 max-w-md text-center mb-8">
        Oops! The page you are looking for doesn’t exist or has been moved.
      </p>
      <a
        href="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Go to Homepage
      </a>
    </div>
  );
};

export default NotFound;
