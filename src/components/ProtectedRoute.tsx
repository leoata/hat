import {useRouter} from "next/router";
import {useSession} from "next-auth/react";

export default function ProtectedRoute(props: any): JSX.Element | null {
    // checks whether we are on client / browser or server.
    if (typeof window !== "undefined") {
        const router = useRouter();
        const {data, status} = props.session;

        if (status !== "authenticated") {
            router.replace("/");
            return null;
        }

        return props.children;
    }

    // If we are on server, return null
    return null;
};
