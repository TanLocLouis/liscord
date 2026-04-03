import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useAuth } from "@contexts/AuthContext";
import { useToast } from "@contexts/ToastContext";
import { fetchWithAuth } from "@utils/fetchWithAuth";
import Input from "@components/Input/Input";

const Search = () => {
  const navigate = useNavigate();
  const { userInfo, accessToken } = useAuth();
  const authContext = useAuth();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Restore search results from sessionStorage on component mount
  useEffect(() => {
    const savedSearchState = sessionStorage.getItem("searchState");
    if (savedSearchState) {
      try {
        const { query, results, searched } = JSON.parse(savedSearchState);
        setSearchQuery(query);
        setSearchResults(results);
        setHasSearched(searched);
      } catch (err) {
        console.error("Failed to restore search state:", err);
      }
    }
  }, []);

  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      sessionStorage.removeItem("searchState");
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const res = await fetchWithAuth(
        authContext,
        `${import.meta.env.VITE_API_URL}/api/users/search?q=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authContext.accessToken}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to search users");
      }

      const data = await res.json();
      setSearchResults(data.users || []);

      // Save search state to sessionStorage
      sessionStorage.setItem("searchState", JSON.stringify({
        query,
        results: data.users || [],
        searched: true,
      }));

      if (data.users && data.users.length === 0) {
        addToast("info", "No users found");
      }
    } catch (err) {
      console.error("Error searching users:", err);
      addToast("error", "Failed to search users. Please try again.");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [authContext, addToast]);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debouncing
    // only search after user has stopped typing for 300ms
    // to optimize performance
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);
  };

  const handleUserClick = (userId) => {
    navigate(`/users/${userId}`);
  };

  return (
    <div>
        <div className="h-[75px]"></div>
        <motion.div
        initial={{ transform: "translateY(2%)", opacity: 0 }}
        animate={{ transform: "translateY(0)", opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="flex-1 min-w-0 m-2 rounded-[18px] border border-[color:color-mix(in_oklab,var(--color-text-primary)_22%,transparent)] shadow-[0_16px_38px_color-mix(in_oklab,var(--color-text-primary)_18%,transparent)] overflow-hidden bg-[radial-gradient(circle_at_10%_-10%,color-mix(in_oklab,var(--color-primary)_20%,transparent),transparent_45%),radial-gradient(circle_at_90%_0%,color-mix(in_oklab,var(--color-info)_16%,transparent),transparent_38%),color-mix(in_oklab,var(--color-secondary)_86%,var(--color-primary-soft)_14%)] max-md:mx-2 max-md:my-[0.4rem] max-md:rounded-[14px] flex flex-col"
        >
        {/* Search Header */}
        <div className="p-6 border-b border-[color:color-mix(in_oklab,var(--color-text-primary)_15%,transparent)]">
            <h1 className="text-2xl font-bold text-[var(--color-text-secondary)] mb-4">
            Find Users
            </h1>
            <Input
            type="text"
            placeholder="Search by username or email..."
            value={searchQuery}
            onChange={handleSearchChange}
            containerClassName="w-full max-w-md"
            />
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto p-6">
            {isLoading && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center items-center h-32"
            >
                <div className="text-[var(--color-text-secondary)]">
                Searching...
                </div>
            </motion.div>
            )}

            {!isLoading && !hasSearched && (
            <div className="flex justify-center items-center h-32">
                <p className="text-[var(--color-text-secondary)] opacity-75">
                Start typing to search for users
                </p>
            </div>
            )}

            {!isLoading && hasSearched && searchResults.length === 0 && (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center items-center h-32"
            >
                <p className="text-[var(--color-text-secondary)] opacity-75">
                No users found
                </p>
            </motion.div>
            )}

            {!isLoading && searchResults.length > 0 && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
            >
                {searchResults.map((user, index) => (
                <motion.div
                    key={user.user_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleUserClick(user.user_id)}
                    className="p-4 rounded-lg bg-[color-mix(in_oklab,var(--color-secondary)_80%,var(--color-primary)_20%)] border border-[color:color-mix(in_oklab,var(--color-text-primary)_10%,transparent)] hover:border-[color:color-mix(in_oklab,var(--color-primary)_40%,transparent)] hover:bg-[color-mix(in_oklab,var(--color-secondary)_70%,var(--color-primary)_30%)] cursor-pointer transition-all duration-200"
                >
                    <div className="flex items-center gap-4">
                    {user.avatar && (
                        <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-12 h-12 rounded-full object-cover"
                        />
                    )}
                    <div className="flex-1">
                        <h3 className="font-semibold text-[var(--color-text-primary)]">
                        {user.username}
                        </h3>
                        <p className="text-sm text-[var(--color-text-secondary)] opacity-75">
                        {user.email}
                        </p>
                        {user.bio && (
                        <p className="text-sm text-[var(--color-text-secondary)] opacity-60 mt-1">
                            {user.bio}
                        </p>
                        )}
                    </div>
                    {user.is_active && (
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                    )}
                    </div>
                </motion.div>
                ))}
            </motion.div>
            )}
        </div>
        </motion.div>
    </div>
  );
};

export default Search;
