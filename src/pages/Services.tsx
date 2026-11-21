import { useParams } from 'react-router';
import {
  serviceCategories,
  getCategorySubcategories,
  type CategoryIndex,
} from '../data/yamlLoader';
import ServicesSection from '../components/home/ServicesSection';
import CategoryPage from '../components/sections/CategoryPage';
import SEO from '../components/SEO';
import { useState, useEffect } from 'react';

const Services: React.FC = () => {
  const { category } = useParams();
  const [categoryIndex, setCategoryIndex] = useState<CategoryIndex>({
    layout: 'list',
    pages: [],
  });
  const [loading, setLoading] = useState(false);

  const getCategory = () => {
    return serviceCategories.categories.find(c => c.slug === category);
  };

  const categoryData = getCategory();
  useEffect(() => {
    if (category && categoryData) {
      setLoading(true);
      getCategorySubcategories(category)
        .then(setCategoryIndex)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [category, categoryData]);

  if (!category) {
    return (
      <>
        <SEO
          title="Services"
          description={`All services provided by the ${import.meta.env.VITE_GOVERNMENT_NAME} government. Find what you need for citizenship, business, education, and more.`}
          keywords="government services, public services, local government, civic services"
        />
        <ServicesSection
          title={`All local government services`}
          description={`All services provided by the ${import.meta.env.VITE_GOVERNMENT_NAME} government. Find what you need for citizenship, business, education, and more.`}
        />
      </>
    );
  }
  return (
    <>
      {categoryData && (
        <SEO
          title={categoryData.category}
          description={categoryData.description}
          keywords={`${categoryData.category}, government services, public services, local government`}
        />
      )}
      <CategoryPage
        category={categoryData}
        index={categoryIndex}
        loading={loading}
        basePath="/services"
      />
    </>
  );
};

export default Services;
