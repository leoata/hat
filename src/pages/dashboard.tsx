import {getSession, useSession} from "next-auth/react";
import {useEffect, useState} from "react";
import {Select} from "grommet";
import DashboardThree from "../components/DashboardThree";
import DashboardOne from "../components/DashboardOne";
import DashboardFive from "../components/DashboardFive";
import DashboardTwo from "../components/DashboardTwo";
import DashboardFour from "../components/DashboardFour";
import {getBaseUrl} from "../util/envUtil";
import {useRouter} from "next/router";

const fetcher = (url: string) => fetch(url).then(r => r.json());

//possibly add ability to add metadata to tests and assignments so have all data in one spot. is it open note, on
// canvas or paper, priority, etc.

function Dashboard() {
    const router = useRouter();
    const {data: session, status} = useSession();
    const [designChoice, setDesignChoice] = useState("Dashboard One");



    if (!session || !session.user || !session.user.email) {
        router.replace("/");
        return null;
    }


    const [data, setData] = useState(null);
    const [isLoading, setLoading] = useState(false);

    let comp = <DashboardOne user={data}/>;
    useEffect(() => {
        switch (designChoice) {
            case "Dashboard One":
                comp = <DashboardOne user={data}/>;
                break;
            case "Dashboard Two":
                comp = <DashboardTwo/>;
                break;
            case "Dashboard Three":
                comp = <DashboardThree/>;
                break;
            case "Dashboard Four":
                comp = <DashboardFour/>;
                break;
            case "Dashboard Five":
                comp = <DashboardFive/>;
                break;
        }
    }, [designChoice]);

    useEffect(() => {
        setLoading(true)
        // @ts-ignore
        fetch(getBaseUrl() + "/api/user/" + session.user.email)
            .then((res) => res.json())
            .then((data) => {
                setData(data)
                setLoading(false)
            })
            .catch((err: any) => {
                router.replace("/");
                return null;
            });
    }, [])

    if (isLoading) return <p>Loading...</p>
    if (!data) return <p>No profile data</p>



    return (
        <div>
            <div style={{position: "absolute", right: "100px", top: "50px"}}>
                <Select
                    value={designChoice}
                    onChange={(e: any) => setDesignChoice(e.target.value)}
                    options={["Dashboard One", "Dashboard Two", "Dashboard Three", "Dashboard Four", "Dashboard Five"]}
                />
            </div>
            {comp}
        </div>
    );
}

Dashboard.auth = true;
export default Dashboard;
