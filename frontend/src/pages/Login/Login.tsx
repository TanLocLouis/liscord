import "./Login.css";
import { type FormEvent, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useToast } from "@contexts/ToastContext";
import { useAuth } from "@contexts/AuthContext";

import { type ChangeEvent } from "react";
import { motion } from "motion/react";

interface LoginFormData {
    username: string;
    password: string;
}

const Login = () => {
    const [LoginForm, setLoginForm] = useState<LoginFormData>({
        username: "",
        password: ""
    })

    const handleLoginFormChanged = (e: ChangeEvent<HTMLInputElement>) => {
        setLoginForm({
            ...LoginForm,
            [e.target.name]: e.target.value
        });
    }

    const redirect = useNavigate();
    const [searchParams] = useSearchParams();
    const { addToast } = useToast();
    const { login } = useAuth();
    const handleLoginFormSubmitted = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const result = await login(LoginForm);

        if (result) {
            addToast("info", "Login successful!");
            const nextPath = searchParams.get("next");
            const safeNextPath = nextPath && nextPath.startsWith("/") ? nextPath : "/";
            redirect(safeNextPath);
        } else {
            addToast("error", "Login failed. Please check your credentials and try again.");
        }
    }

    return (
        <>
        <motion.div
                initial={{ transform: 'translateY(2%)', opacity: 0 }}
                animate={{ transform: 'translateY(0)', opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="flex-1 min-w-0 h-[calc(100vh-80px)] m-2 rounded-[18px] border border-[color:color-mix(in_oklab,var(--color-text-primary)_22%,transparent)] shadow-[0_16px_38px_color-mix(in_oklab,var(--color-text-primary)_18%,transparent)] grid grid-rows-[auto_1fr_auto] overflow-hidden bg-[radial-gradient(circle_at_10%_-10%,color-mix(in_oklab,var(--color-primary)_20%,transparent),transparent_45%),radial-gradient(circle_at_90%_0%,color-mix(in_oklab,var(--color-info)_16%,transparent),transparent_38%),color-mix(in_oklab,var(--color-secondary)_86%,var(--color-primary-soft)_14%)] max-md:mx-2 max-md:my-[0.4rem] max-md:rounded-[14px]"
        >
            <div className="login-wrapper">
                <div className="login-wrapper-animate"></div>
                <div className="login-container">
                    <form className="login-container-form" onSubmit={handleLoginFormSubmitted}>
                        <h2 className="login-form-header">Login</h2>
                        <div className="input-group">
                            <label htmlFor="username">Username</label>
                            <input type="text" 
                                id="username"
                                name="username"
                                placeholder="Enter your username"
                                required 
                                onChange={handleLoginFormChanged}/>
                        </div>
                        <div className="input-group">
                            <label htmlFor="password">Password</label>
                            <input type="password" 
                                id="password"
                                name="password"
                                placeholder="Enter your password"
                                required 
                                onChange={handleLoginFormChanged}/>
                        </div>

                        <button type="submit" className="login-submit-button">
                            Login
                        </button>

                        <div className="forgot-password-link">
                            <label>Forgot password? Reset <a href="/reset-password">here</a></label>
                        </div>
                    </form>
                </div>
            </div>
        </motion.div>
        </>
    );
}

export default Login;