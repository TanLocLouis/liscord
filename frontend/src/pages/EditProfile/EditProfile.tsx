import "./EditProfile.css";
import Button from "../../components/Button/Button";
import { useState, ChangeEvent, FormEvent, MouseEvent } from "react";
import { useAuth } from "@contexts/AuthContext";
import { useToast } from "@contexts/ToastContext";
import { fetchWithAuth } from "../../utils/fetchWithAuth";

interface EditProfileProps {
    setIsEditProfileOpen: (open: boolean) => void;
}

interface EditFormData {
    currentPassword?: string;
    newPassword?: string;
    confirmNewPassword?: string;
}


const EditProfile: React.FC<EditProfileProps> = ( { setIsEditProfileOpen }) => {
    const handleCloseEditProfileClicked = (e: MouseEvent<SVGSVGElement>) => {
        e.preventDefault();
        setIsEditProfileOpen(false);
    }

    const [Data, setData] = useState<EditFormData>({});
    const handleFormChanged = (e: ChangeEvent<HTMLInputElement>) => {
        setData({
            ...Data,
            [e.target.name]: e.target.value
        });
    }

    const authContext  = useAuth();
    const { addToast } = useToast();
    const handleEditProfile = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validate new password
        if (Data.newPassword !== Data.confirmNewPassword) {
            addToast("error", "New password and confirm new password do not match");
            return;
        }

        try {
            const res = await fetchWithAuth(authContext, `${import.meta.env.VITE_API_URL}/api/users/password`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    currentPassword: Data.currentPassword,
                    newPassword: Data.newPassword,
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to update profile");
            }
        } catch (err) {
            console.error("Error updating profile:", err);
            addToast("error", "Failed to update profile.");
        }
    }

    return (
        <div className="edit-profile">
            <form onSubmit={handleEditProfile} className="edit-profile-form">
                <div className="edit-profile-form-header">
                    <h2>Create new password</h2> 
                    <svg onClick={handleCloseEditProfileClicked} xmlns="http://www.w3.org/2000/svg" width="1.5em" fill="var(--color-primary)" viewBox="0 0 640 640"><path d="M504.6 148.5C515.9 134.9 514.1 114.7 500.5 103.4C486.9 92.1 466.7 93.9 455.4 107.5L320 270L184.6 107.5C173.3 93.9 153.1 92.1 139.5 103.4C125.9 114.7 124.1 134.9 135.4 148.5L278.3 320L135.4 491.5C124.1 505.1 125.9 525.3 139.5 536.6C153.1 547.9 173.3 546.1 184.6 532.5L320 370L455.4 532.5C466.7 546.1 486.9 547.9 500.5 536.6C514.1 525.3 515.9 505.1 504.6 491.5L361.7 320L504.6 148.5z"/></svg>
                </div>

                <div className="form-group">
                        <label>Current Password</label>
                        <input type="password" name="currentPassword" 
                        onChange={handleFormChanged} required />
                </div>
                <div className="form-group">
                        <label>New Password</label>
                        <input type="password" name="newPassword" 
                        onChange={handleFormChanged} required />
                </div>
                <div className="form-group">
                        <label>Confirm New Password</label>
                        <input type="password" name="confirmNewPassword" 
                        onChange={handleFormChanged} required />
                </div>

                <Button type="submit" 
                        className="edit-profile-submit-button"
                        title="Change Password"
                >Update Password</Button> 
            </form>
        </div>
    )
}

export default EditProfile;