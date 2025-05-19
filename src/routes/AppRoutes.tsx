import { BrowserRouter, Routes, Route } from 'react-router';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import PrivateRoute from './PrivateRoute';
import ArticleList from '../pages/ArticleList';
import ArticleDetail from '../pages/ArticleDetail';
import NotFound from '../pages/NotFound';


const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Semua route di bawah ini harus login dulu */}
      <Route element={<PrivateRoute />}>
        <Route path="/articles" element={<ArticleList />} />
        <Route path="/articles/:id" element={<ArticleDetail />} />
      </Route>

      {/* Route fallback jika tidak ketemu */}
      <Route path="*" element={<NotFound/>} />
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;
