import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/Card';
import Stack from '../../../components/ui/Stack';
import { adminApiService } from '../../../services/admin.api';
import { DocumentRequest } from '../../../services/api';
import { DocumentRequestConfirmationModal } from '../../../components/admin';
import { useContentCrud } from '../../../hooks/useApiData';

export default function DocumentRequests() {
  const token = localStorage.getItem('auth_token');
  const [documentRequests, setDocumentRequests] = useState<DocumentRequest[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const { deleteContent, loading: crudLoading } = useContentCrud(
    token || undefined
  );

  useEffect(() => {
    if (token) {
      loadDocumentRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const [actionModal, showActionModal] = useState<{
    isOpen: boolean;
    documentRequest: DocumentRequest | null;
  }>({
    isOpen: false,
    documentRequest: null,
  });

  const loadDocumentRequests = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await adminApiService.getAdminDocumentRequests(token);
      setDocumentRequests(response.data);
    } catch (err) {
      console.error('Error loading document requests:', err);
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!actionModal.documentRequest || !actionModal.documentRequest.id) return;

    try {
      await deleteContent(actionModal.documentRequest.id || '');
      loadDocumentRequests();
      showActionModal({ isOpen: false, documentRequest: null });
    } catch {
      // Error is handled by the hook
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-900 dark:text-gray-100">
            Loading document requests...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <Stack direction="horizontal" justify="between" align="center">
          <CardTitle>Document Requests</CardTitle>
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
                  Document Request
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Requested BY
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider text-right">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {documentRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No document requests yet.
                  </td>
                </tr>
              ) : (
                documentRequests.map(doc => (
                  <tr
                    key={doc.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {doc.document_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {doc.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {doc.requestedBy.firstName} {doc.requestedBy.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {doc.status}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      <DocumentRequestConfirmationModal
        documentRequest={actionModal.documentRequest}
        isOpen={actionModal.isOpen}
        onClose={() =>
          showActionModal({ isOpen: false, documentRequest: null })
        }
        onConfirm={handleConfirmAction}
        okLabel="Delete"
        loading={crudLoading}
      />
    </Card>
  );
}
