import { useParams } from 'react-router';
import {
  governmentCategories,
  getCategorySubcategories,
  type CategoryIndex,
} from '../data/yamlLoader';
import GovernmentActivitySection from '../components/home/GovernmentActivitySection';
import CategoryPage from '../components/sections/CategoryPage';
import SEO from '../components/SEO';
import { useState, useEffect } from 'react';

const Government: React.FC = () => {
  const { category } = useParams();
  const [categoryIndex, setCategoryIndex] = useState<CategoryIndex>({
    layout: 'list',
    pages: [],
  });
  const [loading, setLoading] = useState(false);

  const getCategory = () => {
    return governmentCategories.categories.find(c => c.slug === category);
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
        <GovernmentActivitySection
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
        basePath="/government"
      />
    </>
  );
};

export default Government;
