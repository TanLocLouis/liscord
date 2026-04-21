import "./ResetPassword.css";
import { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router";
import { useToast } from "@contexts/ToastContext";
import Input from "@components/Input/Input.js";

interface ResetFormData {
    email: string;
}

const ResetPassword: React.FC = () => {
    const [ResetForm, setResetForm] = useState<ResetFormData>({
        email: "",
    })
    const [isResetting, setIsResetting] = useState(false);

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
        setIsResetting(true);

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
        } finally {
            setIsResetting(false);
        }
    }

    return (
        <>
            <div className="login-wrapper">
                <div className="login-wrapper-animate"></div>
                <div className="login-container">
                    <form className="login-container-form" onSubmit={handleResetPasswordFormSubmitted}>
                        <h2 className="login-form-header text-[var(--color-text-secondary)]">Reset Password</h2>
                        <div className="input-group">
                            <label htmlFor="email">Email</label>
                            <Input type="text" 
                                id="email"
                                name="email"
                                placeholder="Enter your email"
                                required 
                                onChange={handleResetFormChanged}/>
                        </div>

                        <button type="submit" className="login-submit-button h-[45px]" disabled={isResetting}>
                            {isResetting ? "Sending..." : "Send Reset Link"}
                        </button>

                        <div className="mt-1">
                            <label className="text-[var(--color-text-secondary)]">Done Reset? Login <a href="/login" className="text-[var(--color-primary)]">here</a></label>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default ResetPassword;