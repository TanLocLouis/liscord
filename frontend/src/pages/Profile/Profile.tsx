import "./Profile.css";
import { useEffect, useState } from "react";
import { useToast } from "@contexts/ToastContext.jsx";
import { useAuth } from "@contexts/AuthContext.jsx";
import EditProfile from "@pages/EditProfile/EditProfile.jsx";

interface ProfileData {
    username?: string;
    email?: string;
    avatar?: string;
    created_at?: string;
    is_active?: boolean;
}

const Profile: React.FC = () => {
    const { addToast } = useToast();
    const { userInfo, accessToken } = useAuth();

    const [profileData, setProfileData] = useState<ProfileData>({});
    const [binsData, setBinsData] = useState<unknown[]>([]);

    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

    const [limit, setLimit] = useState(10);
    const [offset, setOffset] = useState(0);
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");
    const [totalBins, setTotalBins] = useState(0);

    // Fetch user profile data
    const fetchUserProfile = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile/${userInfo.username}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
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

    const handleEditClicked = () => {
        setIsEditProfileOpen(true);
    }

    return (
        <div>
            <div className="profile-top-section">
                <div className="profile-top-section-banner">
                    <div className="profile-top-section-content">
                        <div className="profile-avatar">
                            {profileData.avatar ? (
                                <img
                                    src={profileData.avatar}
                                    alt="User Avatar"
                                />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="100px" fill="var(--color-primary)" viewBox="0 0 640 640"><path d="M240 192C240 147.8 275.8 112 320 112C364.2 112 400 147.8 400 192C400 236.2 364.2 272 320 272C275.8 272 240 236.2 240 192zM448 192C448 121.3 390.7 64 320 64C249.3 64 192 121.3 192 192C192 262.7 249.3 320 320 320C390.7 320 448 262.7 448 192zM144 544C144 473.3 201.3 416 272 416L368 416C438.7 416 496 473.3 496 544L496 552C496 565.3 506.7 576 520 576C533.3 576 544 565.3 544 552L544 544C544 446.8 465.2 368 368 368L272 368C174.8 368 96 446.8 96 544L96 552C96 565.3 106.7 576 120 576C133.3 576 144 565.3 144 552L144 544z"/></svg>
                            )}
                        </div>

                        <div className="profile-info">
                            <h2 className="profile-username">{profileData.username || "Username"}</h2>
                            <p className="profile-email"> 📧 {profileData.email || "Email"}</p>
                            <p className="profile-createdAt">📆 {profileData.created_at ? convertToDateString(profileData.created_at) : "N/A"}</p>
                            <p className="profile-isVerified">{profileData.is_active ? "✅ Verified" : "❌ Not Verified"}</p>
                        </div>

                        <div className="profile-edit">
                            <svg onClick={handleEditClicked} xmlns="http://www.w3.org/2000/svg" width="3em" fill="var(--color-primary)" viewBox="0 0 640 640"><path d="M505 122.9L517.1 135C526.5 144.4 526.5 159.6 517.1 168.9L488 198.1L441.9 152L471 122.9C480.4 113.5 495.6 113.5 504.9 122.9zM273.8 320.2L408 185.9L454.1 232L319.8 366.2C316.9 369.1 313.3 371.2 309.4 372.3L250.9 389L267.6 330.5C268.7 326.6 270.8 323 273.7 320.1zM437.1 89L239.8 286.2C231.1 294.9 224.8 305.6 221.5 317.3L192.9 417.3C190.5 425.7 192.8 434.7 199 440.9C205.2 447.1 214.2 449.4 222.6 447L322.6 418.4C334.4 415 345.1 408.7 353.7 400.1L551 202.9C579.1 174.8 579.1 129.2 551 101.1L538.9 89C510.8 60.9 465.2 60.9 437.1 89zM152 128C103.4 128 64 167.4 64 216L64 488C64 536.6 103.4 576 152 576L424 576C472.6 576 512 536.6 512 488L512 376C512 362.7 501.3 352 488 352C474.7 352 464 362.7 464 376L464 488C464 510.1 446.1 528 424 528L152 528C129.9 528 112 510.1 112 488L112 216C112 193.9 129.9 176 152 176L264 176C277.3 176 288 165.3 288 152C288 138.7 277.3 128 264 128L152 128z"/></svg>
                        </div>
                        
                        {isEditProfileOpen && <EditProfile setIsEditProfileOpen={setIsEditProfileOpen}/>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile;