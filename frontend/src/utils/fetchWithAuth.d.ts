export interface AuthLikeContext {
    accessToken: string | null;
}

export interface FetchWithAuthOptions extends RequestInit {
    retry?: boolean;
}

export function fetchWithAuth(
    context: AuthLikeContext | null,
    url: string,
    options?: FetchWithAuthOptions
): Promise<Response>;
