import { useEffect, useState, useRef } from "react";
import type { ChangeEvent } from "react";
import { useToast } from "@contexts/ToastContext.jsx";
import { useAuth } from "@contexts/AuthContext.jsx";
import { fetchWithAuth } from "@utils/fetchWithAuth.jsx";
import { useNavigate, useParams } from "react-router";
import { motion } from "framer-motion";
import Button from "@components/Button/Button.js";

interface ProfileData {
    username?: string;
    email?: string;
    avatar?: string;
    created_at?: string;
    is_active?: boolean;
    bio?: string;
}

const UserProfile: React.FC = () => {
    const userId = useParams().userId;
    const navigate = useNavigate();

    const { addToast } = useToast();
    const { userInfo, accessToken } = useAuth();
    const authContext = useAuth();

    const [profileData, setProfileData] = useState<ProfileData>({});
    const [isCreatingDM, setIsCreatingDM] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch user profile data
    const fetchUserProfile = async () => {
        try {
            const res = await fetchWithAuth(authContext, `${import.meta.env.VITE_API_URL}/api/users/profile/${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authContext.accessToken}`
                },
            });

            if (!res.ok) {
                throw new Error("Failed to fetch user profile");
            }

            const data = await res.json();
            setProfileData(data.user);
        } catch (err) {
            console.error("Error fetching user profile:", err);
            addToast("error", "Failed to load user profile.");
        }
    }

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const convertToDateString = (isoString: string): string => {
        const date = new Date(isoString);
        return date.toLocaleDateString();
    }

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    }

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            addToast("error", "Please select a valid image file");
            return;
        }

        // Validate file size (e.g., max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            addToast("error", "Image size should be less than 5MB");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const res = await fetchWithAuth(authContext ,`${import.meta.env.VITE_API_URL}/api/users/avatar`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                },
                body: formData
            });

            if (!res.ok) {
                throw new Error("Failed to upload avatar");
            }

            const data = await res.json();
            const localPreviewUrl = URL.createObjectURL(file);
            setProfileData({ ...profileData, avatar: localPreviewUrl });
            addToast("success", "Profile picture updated successfully");
        } catch (err) {
            console.error("Error uploading avatar:", err);
            addToast("error", "Failed to update profile picture");
        }
    }

    const handleStartDM = async () => {
        if (!userId || userId === userInfo?.user_id) {
            addToast("error", "Cannot start DM with yourself");
            return;
        }

        setIsCreatingDM(true);
        try {
            // Check if DM exists or create a new one
            const res = await fetchWithAuth(authContext, `${import.meta.env.VITE_API_URL}/api/servers/dm/get-or-create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authContext.accessToken}`,
                },
                body: JSON.stringify({
                    targetUserId: userId,
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to get or create DM");
            }

            const data = await res.json();
            const serverId = data.serverId;
            const existed = data.existed;

            if (existed) {
                addToast("success", "Opening existing DM");
            } else {
                addToast("success", "DM created successfully");
            }

            navigate("/");
        } catch (err) {
            console.error("Error creating DM:", err);
            addToast("error", "Failed to start DM. Please try again.");
        } finally {
            setIsCreatingDM(false);
        }
    }

    return (
        <motion.div
            initial={{ transform: 'translateY(5%)', opacity: 0 }}
            animate={{ transform: 'translateY(0)', opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
            <div className="profile-top-section">
                <div className="h-[250px] w-full rounded-lg bg-[radial-gradient(circle_at_10%_50%,rgba(133,132,212,0.432)_10%,transparent_30%)]">
                    <div className="relative ml-[30px] top-20 flex items-center gap-4">
                        <div 
                            onClick={handleAvatarClick}
                            className="group relative flex h-[150px] w-[150px] cursor-pointer items-center justify-center rounded-2xl border-[3px] border-[var(--color-primary)] shadow-[0_2px_10px_var(--color-primary)] transition-all hover:opacity-80"
                        >
                            {profileData.avatar ? (
                                <img
                                    className="w-full h-full object-cover rounded-2xl"
                                    src={profileData.avatar}
                                    alt="User Avatar"
                                />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="100px" fill="var(--color-primary)" viewBox="0 0 640 640"><path d="M240 192C240 147.8 275.8 112 320 112C364.2 112 400 147.8 400 192C400 236.2 364.2 272 320 272C275.8 272 240 236.2 240 192zM448 192C448 121.3 390.7 64 320 64C249.3 64 192 121.3 192 192C192 262.7 249.3 320 320 320C390.7 320 448 262.7 448 192zM144 544C144 473.3 201.3 416 272 416L368 416C438.7 416 496 473.3 496 544L496 552C496 565.3 506.7 576 520 576C533.3 576 544 565.3 544 552L544 544C544 446.8 465.2 368 368 368L272 368C174.8 368 96 446.8 96 544L96 552C96 565.3 106.7 576 120 576C133.3 576 144 565.3 144 552L144 544z"/></svg>
                            )}
                        </div>

                        <div className="profile-info">
                            <h2 className="profile-username text-[var(--color-text-secondary)]">{profileData.username || "Username"}</h2>
                            <p className="profile-createdAt">📆 {profileData.created_at ? convertToDateString(profileData.created_at) : "N/A"}</p>
                            <p className="profile-isVerified">{profileData.is_active ? "✅ Verified" : "❌ Not Verified"}</p>
                            <p className="profile-bio mt-2">{profileData.bio ? profileData.bio : "No bio available"}</p>
                            {userInfo?.user_id !== userId && (
                                <div>
                                    <Button
                                        onClick={handleStartDM}
                                        disabled={isCreatingDM}
                                        className="h-[40px] px-4"
                                        title={isCreatingDM ? "Creating..." : "Message"}
                                    >
                                        {isCreatingDM ? "Creating..." : "💬 Message"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default UserProfile;