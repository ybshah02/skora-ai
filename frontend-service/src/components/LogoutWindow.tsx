import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function LogoutWindow() {
    const navigate = useNavigate();
    useEffect(() => {
        navigate("/signout")

    }, [navigate])
    return (
        <div></div>
    )
}

export default LogoutWindow;