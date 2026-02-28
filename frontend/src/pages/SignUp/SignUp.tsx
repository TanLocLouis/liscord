import { redirect } from "react-router";
import "./SignUp.css";
import { useState, ChangeEvent, FormEvent } from "react";
import { useAuth } from "@contexts/AuthContext";

interface SignUpFormData {
    username: string;
    email: string;
    password: string;
}

const SignUp: React.FC = () => {
    const [SignUpForm, setSignUpForm] = useState<SignUpFormData>({
        username: "",
        email: "",
        password: ""
    })
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSignUpSuccessful, setIsSignUpSuccessful] = useState(false);

    const handleLoginClicked = () => {
        redirect("/login");
    }

    const handleSignUpFormChanged = (e: ChangeEvent<HTMLInputElement>) => {
        setSignUpForm({
            ...SignUpForm,
            [e.target.name]: e.target.value
        });
    }

    const { signup } = useAuth();
    const handleSignUpFormSubmitted = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsSubmitting(true);
        const result = await signup(SignUpForm);
        setIsSubmitting(false);

        if (result) {
            setIsSignUpSuccessful(true);
        }
    }

    return (
        <>
            <div className="signup-wrapper">
                <div className="signup-wrapper-animate"></div>
                <div className="signup-container">
                    <form className="signup-container-form"
                          onSubmit={handleSignUpFormSubmitted}>
                        <h2 className="signup-form-header">Sign Up</h2>
                        <div className="input-group">
                            <label htmlFor="username">Username</label>
                            <input   
                                    type="text" 
                                    id="username" 
                                    name="username" 
                                    placeholder="Enter your username" 
                                    required 
                                    minLength={3}
                                    onChange={handleSignUpFormChanged}/>
                        </div>
                        <div className="input-group">
                            <label htmlFor="email">Email</label>
                            <input 
                                    type="email" 
                                    id="email" 
                                    name="email" 
                                    placeholder="Enter your email" 
                                    required 
                                    onChange={handleSignUpFormChanged}/>
                        </div>
                        <div className="input-group">
                            <label htmlFor="password">Password</label>
                            <input 
                                    type="password" 
                                    id="password" 
                                    name="password" 
                                    placeholder="Enter your password" 
                                    required
                                    minLength={8}
                                    onChange={handleSignUpFormChanged}/>
                        </div>

                        <button type="submit" className="signup-submit-button">
                            {isSubmitting ? "Creating Account..." : "Create Account"}
                        </button>

                        <label className="signup-note">Already have an account? Login <a href="/login">here</a></label>

                        {isSignUpSuccessful &&
                            <label className="signup-note-success">Check your email to verify your account</label>
                        }
                    </form>
                </div>
            </div>
        </>
    );
}

export default SignUp;