import { useState, useEffect } from "react";
import API from "../utils/api";

export default function useFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    try {
      const res = await API.get("/posts");
      setPosts(res.data);
    } catch (err) {
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (postId) => {
    try {
      await API.post(`/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                liked: !p.liked,
                like_count: p.liked ? p.like_count - 1 : p.like_count + 1,
              }
            : p
        )
      );
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const addComment = async (postId, content) => {
    try {
      await API.post(`/posts/${postId}/comments`, { content });
    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const res = await API.get(`/posts/${postId}/comments`);
      return res.data;
    } catch (err) {
      console.error("Fetch comments error:", err);
      return [];
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return { posts, loading, error, toggleLike, addComment, fetchComments };
}