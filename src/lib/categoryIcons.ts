import {
  Book,
  Building2,
  ChartBar,
  Circle,
  FileText,
  GraduationCap,
  Heart,
  Home,
  MessagesSquare,
  Newspaper,
  Shield,
  Trash2,
  TreePine,
  Users,
  Wheat,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

const categoryIcons: Record<string, LucideIcon> = {
  Book,
  Building2,
  ChartBar,
  FileText,
  GraduationCap,
  Heart,
  Home,
  MessagesSquare,
  Newspaper,
  Shield,
  Trash2,
  TreePine,
  Users,
  Wheat,
  Wrench,
};

export function getCategoryIcon(name: string): LucideIcon {
  return categoryIcons[name] ?? Circle;
}

export function CategoryIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return createElement(getCategoryIcon(name), { className });
}
import { createElement } from 'react';
