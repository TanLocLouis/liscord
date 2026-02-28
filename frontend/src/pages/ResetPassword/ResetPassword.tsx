import "./ResetPassword.css";
import { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router";
import { useToast } from "@contexts/ToastContext";

interface ResetFormData {
    email: string;
}

const ResetPassword: React.FC = () => {
    const [ResetForm, setResetForm] = useState<ResetFormData>({
        email: "",
    })

    const handleResetFormChanged = (e: ChangeEvent<HTMLInputElement>) => {
        setResetForm({
            ...ResetForm,
            [e.target.name]: e.target.value
        });
    }

    const redirect = useNavigate();
    const { addToast } = useToast();
    const handleResetPasswordFormSubmitted = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: ResetForm.email
                })
            });

            addToast("info", "Password reset email sent. Please check your inbox.");
            if (!response.ok) {
                throw new Error("Failed to reset password");
            }

            redirect("/reset-password-form");
        } catch (err) {
            console.error("Failed to reset password", err);
            addToast("error", "Failed to reset password. Please try again later.");
            return;
        }
    }

    return (
        <>
            <div className="login-wrapper">
                <div className="login-wrapper-animate"></div>
                <div className="login-container">
                    <form className="login-container-form" onSubmit={handleResetPasswordFormSubmitted}>
                        <h2 className="login-form-header">Reset Password</h2>
                        <div className="input-group">
                            <label htmlFor="email">Email</label>
                            <input type="text" 
                                id="email"
                                name="email"
                                placeholder="Enter your email"
                                required 
                                onChange={handleResetFormChanged}/>
                        </div>

                        <button type="submit" className="login-submit-button">
                            Send Reset Link
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default ResetPassword;