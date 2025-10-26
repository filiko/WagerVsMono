declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string | null;
                role: string;
                name: string | null;
                avatar: string | null;
                provider: string | null;
                solanaPublicKey: string | null;
            };
        }
    }
}
declare const router: import("express-serve-static-core").Router;
export default router;
//# sourceMappingURL=auth.d.ts.map