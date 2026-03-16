import Button from "@components/Button/Button";
import { useState } from "react";
import type { ChangeEvent, FormEvent, MouseEvent } from "react";
import { useAuth } from "@contexts/AuthContext";
import { useToast } from "@contexts/ToastContext";
import { fetchWithAuth } from "@utils/fetchWithAuth";

interface EditProfileProps {
    setIsEditProfileOpen: (open: boolean) => void;
    currentBio?: string | undefined;
}

interface PasswordFormData {
    currentPassword?: string;
    newPassword?: string;
    confirmNewPassword?: string;
}

const EditProfile: React.FC<EditProfileProps> = ({ setIsEditProfileOpen, currentBio }) => {
    const authContext = useAuth();
    const { addToast } = useToast();

    const handleCloseEditProfileClicked = (e: MouseEvent<SVGSVGElement>) => {
        e.preventDefault();
        setIsEditProfileOpen(false);
    };

    // Bio
    const [bio, setBio] = useState<string>(currentBio ?? "");

    const handleBioSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const res = await fetchWithAuth(authContext, `${import.meta.env.VITE_API_URL}/api/users/bio`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bio }),
            });
            if (!res.ok) throw new Error("Failed to update bio");
            addToast("success", "Bio updated successfully.");
        } catch (err) {
            console.error("Error updating bio:", err);
            addToast("error", "Failed to update bio.");
        }
    };

    // Password
    const [passwordData, setPasswordData] = useState<PasswordFormData>({});

    const handlePasswordChanged = (e: ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            addToast("error", "New password and confirm new password do not match");
            return;
        }
        try {
            const res = await fetchWithAuth(authContext, `${import.meta.env.VITE_API_URL}/api/users/password`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            });
            if (!res.ok) throw new Error("Failed to update password");
            addToast("success", "Password updated successfully.");
            setPasswordData({});
        } catch (err) {
            console.error("Error updating password:", err);
            addToast("error", "Failed to update password.");
        }
    };

    return (
        <div className="left-0 top-0 z-50 flex h-screen w-screen items-center justify-center bg-[rgba(0,0,0,0.5)]">
            <div className="w-full max-w-md rounded-2xl border border-[var(--color-primary)] bg-[var(--color-secondary-soft)] p-6 shadow-[2px_2px_8px_var(--color-primary)]">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Edit Profile</h2>
                    <svg
                        onClick={handleCloseEditProfileClicked}
                        className="cursor-pointer transition-transform duration-150 hover:scale-110"
                        xmlns="http://www.w3.org/2000/svg"
                        width="1.5em"
                        fill="var(--color-primary)"
                        viewBox="0 0 640 640"
                    >
                        <path d="M504.6 148.5C515.9 134.9 514.1 114.7 500.5 103.4C486.9 92.1 466.7 93.9 455.4 107.5L320 270L184.6 107.5C173.3 93.9 153.1 92.1 139.5 103.4C125.9 114.7 124.1 134.9 135.4 148.5L278.3 320L135.4 491.5C124.1 505.1 125.9 525.3 139.5 536.6C153.1 547.9 173.3 546.1 184.6 532.5L320 370L455.4 532.5C466.7 546.1 486.9 547.9 500.5 536.6C514.1 525.3 515.9 505.1 504.6 491.5L361.7 320L504.6 148.5z" />
                    </svg>
                </div>

                {/* Bio section */}
                <form onSubmit={handleBioSubmit} className="mb-4">
                    <h3 className="mb-2 font-medium">Bio</h3>
                    <textarea
                        className="w-full resize-none rounded-lg border border-[var(--color-primary)] bg-transparent p-2 focus:outline-none"
                        rows={3}
                        maxLength={200}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                    />
                    <Button type="submit" margin="0.5em 0 0 0" title="Save Bio"></Button>
                </form>

                <hr className="mb-1 border-[var(--color-primary)] opacity-30" />

                {/* Password section */}
                <form onSubmit={handlePasswordSubmit}>
                    <h3 className="mb-1 font-medium">Change Password</h3>
                    <div className="flex flex-col">
                        <label className="ml-2">Current Password</label>
                        <input
                            className="my-[0.3em] mb-2 rounded-lg border border-[var(--color-primary)] h-[40px]"
                            type="password"
                            name="currentPassword"
                            value={passwordData.currentPassword ?? ""}
                            onChange={handlePasswordChanged}
                            required
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="ml-2">New Password</label>
                        <input
                            className="my-[0.3em] mb-2 rounded-lg border border-[var(--color-primary)] h-[40px]"
                            type="password"
                            name="newPassword"
                            value={passwordData.newPassword ?? ""}
                            onChange={handlePasswordChanged}
                            required
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="ml-2">Confirm New Password</label>
                        <input
                            className="my-[0.3em] mb-2 rounded-lg border border-[var(--color-primary)] h-[40px]" 
                            type="password"
                            name="confirmNewPassword"
                            value={passwordData.confirmNewPassword ?? ""}
                            onChange={handlePasswordChanged}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" title="Update Password"></Button>
                </form>
            </div>
        </div>
    );
};

export default EditProfile;