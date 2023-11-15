import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import axios from 'axios';
import styled from 'styled-components';
import { RootState } from '../redux/store';
import ProtectedRoute from '../components/ProtectedRoute';

interface StarProps {
  active: boolean;
}



// Styled Components
const BlogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RatingBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
`;

const StarRating = styled.div`
  display: flex;
  gap: 4px;
`;

const RatingWrapper = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #FFFFFF;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 150px; // Ensure enough width to accommodate stars and text
`;

const StarRatingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const Star = styled.span<StarProps>`
  margin-right: 3px;
  color: ${props => props.active ? '#FFD700' : '#E2E8F0'};
`;
const RatingButton = styled.button`
  background-color: #6A2C70;
  color: #FFFFFF;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #5A1C60;
  }
`;

const CommentContainer = styled.div`
  background-color: #E2E8F0;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 10px;
  position: relative;
  display: flex;
  align-items: center;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #6A2C70;
  color: #FFFFFF;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  margin-right: 10px;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #FF6B6B;
  color: #FFFFFF;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;


const Container = styled.div`
  font-family: 'Open Sans', sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #F3F4F6;
`;

const Navbar = styled.nav`
  width: 100%;
  padding: 10px 20px;
  background-color: #6A2C70;
  color: #FFFFFF;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BackButton = styled.button`
  background-color: transparent;
  color: #FFFFFF;
  border: none;
  cursor: pointer;
  padding: 5px 10px;
  margin-right: 10px;
`;

const MainContent = styled.div`
  width: 80%;
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background-color: #FFFFFF;
  border-radius: 5px;
`;

const Footer = styled.footer`
  width: 100%;
  padding: 10px 0;
  background-color: #6A2C70;
  color: #FFFFFF;
  text-align: center;
  position: absolute;
  bottom: 0;
  left: 0;
`;

const CommentSection = styled.div`
  margin-top: 20px;
  border-top: 1px solid #E2E8F0;
  padding-top: 20px;
`;

const AddCommentButton = styled.button`
  background-color: #6A2C70;
  color: #FFFFFF;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
`;

const RatingSection = styled.div`
  margin-top: 20px;
  border-top: 1px solid #E2E8F0;
  padding-top: 20px;
`;

const HomePageButton = styled.button`
  background-color: transparent;
  color: #6A2C70;
  border: 1px solid #6A2C70;
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
  margin-left: 10px;
