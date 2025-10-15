import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/Card';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import Stack from '../../../components/ui/Stack';
import Button from '../../../components/ui/Button';
import { Link } from 'react-router-dom';
import { adminApiService } from '../../../services/admin.api';
import { DocumentType } from '../../../services/api';
import { DocumentTypeDeleteModal } from '../../../components/admin';
import { useContentCrud } from '../../../hooks/useApiData';
import { useAuth } from '../../../hooks/useAuth';

export default function DocumentTypes() {
  const { isAuthenticated } = useAuth();
  const token = localStorage.getItem('auth_token');
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const { deleteContent, loading: crudLoading } = useContentCrud(
    token || undefined
  );

  useEffect(() => {
    if (token) {
      loadDocumentTypes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    documentType: DocumentType | null;
  }>({
    isOpen: false,
    documentType: null,
  });

  const loadDocumentTypes = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await adminApiService.getAdminDocumentTypes(token);
      setDocumentTypes(response.data);
    } catch (err) {
      console.error('Error loading document types:', err);
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (documentType: DocumentType) => {
    if (!isAuthenticated) {
      alert(
        'Authentication required to delete categories. Please log in to the admin panel.'
      );
      return;
    }
    setDeleteModal({ isOpen: true, documentType });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.documentType) return;

    try {
      await deleteContent(deleteModal.documentType.id || '');
      loadDocumentTypes();
      setDeleteModal({ isOpen: false, documentType: null });
    } catch {
      // Error is handled by the hook
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-900 dark:text-gray-100">
            Loading document types...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <Stack direction="horizontal" justify="between" align="center">
          <CardTitle>Document Types</CardTitle>
          <Link to="/admin/document-types/new#editor/document-type">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Document Type
            </Button>
          </Link>
        </Stack>
      </CardHeader>
      <CardContent className="p-0">
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Document Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {documentTypes.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No document types found. Create your first document type to
                    get started.
                  </td>
                </tr>
              ) : (
                documentTypes.map(doc => (
                  <tr
                    key={doc.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {doc.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {doc.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                        <button
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
                          title="Edit document"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc)}
                          disabled={!isAuthenticated}
                          className={`p-1 ${
                            isAuthenticated
                              ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 cursor-pointer'
                              : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                          }`}
                          title={
                            isAuthenticated
                              ? 'Delete category'
                              : 'Authentication required'
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      <DocumentTypeDeleteModal
        documentType={deleteModal.documentType}
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, documentType: null })}
        onConfirm={handleConfirmDelete}
        loading={crudLoading}
      />
    </Card>
  );
}
