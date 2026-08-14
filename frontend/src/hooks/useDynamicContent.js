import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL;

/**
 * useDynamicContent("home", DEFAULT_HOME)
 * -----------------------------------------
 * - `page` : "home" | "about" | "contact" | "header"
 * - `fallback` : usi page ka hardcoded default object (agar API fail ho
 *   jaaye ya document abhi DB me na bana ho, tab bhi UI khali/crash na ho)
 *
 * Returns: { content, loading, refetch }
 * `content` hamesha fallback ke saath merged milta hai, isliye components me
 * seedha `content.hero.titleLine1`, `content.whyUs.map(...)` use kar sakte ho.
 */
export default function useDynamicContent(page, fallback) {
  const [content, setContent] = useState(fallback);
  const [loading, setLoading] = useState(true);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/dynamic/${page}`);
      if (res.data?.content) {
        setContent({ ...fallback, ...res.data.content });
      }
    } catch (error) {
      console.log(`Failed to load dynamic content for "${page}", using defaults.`, error);
      setContent(fallback);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return { content, loading, refetch: fetchContent };
}