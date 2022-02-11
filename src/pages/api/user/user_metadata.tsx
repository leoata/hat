import {IncomingMessage, ServerResponse} from "http";
import {useUser} from "@auth0/nextjs-auth0";
import {Management} from "auth0-js";
import {getBaseUrl} from "../../../util/envUtil";

const fetcher = (url: RequestInfo) => fetch(url).then((res) => res.json())

export default async function handler(req: IncomingMessage, res: ServerResponse) {
    let cookies = req.headers.cookie;
    if (!cookies) {
        res.statusCode = 403;
        res.end();
        return;
    }
    const data = await fetch(getBaseUrl() + '/api/auth/me', {
        headers: {
            Cookie: cookies
        }
    });
    const user = await data.json();


    console.log(user)
    const id = user.sub;

    console.log("cookies: " + cookies + ", id: " + id);
    var auth0 = new Management({
        domain: process.env.AUTH0_BASE_URL as string,
        clientId: process.env.AUTH0_CLIENT_ID,
        clientSecret: process.env.AUTH0_CLIENT_SECRET,
        token: cookies.split(";").find(s => s.startsWith("appSession="))?.split("=")[1],
        scope: "read:users update:users",
    });

    var metadata = {
        foo: "bar",
    };
    auth0.patchUserMetadata("google-oauth2|103207838184452810529", metadata, (err, data) => {
        if (err) {
            console.log(err);
        }
        console.log(data);
    });
}
