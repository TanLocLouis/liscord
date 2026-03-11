import { redirect } from "react-router";
import "./SignUp.css";
import { useState, ChangeEvent, FormEvent } from "react";
import { useAuth } from "@contexts/AuthContext";
import { motion } from "motion/react";

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
        <motion.div
            initial={{ transform: 'translateY(2%)', opacity: 0 }}
            animate={{ transform: 'translateY(0)', opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="flex-1 min-w-0 h-[calc(100vh-80px)] m-2 rounded-[18px] border border-[color:color-mix(in_oklab,var(--color-text-primary)_22%,transparent)] shadow-[0_16px_38px_color-mix(in_oklab,var(--color-text-primary)_18%,transparent)] grid grid-rows-[auto_1fr_auto] overflow-hidden bg-[radial-gradient(circle_at_10%_-10%,color-mix(in_oklab,var(--color-primary)_20%,transparent),transparent_45%),radial-gradient(circle_at_90%_0%,color-mix(in_oklab,var(--color-info)_16%,transparent),transparent_38%),color-mix(in_oklab,var(--color-secondary)_86%,var(--color-primary-soft)_14%)] max-md:mx-2 max-md:my-[0.4rem] max-md:rounded-[14px]"
        >
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
        </motion.div>
        </>
    );
}

export default SignUp;