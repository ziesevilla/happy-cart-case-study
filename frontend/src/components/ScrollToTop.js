import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop Component
 * * A utility component that fixes the scroll position on route changes.
 * * In SPAs, navigating to a new page doesn't automatically reset scroll to top.
 * * This component listens for URL changes and forces the window to scroll up.
 * * Usage: Place this inside <BrowserRouter> in App.jsx.
 */
export default function ScrollToTop() {
  // 1. Get the current URL path (e.g., "/products" or "/cart")
  const { pathname } = useLocation();

  useEffect(() => {
    // 2. Trigger the Scroll
    // Whenever the 'pathname' variable changes (user clicked a link),
    // we instantly scroll the window to coordinates (0, 0) - top left.
    window.scrollTo(0, 0);
  }, [pathname]); // Dependency: Only run this when the URL changes

  // 3. Render Nothing
  // This component is purely functional (logic only). It has no visual UI.
  return null;
}