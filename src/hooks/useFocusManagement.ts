import { useEffect, useRef, RefObject } from 'react';

interface FocusManagementOptions {
  trapFocus?: boolean;
  returnFocus?: boolean;
  initialFocus?: RefObject<HTMLElement>;
  onEscape?: () => void;
}

export function useFocusManagement(
  isOpen: boolean,
  options: FocusManagementOptions = {}
) {
  const {
    trapFocus = true,
    returnFocus = true,
    initialFocus,
    onEscape,
  } = options;

  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Store the previously focused element when opening
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Focus management when opening/closing
  useEffect(() => {
    if (!isOpen) {
      // Return focus to the previously focused element
      if (returnFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
      return;
    }

    // Focus initial element or first focusable element
    const focusElement = () => {
      if (initialFocus?.current) {
        initialFocus.current.focus();
      } else if (containerRef.current) {
        const firstFocusable = getFirstFocusableElement(containerRef.current);
        if (firstFocusable) {
          firstFocusable.focus();
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(focusElement, 0);
    return () => clearTimeout(timeoutId);
  }, [isOpen, returnFocus, initialFocus]);

  // Focus trapping
  useEffect(() => {
    if (!isOpen || !trapFocus || !containerRef.current) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onEscape) {
        onEscape();
        return;
      }

      if (event.key === 'Tab') {
        const focusableElements = getFocusableElements(containerRef.current!);
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, trapFocus, onEscape]);

  return containerRef;
}

// Helper function to get focusable elements
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');

  return Array.from(
    container.querySelectorAll(focusableSelectors)
  ) as HTMLElement[];
}

// Helper function to get first focusable element
function getFirstFocusableElement(container: HTMLElement): HTMLElement | null {
  const focusableElements = getFocusableElements(container);
  return focusableElements.length > 0 ? focusableElements[0] : null;
}
