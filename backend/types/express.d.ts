declare global {
    namespace Express {
        interface Request {
            user?: {
                username: string;
                user_id?: string;
                email?: string;
                [key: string]: unknown;
            };
            file?: Express.Multer.File;
            bin?: {
                id?: string;
                text?: string;
                password?: string;
                expireTime?: number;
            };
            isAuthenticated?: boolean;
        }
    }
}

export {};