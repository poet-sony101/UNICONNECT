import { useState, useEffect, useCallback } from "react";
import API from "../utils/api";

export default function useFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTag, setActiveTag] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (tag = null, pageNum = 1, append = false) => {
    try {
      const params = new URLSearchParams({ page: pageNum });
      if (tag) params.append("tag", tag);
      const res = await API.get(`/posts?${params}`);
      if (append) {
        setPosts((prev) => [...prev, ...res.data]);
      } else {
        setPosts(res.data);
      }
      setHasMore(res.data.length === 10);
    } catch (err) {
      console.error("Feed fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchPosts(activeTag, 1, false);
  }, [activeTag]);

  const refresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchPosts(activeTag, 1, false);
  };

  const loadMore = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchPosts(activeTag, nextPage, true);
  };

  const toggleLike = async (postId) => {
    try {
      await API.post(`/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, liked: !p.liked, like_count: p.liked ? p.like_count - 1 : p.like_count + 1 }
            : p
        )
      );
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const deletePost = async (postId) => {
  try {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, deleting: true } : p))
    );
    await API.delete(`/posts/${postId}`);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  } catch (err) {
    console.error("Delete error:", err);
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, deleting: false } : p))
    );
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

  return {
    posts, loading, refreshing, hasMore,
    activeTag, setActiveTag,
    refresh, loadMore,
    toggleLike, deletePost,
    addComment, fetchComments,
  };
}