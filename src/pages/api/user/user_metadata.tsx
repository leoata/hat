import {IncomingMessage, ServerResponse} from "http";
import {useUser} from "@auth0/nextjs-auth0";
import {Management} from "auth0-js";


export default async function handler(req: IncomingMessage, res: ServerResponse) {
    let cookies = req.headers.cookie;
    if (!cookies){
        res.statusCode = 403;
        res.end();
        return;
    }

    const id = await fetch(
        "https://hat.leoata.com/api/auth/me",
        {headers: {Cookie: cookies},
    }).then(s=>{
        if (s.status !== 200) {
            res.statusCode = 403;
            res.end();
            return;
        }
        return s.json()
    }).then(s=>s.sub);

    var auth0 = new Management({
        domain: process.env.AUTH0_BASE_URL as string,
        clientId: process.env.AUTH0_CLIENT_ID,
        clientSecret: process.env.AUTH0_CLIENT_SECRET,
        token: cookies.split(";").find(s=>s.startsWith("appSession="))?.split("=")[1],
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
