import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import axios, { AxiosResponse } from 'axios';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface Blog {
  _id: string;
  title: string;
  [key: string]: any;
}

// Styled component for the LogoutButton
const LogoutButton = styled.button`
  padding: 10px 20px;
  background-color: #6A2C70; 
  color: #FFFFFF;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #5A1C60;  // slightly darker shade for hover effect
  }
`;

const SearchHeader = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;  // This will give some spacing between the header and the content below
`;

const StyledSelect = styled.select`
  padding: 10px;
  margin: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
  transition: border-color 0.3s;

  &:focus {
    border-color: #6A2C70;
  }
`;


const FilterContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 10px;
`;

const AdvancedSearchForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const StyledInput = styled.input`
  padding: 10px;
  border: 1px solid #6A2C70;
  border-radius: 5px;
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
  transition: background-color 0.3s, transform 0.2s;

  &:hover {
    background-color: #5A1C60;  // slightly darker shade for hover effect
    transform: scale(1.05);  // Slight scale effect to make it pop out
  }
`;
const SearchPage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedSearchData, setAdvancedSearchData] = useState({
    name: '',  
    readTime: '',
    rating: '',
    numComments: '',
    category: '',
    subCategory: ''
  });
  
  const [categories, setCategories] = useState<any[]>([]); // Initialized as empty array
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const router = useRouter();

  const fetchSearchResults = useCallback(async () => {
    try {
      const res: AxiosResponse<any, any> = await axios.get('https://nodejs.backend.techozon.com/api/viewer/search', {
        params: router.query,
      });
      if (Array.isArray(res.data)) {
        setBlogs(res.data);
      }
    } catch (error: unknown) {
      console.error(error);
    }
  }, [router.query]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get('https://nodejs.backend.techozon.com/api/categories');
      if (Array.isArray(res.data.data)) {
        setCategories(res.data.data);
      } else {
        console.error('Categories API did not return an array');
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Here you can add code to show an error message to the user
    }
  }, []);
  
  
  
  

  useEffect(() => {
    fetchSearchResults();
    fetchCategories(); // Fetch categories when component mounts
  }, [fetchSearchResults, fetchCategories]);

  const fetchSubCategories = useCallback(async (categoryId: string) => {
    try {
      const res = await axios.get(`https://nodejs.backend.techozon.com/api/subcategories?parentCategory=${categoryId}`);
      setSubCategories(res.data);
    } catch (error) {
      console.error('Failed to fetch sub-categories:', error);
    }
  }, []);

  const handleAdvancedSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newQueryParams = {
      ...router.query,
      ...advancedSearchData,
    };
    router.push({
      pathname: '/Search',
      query: newQueryParams,
    });
  };

  useEffect(() => {
    fetchSearchResults();
    fetchCategories();
  }, [fetchSearchResults, fetchCategories]);

  useEffect(() => {
    if (advancedSearchData.category) {
      fetchSubCategories(advancedSearchData.category);
    }
  }, [advancedSearchData.category, fetchSubCategories]);

  const toggleAdvancedSearch = () => {
    setShowAdvancedSearch(prevState => !prevState);
};
// Function to navigate to the blog detail page
const navigateToBlogDetail = (blogId: string) => {
    router.push(`/BlogDetailedPage/${blogId}`);
  };


return (
    <Container>
      <Navbar>
        <BackButton onClick={() => router.back()}>← Back</BackButton>
        <h1>Search Results</h1>
      </Navbar>

      <MainContent>
      <SearchHeader>
        <h1>Search Results</h1>
        <StyledButton onClick={toggleAdvancedSearch}>Toggle Advanced Search</StyledButton>
      </SearchHeader>
        {showAdvancedSearch && (
          <AdvancedSearchForm onSubmit={handleAdvancedSearchSubmit}>
            <FilterContainer>
              <StyledInput
                type="text"
                value={advancedSearchData.name}
                onChange={(e: { target: { value: any; }; }) => setAdvancedSearchData({ ...advancedSearchData, name: e.target.value })}
                placeholder="Search by Name"
              />
              <StyledInput
                type="number"
                value={advancedSearchData.readTime}
                onChange={(e: { target: { value: any; }; }) => setAdvancedSearchData({ ...advancedSearchData, readTime: e.target.value })}
                placeholder="Min. Read Time (mins)"
              />
              <StyledInput
                type="number"
                value={advancedSearchData.numComments}
                onChange={(e: { target: { value: any; }; }) => setAdvancedSearchData({ ...advancedSearchData, numComments: e.target.value })}
                placeholder="Min. Number of Comments"
              />
              <StyledSelect
                value={advancedSearchData.category}
                onChange={(e: { target: { value: any; }; }) => setAdvancedSearchData({ ...advancedSearchData, category: e.target.value })}
              >
                <option value="">--Select Category--</option>
                {categories.map((category, index) => (
                  <option key={index} value={category._id}>{category.name}</option>
                ))}
              </StyledSelect>
              <StyledSelect
                value={advancedSearchData.subCategory}
                onChange={(e: { target: { value: any; }; }) => setAdvancedSearchData({ ...advancedSearchData, subCategory: e.target.value })}
              >
                <option value="">--Select Sub-Category--</option>
                {subCategories.map((sub, index) => (
                  <option key={index} value={sub._id}>{sub.name}</option>
                ))}
              </StyledSelect>
              <StyledSelect
                value={advancedSearchData.rating}
                onChange={(e: { target: { value: any; }; }) => setAdvancedSearchData({ ...advancedSearchData, rating: e.target.value })}
              >
                <option value="">--Select Rating--</option>
                {[0, 1, 2, 3, 4, 5].map((rating, index) => (
                  <option key={index} value={rating}>{rating}</option>
                ))}
              </StyledSelect>
            </FilterContainer>
            <StyledButton type="submit">Apply Filters</StyledButton>
          </AdvancedSearchForm>
        )}

{Array.isArray(blogs) && blogs.length > 0 ? (
          blogs.map((blog) => (
            <BlogCard key={blog._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <img src={blog.image} alt={blog.title} />
              <div className="blog-content">
                <h2>{blog.title || 'Unnamed Blog'}</h2>
                <p>{blog.summary}</p>
                <div dangerouslySetInnerHTML={{ __html: blog.content.substr(0, 150) + '...' }}></div>
                <p>Read Time: {blog.readTime} minutes</p>
                <StyledButton onClick={() => navigateToBlogDetail(blog._id)}>Read More</StyledButton>
              </div>
            </BlogCard>
          ))
        ) : (
          <p>No blogs found</p>
        )}
            </MainContent>

      <Footer>
        © 2023 My Blog Site. All Rights Reserved.
      </Footer>
    </Container>
  );
};

export default SearchPage;