`;

const BlogDetailedPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const viewer = useSelector((state: RootState) => state.viewer);
  const [blogData, setBlogData] = useState<any>(null);
  const [categoryData, setCategoryData] = useState<any>(null);
  const [subCategoryData, setSubCategoryData] = useState<any>(null);
  const [comment, setComment] = useState<string>('');
  const [comments, setComments] = useState<any[]>([]);
  const [rating, setRating] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [existingRatingId, setExistingRatingId] = useState<string | null>(null);
  const commenterId = useSelector((state: RootState) => state.viewer?._id);
  console.log('Id of commenter:', commenterId);
  const state = useSelector((state: RootState) => state);
  console.log('Redux State:', state);
    const raterId = commenterId;  // Assuming the commenter is also the rater
    console.log('Id of rater:', raterId);
    const payload = { value: rating, blogId: id, rater: raterId };
    const [userRating, setUserRating] = useState<any>(null);

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        const { data } = await axios.get(`https://nodejs.backend.techozon.com/api/blogs/${id}`);
        setBlogData(data.data);
      };
      fetchData();
    }
  }, [id] );

  useEffect(() => {
    if (blogData) {
      const fetchCategoryAndSubCategory = async () => {
        const catRes = await axios.get(`https://nodejs.backend.techozon.com/api/categories/${blogData.category}`);
        const subCatRes = await axios.get(`https://nodejs.backend.techozon.com/api/subcategories/${blogData.subCategory}`);
        setCategoryData(catRes.data);
        setSubCategoryData(subCatRes.data);
      };
      fetchCategoryAndSubCategory();
    }
  }, [blogData]);

  useEffect(() => {
    if (id) {
      const fetchCommentsAndRatings = async () => {
        const comRes = await axios.get(`https://nodejs.backend.techozon.com/api/blogs/comments/${id}`);
        const ratRes = await axios.get(`https://nodejs.backend.techozon.com/api/blogs/ratings/${id}/average`);
        setComments(comRes.data);
        setAverageRating(ratRes.data.average);
        const userRatingRes = await axios.get(`https://nodejs.backend.techozon.com/api/blogs/ratings/${id}/${raterId}`);
        setUserRating(userRatingRes.data);
      setExistingRatingId(userRatingRes.data?._id || null);
    };
      fetchCommentsAndRatings();
    }
  }, [id, raterId]);

  const addCommentHandler = async () => {
    if (!commenterId) return;
    const payload = { content: comment, blogId: id, commenter: commenterId };
    try {
      const response = await axios.post(`https://nodejs.backend.techozon.com/api/blogs/comments`, payload);
      console.log("Comment added:", response);
      
      // Update the comments state directly after a successful API call
      setComments(prevComments => [...prevComments, response.data]);
      
      setComment(''); // Clear the comment
    } catch (error) {
      console.log("API Error:", error);
    }
  };
   
  const fetchAverageRating = async () => {
    try {
      const ratRes = await axios.get(`https://nodejs.backend.techozon.com/api/blogs/ratings/${id}/average`);
      setAverageRating(ratRes.data.average);
    } catch (error) {
      console.error("Failed to fetch average rating:", error);
    }
  };

  
  const addRatingHandler = async () => {
    if (!raterId || !id) return;
    const payload = { value: rating, blogId: id, rater: raterId };
    try {
      await axios.post(`https://nodejs.backend.techozon.com/api/blogs/ratings`, payload);
      fetchAverageRating();
    } catch (error) {
      console.error("Failed to add rating:", error);
    }
  };
  
  const updateRatingHandler = async () => {
    if (!raterId || !id || !rating) return;
    try {
      await axios.put(`https://nodejs.backend.techozon.com/api/blogs/ratings/${existingRatingId}`, {
        value: rating,
        raterId: raterId,
      });
      fetchAverageRating();
    } catch (error: any) {
      console.error("Failed to update rating:", error);
    }
  };  

  const deleteCommentHandler = async (commentId: string) => {
    try {
      await axios.delete(`https://nodejs.backend.techozon.com/api/blogs/comments/${commentId}`);
      // After successful deletion, filter out the deleted comment from the comments state
      const updatedComments = comments.filter((c) => c._id !== commentId);
      setComments(updatedComments);
    } catch (error) {
      console.error("Failed to delete the comment:", error);
    }
  };
  

  const goBack = () => {
    router.back();
  };

  const goToHomePage = () => {
    router.push('/');  // Adjust this to your homepage route if it's different
  };

  return (
    <Container>
      <Navbar>
        <BackButton onClick={goBack}>← Back</BackButton>
        <HomePageButton onClick={goToHomePage}>Homepage</HomePageButton>
      </Navbar>

      <MainContent>
        <BlogHeader>
          <h1>{blogData?.title}</h1>
          
          <RatingBox>
            {/* Average Rating Stars */}
            <StarRating>
              {[...Array(5)].map((_, index) => (
                <Star key={index} active={index < averageRating}>&#9733;</Star>
              ))}
              <span>Average: {averageRating}</span>
            </StarRating>
            
            {/* User Rating Stars */}
            <StarRating>
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  active={index < rating}
                  onClick={() => setRating(index + 1)}
                >
                  &#9733;
                </Star>
              ))}
              <span>Your Rating</span>
            </StarRating>
            
            {userRating ? (
              <button onClick={updateRatingHandler}>Update Rating</button>
            ) : (
              <button onClick={addRatingHandler}>Rate</button>
            )}
          </RatingBox>
        </BlogHeader>

        <p><strong>Category:</strong> {categoryData?.data}</p>
        <p><strong>Sub-Category:</strong> {subCategoryData?.data}</p>
        <p><strong>Read Time:</strong> {blogData?.readTime} minutes</p>
        <div>
          <h2>Content</h2>
          <div dangerouslySetInnerHTML={{ __html: blogData?.content }}></div>
        </div>

        <CommentSection>
        <h2>Comments</h2>
        <input type="text" value={comment} onChange={(e) => setComment(e.target.value)} />
        <AddCommentButton onClick={addCommentHandler}>Add Comment</AddCommentButton>
        
        {comments.map((c) => (
          <CommentContainer key={c._id}>
            <UserAvatar>{c.commenterName?.slice(0, 2).toUpperCase()}</UserAvatar>
            <span>{c.content}</span>
            {c.commenter === commenterId && 
              <DeleteButton onClick={() => deleteCommentHandler(c._id)}>
                Delete
              </DeleteButton>}
          </CommentContainer>
        ))}
      </CommentSection>

      </MainContent>

      <Footer>
        © 2023 My Blog Site. All Rights Reserved.
      </Footer>
    </Container>
  );
};

const ProtectedBlogDetailedPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <BlogDetailedPage />
    </ProtectedRoute>
  );
};

export default ProtectedBlogDetailedPage;
