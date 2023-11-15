import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ProtectedRoute from '../pages/components/ProtectedRoute';
import { useRouter } from 'next/router';
import { RootState, setCategories, setFilteredBlogs } from '../pages/redux/store';  // Replace with your actual Redux slice
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Dropdown = styled.select`
  padding: 10px 20px;
  margin: 10px;
  border-radius: 5px;
  border: 1px solid #6A2C70;
  background-color: #FFFFFF;
  color: #6A2C70;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #F5F5F5; 
  }
`;

const Container = styled.div`
  font-family: 'Open Sans', sans-serif;
  background-color: #FFFFFF;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center; // Center content
`;

const Navbar = styled.nav`
  width: 100%;
  background-color: #6A2C70;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #FFFFFF;
`;

const BackButton = styled.button`
  padding: 10px 20px;
  background-color: transparent;
  color: #FFFFFF;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #5A1C60; // slightly darker shade for hover effect
  }
`;

const MainContent = styled.div`
  width: 80%; // 4/5 of the viewport width
  max-width: 1200px; // Optional: Set a maximum width for very wide screens
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Footer = styled.footer`
  width: 100%;
  background-color: #6A2C70;
  padding: 10px 20px;
  text-align: center;
  color: #FFFFFF;
`;

const SelectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
`;

const CategoryButton = styled.button`
  background-color: #6A2C70;
  color: white;
  padding: 10px 20px;
  margin: 10px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

const BlogCard = styled(motion.div)`
  display: flex;
  gap: 20px;
  background-color: #FFFFFF;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 20px;
  margin-top: 20px;
  width: 100%;
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;

  img {
    width: 150px;
    height: 150px;
    object-fit: cover;
    border-radius: 10px;
  }

  .blog-content {
    flex: 1;

    h2 {
      margin: 0;
      margin-bottom: 10px;
    }
  }

  &:hover {
    transform: translateY(-5px);  // Lift the card up by 5 pixels
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);  // Increase the shadow for the lifted effect
  }
`;

const StyledButton = styled.button`
  padding: 10px 20px;
  background-color: #6A2C70; 
  color: #FFFFFF;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #5A1C60; // slightly darker shade for hover effect
  }
`;



const CategoryPage: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const categories = useSelector((state: RootState) => (state.categories as unknown as { data: any[] }).data);
  const [blogs, setBlogs] = useState<any[]>([]);

  // Function to navigate to the blog detail page
  const navigateToBlogDetail = (blogId: string) => {
    router.push(`/BlogDetailedPage/${blogId}`);
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('https://nodejs.backend.techozon.com/api/categories');
        const data = await response.json();
        dispatch(setCategories(data));
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };    
    fetchCategories();
  }, [dispatch]);

  // Fetch sub-categories based on selected category
  const fetchSubCategories = async (categoryId: string) => {
    try {
      const response = await fetch(`https://nodejs.backend.techozon.com/api/subcategories?parentCategory=${categoryId}`);
      if (response.ok) {
        const data = await response.json();
        setSubCategories(data);
      } else {
        const rawResponse = await response.text();
        console.error("Server returned an error: ", rawResponse);
      }
    } catch (error) {
      console.error('Failed to fetch sub-categories:', error);
    }
  };  

  useEffect(() => {
    if (selectedCategory) {
      fetchSubCategories(selectedCategory);
    }
  }, [selectedCategory]);

  // Handle category and sub-category selection
  const handleCategorySelection = async () => {
    if (!selectedCategory || !selectedSubCategory) {
      console.error('Both category and sub-category need to be selected');
      return;
    }
    try {
      const url = `https://nodejs.backend.techozon.com/api/blogs/byCategory?category=${selectedCategory}&subCategory=${selectedSubCategory}`;
      const response = await fetch(url);
      const data = await response.json();
      setBlogs(data.data);
    } catch (error) {
      console.error('Failed to fetch blogs by category:', error);
    }
  };
  
  
  return (
    <Container>
      <Navbar>
        <BackButton onClick={() => router.back()}>← Back</BackButton>
        <h1>Select Category and Sub-Category</h1>
      </Navbar>
  
      <MainContent>
        <SelectionContainer>
          <Dropdown onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setSelectedCategory(e.target.value)}>
            <option value="">--Select Category--</option>
            {Array.isArray(categories) && categories.map((category, index) => (
              <option key={index} value={category._id}>{category.name}</option>
            ))}
          </Dropdown>
  
          {selectedCategory && 
            <Dropdown onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setSelectedSubCategory(e.target.value)}>
              <option value="">--Select Sub-Category--</option>
              {Array.isArray(subCategories) && subCategories.map((sub, index) => (
                <option key={index} value={sub._id}>{sub.name}</option>
              ))}
            </Dropdown>
          }
  
          <StyledButton onClick={handleCategorySelection}>Show Blogs</StyledButton>
        </SelectionContainer>
  
        {Array.isArray(blogs) && blogs.map((blog, index) => (
          <BlogCard key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <img src={blog.image} alt={blog.title} />
            <div className="blog-content">
              <h2>{blog.title}</h2>
              <p>{blog.summary}</p>
              <div dangerouslySetInnerHTML={{ __html: blog.content.substr(0, 150) + '...' }}></div>
              <p>Read Time: {blog.readTime} minutes</p>
              <StyledButton onClick={() => navigateToBlogDetail(blog._id)}>Read More</StyledButton>
            </div>
          </BlogCard>
        ))}
      </MainContent>
  
      <Footer>
        © 2023 My Blog Site. All Rights Reserved.
      </Footer>
    </Container>
  );

};


// New ProtectedCategoryPage component
const ProtectedCategoryPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <CategoryPage />
    </ProtectedRoute>
  );
};

export default ProtectedCategoryPage;