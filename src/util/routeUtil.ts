import {NextRouter} from "next/router";

export function changeRoute(router: NextRouter, path: string, animApi: any) {
    animApi({opacity: 0});
    router.push(path);
}
