import { Card, CardContent } from '../../components/ui/Card';
import { Heading } from '../../components/ui/Heading';
import { Text } from '../../components/ui/Text';
import Section from '../../components/ui/Section';
import {
  FileText,
  Settings,
  BarChart3,
  Globe,
  Edit3,
  Eye,
  Plus,
} from 'lucide-react';

export default function AdminDashboard() {
  // Mock data - in a real app, this would come from your CMS/API
  const stats = {
    totalDocuments: 24,
    totalCategories: 8,
    totalViews: 1250,
    lastUpdated: '2 hours ago',
  };

  const recentDocuments = [
    {
      id: 1,
      title: 'Apply for Barangay Clearance',
      category: 'Business',
      status: 'Published',
      views: 45,
    },
    {
      id: 2,
      title: 'Get Free Check-ups and Vaccines',
      category: 'Health Services',
      status: 'Published',
      views: 32,
    },
    {
      id: 3,
      title: 'Garbage Collection Schedule',
      category: 'Garbage & Waste Disposal',
      status: 'Draft',
      views: 0,
    },
    {
      id: 4,
      title: 'Local Scholarships Application',
      category: 'Education',
      status: 'Published',
      views: 28,
    },
  ];

  const quickActions = [
    {
      title: 'Create New Document',
      description: 'Add a new service document',
      icon: Plus,
      href: '/admin/documents/new#editor/document',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'Manage Categories',
      description: 'Organize service categories',
      icon: Settings,
      href: '/admin/categories',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      title: 'View Analytics',
      description: 'Check document performance',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      title: 'Site Settings',
      description: 'Configure site-wide settings',
      icon: Globe,
      href: '/admin/settings',
      color: 'bg-gray-500 hover:bg-gray-600',
    },
  ];

  return (
    <div>
      <Section className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Heading
              level={1}
              className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
            >
              Dashboard
            </Heading>
            <Text className="text-gray-600 dark:text-gray-300">
              Manage your government services content and site settings
            </Text>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Total Documents
                    </Text>
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalDocuments}
                    </Text>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Settings className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Categories
                    </Text>
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalCategories}
                    </Text>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Total Views
                    </Text>
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalViews.toLocaleString()}
                    </Text>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Edit3 className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Last Updated
                    </Text>
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.lastUpdated}
                    </Text>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <Heading
              level={5}
              className="text-xl font-semibold text-gray-900 dark:text-white mb-4"
            >
              Quick Actions
            </Heading>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center mb-3">
                      <div
                        className={`p-2 rounded-lg ${action.color} text-white`}
                      >
                        <action.icon className="h-5 w-5" />
                      </div>
                    </div>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {action.title}
                    </span>
                    <Text className="text-sm text-gray-600 dark:text-gray-300">
                      {action.description}
                    </Text>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Documents */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Heading
                level={5}
                className="text-xl font-semibold text-gray-900 dark:text-white"
              >
                Recent Documents
              </Heading>
              <a
                href="/admin/documents"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
              >
                View All
              </a>
            </div>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Document
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Views
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {recentDocuments.map(doc => (
                        <tr
                          key={doc.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {doc.title}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-300">
                              {doc.category}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                doc.status === 'Published'
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                              }`}
                            >
                              {doc.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {doc.views}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>
    </div>
  );
}
