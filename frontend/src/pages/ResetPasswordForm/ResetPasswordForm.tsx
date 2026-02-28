import "./ResetPasswordForm.css";
import { useState, ChangeEvent, FormEvent } from "react";
import { useSearchParams } from "react-router";
import { useToast } from "@contexts/ToastContext";

interface ResetFormData {
    password: string;
    confirmPassword: string;
}

const ResetPasswordForm: React.FC = () => {
    const [tokenParams] = useSearchParams();
    const resetToken = tokenParams.get("token");

    const [ResetForm, setResetForm] = useState<ResetFormData>({
        password: "",
        confirmPassword: ""
    })

    const handleResetPasswordFormChanged = (e: ChangeEvent<HTMLInputElement>) => {
        setResetForm({
            ...ResetForm,
            [e.target.name]: e.target.value
        });
    }

    const { addToast } = useToast();
    const handleLoginFormSubmitted = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validate password
        if (ResetForm.password !== ResetForm.confirmPassword) {
            addToast("error", "Passwords do not match. Please try again.");
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-reset-token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    resetToken: resetToken,
                    newPassword: ResetForm.password
                })
            });

            if (!response.ok) {
                throw new Error("Failed to reset password");
            }

            addToast("info", "Password reset successfully. Please log in with your new password.");
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
                    <form className="login-container-form" onSubmit={handleLoginFormSubmitted}>
                        <h2 className="login-form-header">Reset New Password</h2>
                        <div className="input-group">
                            <label htmlFor="email">New Password</label>
                            <input type="password" 
                                id="password"
                                name="password"
                                placeholder="Enter your new password"
                                required 
                                onChange={handleResetPasswordFormChanged}/>
                        </div>
                        <div className="input-group">
                            <label htmlFor="confirmPassword">Retype new password</label>
                            <input type="password" 
                                id="confirmPassword"
                                name="confirmPassword"
                                placeholder="Retype your new password"
                                required 
                                onChange={handleResetPasswordFormChanged}/>
                        </div>

                        <button type="submit" className="login-submit-button">
                            Reset Password
                        </button>

                        <div className="forgot-password-link">
                            <label> After reset login <a href="/login">here</a></label>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default ResetPasswordForm;