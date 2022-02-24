import {Session} from "next-auth/core/types";

export function isAuthorized(session: Session | null) {
    return (session && session.user && session.expires && !Number.isNaN(Date.parse(session.expires))
        && Date.parse(session.expires) > Date.now());
}

let rateCounts = new Map<string, number>(); // userId, count
let firstRateAdds = new Map<string, number>(); // userId, firstRateAdd

export let runRateLimitMiddleware = (providerId: string): boolean => { // return true if rate limit exceeded
    rateCounts.set(providerId, (rateCounts.get(providerId) ?? 0) + 1);
    if (!firstRateAdds.get(providerId))
        firstRateAdds.set(providerId, Date.now());
    if (firstRateAdds.get(providerId) as number + 1000 * 60 * 3 < Date.now()) {
        firstRateAdds.set(providerId, Date.now());
        rateCounts.set(providerId, 0);
    }
    return (rateCounts.get(providerId) ?? 0) > 20; // 20 requests per 3 mins

}
