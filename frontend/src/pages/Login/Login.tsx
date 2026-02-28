import "./Login.css";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { useToast } from "../../contexts/ToastContext";
import { useAuth } from "../../contexts/AuthContext";

import { ChangeEvent } from "react";

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
    const { addToast } = useToast();
    const { login } = useAuth();
    const handleLoginFormSubmitted = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const result = await login(LoginForm);

        if (result) {
            addToast("info", "Login successful!");
            redirect("/");
        } else {
            addToast("error", "Login failed. Please check your credentials and try again.");
        }
    }

    return (
        <>
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
        </>
    );
}

export default Login;