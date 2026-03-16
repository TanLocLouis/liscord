import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "./ToastContext.js";

interface AuthContextType {
    signup: (SignUpForm: {username: string, email: string, password: string}) => Promise<boolean>;
    login: (LoginForm: {username: string, password: string}) => Promise<boolean>;
    refreshToken: () => Promise<boolean>;
    accessToken: string | null;
    userInfo: any;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ( { children }: { children: React.ReactNode } ) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);

    const userInfoFromStorage = localStorage.getItem("userInfo");
    const [userInfo, setUserInfo] = useState<any>(userInfoFromStorage ? JSON.parse(userInfoFromStorage) : null);

    const { addToast } = useToast();

    useEffect(() => {
        refreshToken();
    }, []);

    const signup = async (SignUpForm: {username: string, email: string, password: string}) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/sign-up`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(SignUpForm)
            })

            if (!res.ok) {
                if (res.status === 409) {
                    throw { status: 409, message: "User already exists" };
                } else if (res.status === 400) {
                    const errorData = await res.json();
                    throw { status: 400, message: errorData.message || "Invalid input data" };
                }
            }

            return true;
        } catch (err: any) {
            if (err.status === 409) {
                addToast("error", "User already exists. Please choose a different username or email.");
            } else if (err.status === 400) {
                addToast("error", `Sign up failed: ${err.message}`);
            } else {
                addToast("error", "Sign up failed. Please try again later.");
            }
            console.error(err);

            return false;
        }
    }

    const login = async (LoginForm: {username: string, password: string}) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(LoginForm)
            })

            if (!res.ok) {
                throw new Error("Account is not verified.");
            }

            const data = await res.json();

            setAccessToken(data.accessToken);
            setUserInfo(data.data);
            localStorage.setItem("refreshToken", data.refreshToken);
            localStorage.setItem("userInfo", JSON.stringify(data.data));

            return true;
        } catch (err) {
            console.error(err);

            return false;
        }
    }

    const refreshToken = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/refresh-token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ refreshToken: localStorage.getItem("refreshToken") })
            });

            if (!res.ok) {
                throw new Error("Failed to refresh token");
            }

            // addToast("info", "Session refreshed successfully.");
            const data = await res.json();
            
            setAccessToken(data.accessToken);

            return true;
        } catch {
            console.error("Failed to refresh token");

            return false;
        }
    }

    const logout = () => {
        setAccessToken(null);
        setUserInfo(null);

        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userInfo");

        addToast("success", "Logged out successfully.");
    }

    const value = {
        signup,
        login,
        refreshToken,
        accessToken,
        userInfo,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export { AuthProvider, useAuth };