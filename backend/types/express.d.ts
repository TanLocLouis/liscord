declare global {
    namespace Express {
        interface Request {
            user?: {
                username: string;
                email?: string;
                [key: string]: unknown;
            };
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