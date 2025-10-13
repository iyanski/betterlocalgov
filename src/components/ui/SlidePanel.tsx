import { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './Card';
import Stack from './Stack';
import { PanelRightClose } from 'lucide-react';

const SIDEPANEL_CONTAINER_CLASS =
  'fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-800 transition-transform duration-300 ease-out transform z-50';

export default function SlidePanel({
  title,
  children,
  open,
  onClose,
  footer,
}: {
  title: string;
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  footer: React.ReactNode;
}) {
  // Handle Escape key to close panel
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  return (
    <div
      className={`${SIDEPANEL_CONTAINER_CLASS} ${open ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <Card className="rounded-none border-l border-r-0 border-t-0 border-b-0 h-full">
        <CardHeader className="border-b-0">
          <CardTitle>
            <Stack justify="between">
              {title}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <PanelRightClose className="h-4 w-4" />
              </button>
            </Stack>
          </CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
        <CardFooter>{footer}</CardFooter>
      </Card>
    </div>
  );
}
