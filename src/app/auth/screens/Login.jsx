import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react'

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { currentUser, login, loginWithGoogle, loginWithGithub } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [bgImage, setBgImage] = useState("")


    useEffect(() => {
        if (currentUser) {
            // navigate("/onboarding");
            navigate("/");
        }
    }, [currentUser, navigate]);

    async function handleLogin(e) {
        e.preventDefault();

        if(email === "" || password === "") {
            setError("Please fill in all fields");
            return;
        }

        try {
            setLoading(true);
            await login(email, password);
            navigate("/");
        } catch (e) {
            setError("Failed to register");
        }

        setLoading(false);
    }

    async function handleGoogleLogin() {
        try {
            setLoading(true);
            await loginWithGoogle();
            navigate("/");
        } catch (e) {
            setError("Failed to login with Google");
        }

        setLoading(false);
    }

    async function handleGithubLogin() {
        try {
            setLoading(true);
            await loginWithGithub();
            navigate("/");
        } catch (e) {
            setError("Failed to login with Github");
        }

        setLoading(false);
    }

    function handleKeyDown(e){
        if(e.key === "Enter"){
            handleLogin(e)
        }
    }

    return (<>
        
        <div className="relative h-screen overflow-y-auto">
            <div className="absolute inset-0 w-screen h-screen bg-white" > </div>
            <div className="absolute inset-0">
                <div className="flex align-center sm:align-start mx-auto p-2 m-2 px-5 pt-3">
                <div
                    className="h-8 w-8 mx-4 mb-2 self-start rounded-full"
                    style={{
                        background: 'linear-gradient(135deg, #FF69B4, #8A2BE2, #FFA500)',
                        filter: 'brightness(1.2)',
                    }}
                ></div>
                <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-800">Medical Notes</h1>
                </div>
            </div>
            <div className="absolute inset-0 justify-center items-center w-full">
                <div className="h-auto w-fit justify-center items-center p-8 m-8 mx-auto">
                    <div id="grid" className="grid grid-cols-1 text-center mt-10">
                        <div className="my-6">
                            <h1 className="my-2 text-gray-800 text-6xl font-semibold">Welcome back!</h1>
                            <p className="my-1 text-gray-800 text-xl font-medium">Enter your credentials below to access your workspace.</p>
                        </div>
                        <div className="mx-4 my-2 mt-6 text-center rounded-[5px] backdrop-blur-xl h-min">
                            <input id="email" type="email" className="w-full  p-2 text-sm rounded-sm bg-transparent border-2 border-gray-800 border-opacity-10 focus:border-opacity-60  text-gray-800" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="mx-4 my-2 text-center rounded-[5px] backdrop-blur-xl h-min">
                            <input id="password" type="password" className="w-full p-2 text-sm rounded-sm bg-transparent border-2 border-gray-800 border-opacity-10 focus:border-opacity-60 text-gray-800" placeholder="Password" onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown}/>
                        </div>
                        {error && <p className="text-red-600">{error}</p>}
                        <div className="mx-4 my-4 text-center rounded-[5px] bg-fuchsia-600 bg-opacity-20 backdrop-blur-xl h-min mx-[8rem]">
                            <button onClick={handleLogin} disabled={loading} className="p-2 text-md font-medium text-gray-800">Sign In</button>
                        </div>
                        <div class="border-t border-gray-800 opacity-10 w-full my-2"></div>
                        <div className="my-4 text-center">
                            <p className="text-gray-800">Don't have an account? <a href="/register" className="text-blue-600">Sign Up</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
    );
}