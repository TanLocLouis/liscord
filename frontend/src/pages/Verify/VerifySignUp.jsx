import { useNavigate } from "react-router";
import "./VerifySignUp.css";

const VerifySignup = () => {

    const redirect = useNavigate();
    const handleBackToLoginClicked = () => {
        redirect("/login");
    }

    return (
        <div className="verify-signup-wrapper">
            <div className="verify-signup-container">
                <h1 className="verify-signup-container-title">Account Verified Successfully!</h1>
                <button className="verify-signup-container-button" onClick={handleBackToLoginClicked}>Back to Login</button>
            </div>
        </div>
    );
}

export default VerifySignup;