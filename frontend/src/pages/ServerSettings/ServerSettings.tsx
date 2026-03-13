import { useParams } from "react-router";
import { motion } from "motion/react";
import { useRef } from "react";

const ServerSettings: React.FC = () => {
    const { serverId } = useParams();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const serverData = {
        server_name: "Example Server",
        created_at: "2023-01-01T00:00:00Z",
        avatar: null,
    }

    const convertToDateString = (isoString: string): string => {
        const date = new Date(isoString);
        return date.toLocaleDateString();
    }

    const handleAvatarClick = () => {
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    }

    return (
        <motion.div
            initial={{ transform: 'translateY(5%)', opacity: 0 }}
            animate={{ transform: 'translateY(0)', opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
            <div className="profile-top-section">
                <div className="h-[250px] w-full rounded-lg bg-[radial-gradient(circle_at_10%_50%,rgba(133,132,212,0.432)_10%,transparent_30%)]">
                    <div className="relative left-[30px] top-20 flex items-center gap-4">
                        <div 
                            onClick={handleAvatarClick}
                            className="group relative flex h-[150px] w-[150px] cursor-pointer items-center justify-center rounded-2xl border-[3px] border-[var(--color-primary)] shadow-[0_2px_10px_var(--color-primary)] transition-all hover:opacity-80"
                        >
                            {serverData.avatar ? (
                                <img
                                    className="w-full h-full object-cover rounded-2xl"
                                    src={serverData.avatar}
                                    alt="User Avatar"
                                />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="100px" fill="var(--color-primary)" viewBox="0 0 640 640"><path d="M240 192C240 147.8 275.8 112 320 112C364.2 112 400 147.8 400 192C400 236.2 364.2 272 320 272C275.8 272 240 236.2 240 192zM448 192C448 121.3 390.7 64 320 64C249.3 64 192 121.3 192 192C192 262.7 249.3 320 320 320C390.7 320 448 262.7 448 192zM144 544C144 473.3 201.3 416 272 416L368 416C438.7 416 496 473.3 496 544L496 552C496 565.3 506.7 576 520 576C533.3 576 544 565.3 544 552L544 544C544 446.8 465.2 368 368 368L272 368C174.8 368 96 446.8 96 544L96 552C96 565.3 106.7 576 120 576C133.3 576 144 565.3 144 552L144 544z"/></svg>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black bg-opacity-0 transition-all group-hover:bg-opacity-50">
                                <span className="text-sm font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">Change Picture</span>
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        <div className="profile-info">
                            <h2 className="profile-username">{serverData.server_name || "Server Name"}</h2>
                            <p className="profile-createdAt">📆 {serverData.created_at ? convertToDateString(serverData.created_at) : "N/A"}</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default ServerSettings;