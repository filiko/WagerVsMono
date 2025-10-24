export type PredictionInput = {
    wagerId: string;
    title: string;
    confidencePct?: number;
    model: {
        provider: string;
        name: string;
        version?: string;
    };
    createdUtc: string;
    appEnv?: string;
    wagerSideMapping?: {
        left: string;
        right: string;
    };
};
export type ZeroGRecordResult = {
    cid: string;
    sha256: string;
    artifact: any;
};
/**
 * Build a canonical JSON artifact for an AI prediction.
 */
export declare function buildPredictionArtifact(input: PredictionInput): {
    artifact: {
        integrity: {
            sha256: string;
        };
        wager_id: string;
        prediction: {
            title: string;
            confidence_pct: number | undefined;
        };
        model: {
            provider: string;
            name: string;
            version?: string;
        };
        timestamps: {
            created_utc: string;
            server_received_utc: string;
        };
        app: {
            env: string;
            wager_side_mapping: {
                left: string;
                right: string;
            };
        };
    };
    sha256: string;
};
/**
 * Upload bytes to 0G. If the SDK/env is not configured, returns a
 * deterministic CID-like value (based on sha256) and optionally writes
 * the artifact to disk under .artifacts for local dev.
 */
export declare function uploadToZeroG(bytes: Buffer, opts?: {
    filename?: string;
}): Promise<{
    cid: string;
}>;
/**
 * Build the artifact, upload to 0G, and return identifiers.
 */
export declare function recordPredictionTo0G(input: PredictionInput): Promise<ZeroGRecordResult>;
//# sourceMappingURL=zeroG.d.ts.map