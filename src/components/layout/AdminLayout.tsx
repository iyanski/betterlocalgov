import { ReactNode, useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import {
  FileText,
  FolderOpen,
  BarChart3,
  Settings,
  Users,
  Menu,
  X,
  LogOut,
  Globe,
  Search,
  Plus,
  Moon,
  Sun,
} from 'lucide-react';
import { Heading } from '../ui/Heading';
import { Text } from '../ui/Text';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../ui/LoadingSpinner';
import Stack from '../ui/Stack.tsx';
import Icon from '../ui/Icon.tsx';
import Toggle from '../ui/Toggle.tsx';
import { ThemeContext } from '../../contexts/ThemeContext.tsx';

interface AdminLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Analytics', href: '/admin', icon: BarChart3 },
  { separator: true },
  {
    name: 'Documents',
    href: '/admin/documents',
    icon: FileText,
    rightIcon: Plus,
  },
  { name: 'Categories', href: '/admin/categories', icon: FolderOpen },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { theme: currentTheme, setTheme } = useContext(ThemeContext);
  const { logout, isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  console.log('currentTheme', currentTheme);

  // Redirect to login if not authenticated
  useEffect(() => {
    console.log('isAuthenticated', isAuthenticated);
    if (!isLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLogout = () => {
    setSidebarOpen(false);
    logout(() => {
      navigate('/admin/login');
    });
  };

  const onChangeTheme = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4">
            <Heading level={3} className="text-sm font-bold text-gray-900 mb-0">
              BetterLocalGov
            </Heading>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map(item => {
              const isActive = location.pathname === item.href;
              // if (item.separator === true) {
              //   return <br className="my-4" key={item.name} />;
              // }
              return (
                <Link
                  key={item.name}
                  to={item.href!}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.icon && <item.icon className="mr-3 h-5 w-5" />}
                  {item.name}
                  {item.rightIcon && (
                    <Button icon={<Icon icon={item.rightIcon} />} />
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-none p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <Users className="h-4 w-4 text-gray-600" />
                </div>
              </div>
              <div className="ml-3">
                <Text className="text-sm font-medium text-gray-700">
                  Admin User
                </Text>
                <Text className="text-xs text-gray-500">admin@example.com</Text>
              </div>
            </div>
            <Button onClick={handleLogout}>
              {/* <button className="mt-3 flex items-center text-sm text-gray-600 hover:text-gray-900"> */}
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
              {/* </button> */}
            </Button>
            <Button href="/">
              <Globe className="mr-2 h-4 w-4" />
              View Site
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-none">
          <div className="flex h-16 items-center px-4 border-b border-none">
            <span className="text-md font-bold text-gray-900">
              BetterLocalGov
            </span>
            <Search className="h-4 w-4 ml-auto" />
          </div>
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map(item => {
              const isActive = location.pathname === item.href;
              if (item.separator) {
                return <div className="bg-gray-200 my-4 mx-10" />;
              }
              return (
                <Link
                  key={item.name}
                  to={item.href!}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {item.icon && <item.icon className="mr-3 h-5 w-5" />}
                  {item.name}
                  {item.rightIcon && (
                    <Button
                      appearance="subtle"
                      circle
                      icon={<Icon icon={item.rightIcon} />}
                      className="ml-auto self-end"
                      onClick={e => {
                        e.preventDefault();
                        navigate(`${item.href}/new`);
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-none p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <Users className="h-4 w-4 text-gray-600" />
                </div>
              </div>
              <div className="ml-3">
                <Text className="text-sm font-medium text-gray-700">
                  Admin User
                </Text>
                <Text className="text-xs text-gray-500">admin@example.com</Text>
              </div>
            </div>
            <Stack
              direction="horizontal"
              gap="medium"
              justify="between"
              align="center"
              wrap="noWrap"
            >
              <Button
                appearance="subtle"
                href="/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Globe className="mr-2 h-4 w-4" />
                View Site
              </Button>
              {/* <Button appearance="subtle" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button> */}
              <Toggle
                checked={currentTheme === 'dark'}
                onChange={onChangeTheme}
                icon={currentTheme === 'dark' ? Moon : Sun}
              />
            </Stack>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-none bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 "
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
