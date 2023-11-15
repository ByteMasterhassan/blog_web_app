import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { useRouter } from 'next/router';
import axios, { AxiosResponse } from 'axios';
import jwt from 'jsonwebtoken';
import styled from 'styled-components';
import DOMPurify from 'dompurify';

interface Blog {
  _id: string;
  title: string;
  image: string;
  readTime: string;
  [key: string]: any;
}

interface DecodedToken {
  exp: number;
  [key: string]: any;
}
  

const BlogList: React.FC<{ blogs: Blog[] }> = ({ blogs }) => (
  <BlogGrid>
    {blogs.length > 0 ? (
      blogs.map((blog) => (
        <BlogCard key={blog._id} onClick={() => navigateToBlogDetail(blog._id)}>
          <img src={blog.image} alt={blog.title} />
          <div className="content">
            <h3>{blog.title || 'Unnamed Blog'}</h3>
            <div className="readTime">{blog.readTime} min read</div>
          </div>
        </BlogCard>
      ))
    ) : (
      <p>No blogs available</p>
    )}
  </BlogGrid>
);


// Helper function to get a preview (first 20 words) from the blog content
const getPreview = (content: string) => {
  const words = content.split(' ');
  return words.slice(0, 20).join(' ') + '...';  // Return the first 20 words followed by ellipsis
}

const SearchBar = styled.input`
  padding: 10px 15px;
  width: 60%; // occupy more width for the search bar
  border: none;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-right: 10px; // spacing between search bar and button
  outline: none;
  transition: box-shadow 0.3s;

  &:focus {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
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

const SearchContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0; // some margin to space it from other elements
`;


const Container = styled.div`
  font-family: 'Open Sans', sans-serif;
  background-color: #FFFFFF;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center; // Center content
`;

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

const Content = styled.div`
  width: 80%; // 4/5 of the viewport width
  max-width: 1200px; // Optional: Set a maximum width for very wide screens
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Header = styled.header`
  width: 100%;
  background-color: #6A2C70;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #FFFFFF;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Footer = styled.footer`
  width: 100%;
  background-color: #6A2C70;
  padding: 10px 20px;
  text-align: center;
  color: #FFFFFF;
`;


const BlogCard = styled.div`
  background-color: #FFFFFF;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s; // added

  &:hover {
    transform: scale(1.05); // hover effect for blog card
  }

  img {
    width: 100%;
    height: 120px;
    object-fit: cover;
  }

  .content {
    padding: 8px;

    h3 {
      margin: 0;
      color: #333333;
      font-size: 1rem;
    }

    .readTime {
      color: #6A2C70;
      margin-top: 5px;
      font-size: 0.8rem;
    }

    .excerpt {  // new
      color: #777;
      margin-top: 5px;
      font-size: 0.8rem;
    }
  }
`;
// New Shimmer for loading effect
const BlogCardShimmer = styled.div`
  background-color: #E5E5E5;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
  height: 200px;
  animation: shimmer 1.5s infinite;
`;

const BlogGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); // Adjust the grid column size
  gap: 15px; // Adjust the gap between cards
  width: 100%;
`;




const AuthenticatedHomePage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const token = useSelector((state: RootState) => state.token);
  const dispatch = useDispatch();
  const router = useRouter();

    // Function to navigate to the blog detail page
    const navigateToBlogDetail = (blogId: string) => {
      router.push(`/BlogDetailedPage/${blogId}`);
    };

    // Function to sanitize HTML content
  const sanitizeContent = (content: string): string => {
    return DOMPurify.sanitize(content);
  };

  const fetchLatestBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const res: AxiosResponse<any, any> = await axios.get('https://nodejs.backend.techozon.com/api/viewer/blogs/latest');
      if (Array.isArray(res.data)) {
        setBlogs(res.data);
      }
    } catch (error: unknown) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Attempt to get the token from localStorage
    const localToken = localStorage.getItem('jwt_token');

    // If localToken exists and Redux token is missing, update Redux
    if (localToken && !token) {
      dispatch({ type: 'SET_TOKEN', payload: localToken });
    }

    const activeToken = token || localToken;

    if (activeToken) {
      const decodedToken = jwt.decode(activeToken) as DecodedToken | null;
      const currentTime = Date.now() / 1000;

      if (decodedToken?.exp && decodedToken.exp < currentTime) {
        router.push('/auth');
      }
    } else {
      router.push('/auth');
    }

    fetchLatestBlogs();
  }, [token, fetchLatestBlogs]);

  const handleSearch = () => router.push(`/Search?name=${searchTerm}`);
  const goToCategoryPage = () => router.push('/CategoryPage');

  // 5.1 Shimmer Effect
  const Shimmer = () => (
    <div style={{ backgroundColor: '#E5E5E5', height: '20px', width: '100%', animation: 'shimmer 1.5s infinite' }}></div>
  );

  const logout = () => {
    // Clear token from Redux store
    dispatch({ type: 'CLEAR_TOKEN' });
  
    // Remove token from localStorage
    localStorage.removeItem('jwt_token');
  
    // Redirect to login page
    router.push('/auth');
  }
  return (
    <Container>
      <Header>
        <h1>Latest Blogs</h1>
        <button onClick={logout} style={{ padding: '10px 20px', backgroundColor: '#6A2C70', color: '#FFFFFF', border: 'none', cursor: 'pointer' }}>
          Logout
        </button>
      </Header>

      <Content>
      <SearchContainer>
        <SearchBar
          type="text"
          placeholder="Search blogs..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        />
        <StyledButton onClick={handleSearch}>
          Search
        </StyledButton>
        <StyledButton onClick={goToCategoryPage} style={{ marginLeft: '10px' }}> 
          Select Category
        </StyledButton>
      </SearchContainer>
        
      <BlogGrid>
      {loading ? (
        Array(6).fill(0).map((_, index) => <BlogCardShimmer key={index} />)
      ) : (
        blogs.map((blog) => (
          <BlogCard key={blog._id} onClick={() => navigateToBlogDetail(blog._id)}>
            <img src={blog.image} alt={blog.title} />
            <div className="content">
              <h3>{blog.title || 'Unnamed Blog'}</h3>
              <div className="readTime">{blog.readTime} min read</div>
              <div 
                className="excerpt" 
                dangerouslySetInnerHTML={{ __html: sanitizeContent(getPreview(blog.content)) }}
              ></div>
            </div>
          </BlogCard>
        ))
      )}
    </BlogGrid>

      </Content>

      <Footer>
        © 2023 My Blog Site<br />
        About: We share the latest insights and knowledge about various topics. Join our community today!
      </Footer>
    </Container>
  );
};

export default AuthenticatedHomePage;


function navigateToBlogDetail(_id: string): void {
  throw new Error('Function not implemented.');
}

