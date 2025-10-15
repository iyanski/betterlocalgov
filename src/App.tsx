import { NuqsAdapter } from 'nuqs/adapters/react';
import Home from './pages/Home';
import ScrollToTop from './components/ui/ScrollToTop';
import Services from './pages/Services';
import Document from './pages/Document';
import AdminDashboard from './pages/admin/Dashboard';
import AdminLayout from './components/layout/AdminLayout';
import AdminFullLayout from './components/layout/AdminFullLayout';
import Layout from './components/layout/Layout';
import AuthLayout from './components/layout/AuthLayout';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Categories from './pages/admin/Categories';
import Documents from './pages/admin/Documents';
import Login from './pages/admin/Login';
import NewDocument from './pages/admin/Documents/NewDocument';
import { ThemeProvider } from './contexts/ThemeProvider.tsx';
import DocumentTypes from './pages/admin/DocumentTypes/index.tsx';
import NewDocumentType from './pages/admin/DocumentTypes/NewDocumentType.tsx';

function App() {
  return (
    <Router>
      <NuqsAdapter>
        <ThemeProvider>
          <div className="min-h-screen flex flex-col">
            <ScrollToTop />
            <Routes>
              <Route
                path="/"
                element={
                  <Layout>
                    <Home />
                  </Layout>
                }
              />
              <Route
                path="/services/:category"
                element={
                  <Layout>
                    <Services />
                  </Layout>
                }
              />
              <Route
                path="/services"
                element={
                  <Layout>
                    <Services />
                  </Layout>
                }
              />
              <Route
                path="/:lang/:documentSlug"
                element={
                  <Layout>
                    <Document />
                  </Layout>
                }
              />
              <Route
                path="/:documentSlug"
                element={
                  <Layout>
                    <Document />
                  </Layout>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/login"
                element={
                  <AuthLayout>
                    <Login />
                  </AuthLayout>
                }
              />
              <Route
                path="/admin/documents/new"
                element={
                  <AdminFullLayout>
                    <NewDocument />
                  </AdminFullLayout>
                }
              />
              <Route
                path="/admin/document-types/new"
                element={
                  <AdminFullLayout>
                    <NewDocumentType />
                  </AdminFullLayout>
                }
              />
              <Route
                path="/admin/*"
                element={
                  <AdminLayout>
                    <Routes>
                      <Route path="/" element={<AdminDashboard />} />
                      <Route path="/dashboard" element={<AdminDashboard />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/documents" element={<Documents />} />
                      <Route
                        path="/document-types"
                        element={<DocumentTypes />}
                      />
                      {/* Additional admin routes will be added here */}
                    </Routes>
                  </AdminLayout>
                }
              />
            </Routes>
          </div>
        </ThemeProvider>
      </NuqsAdapter>
    </Router>
  );
}

export default App;
