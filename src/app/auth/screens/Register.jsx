import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react'

export default function Register() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [acceptTerms, setAcceptTerms] = useState(false);
    const { currentUser, register } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (currentUser) {
            navigate("/");
        }
    }, [currentUser, navigate]);

    async function handleRegister(e) {
        e.preventDefault();

        if(email === "" || password === "" || confirmPassword === "") {
            setError("Please fill in all fields");
            return;
        }

        if(password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if(!acceptTerms) {
            setError("You must accept the terms and conditions");
            return;
        }

        try {
            setLoading(true);
            await register(email, password);
            navigate("/");
        } catch (e) {
            setError("Failed to create an account");
        }

        setLoading(false);
    }

    return (<>
        
        <div className="relative h-screen overflow-y-auto">
            <div className="absolute inset-0 w-screen h-screen bg-white" > </div>
            <div className="absolute inset-0">
                <div className="flex align-center sm:align-start mx-auto p-2 m-2 px-5 pt-3">
                <svg
                    className="h-8 w-8 text-zinc-800 dark:text-zinc-800"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M12 3v18c-5 0-9-4-9-9s4-9 9-9z" />
                    <path d="M12 3c5 0 9 4 9 9s-4 9-9 9V3z" />
                </svg>
                <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-800">V2T (Magnum Consulting)</h1>
                </div>
            </div>
            <div className="absolute inset-0 justify-center items-center w-full">
                <div className="h-auto w-fit justify-center items-center p-8 m-8 mx-auto">
                    <div id="grid" className="grid grid-cols-1 text-center mt-10">
                        <div className="my-6">
                            <h1 className="my-2 text-gray-800 text-6xl font-semibold">Create your account</h1>
                            <p className="my-1 text-gray-800 text-xl font-medium">Sign up to access your workspace.</p>
                        </div>
                        <div className="mx-4 my-2 mt-6 text-center rounded-[5px] backdrop-blur-xl h-min">
                            <input id="email" type="email" className="w-full  p-2 text-sm rounded-sm bg-transparent border-2 border-gray-800 border-opacity-10 focus:border-opacity-60  text-gray-800" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="mx-4 my-2 text-center rounded-[5px] backdrop-blur-xl h-min">
                            <input id="password" type="password" className="w-full p-2 text-sm rounded-sm bg-transparent border-2 border-gray-800 border-opacity-10 focus:border-opacity-60 text-gray-800" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className="mx-4 my-2 text-center rounded-[5px] backdrop-blur-xl h-min">
                            <input id="confirmPassword" type="password" className="w-full p-2 text-sm rounded-sm bg-transparent border-2 border-gray-800 border-opacity-10 focus:border-opacity-60 text-gray-800" placeholder="Confirm Password" onChange={(e) => setConfirmPassword(e.target.value)} />
                        </div>
                        <div className="mx-4 my-2">
                            <label className="inline-flex items-center">
                                <input type="checkbox" className="form-checkbox text-fuchsia-600" onChange={(e) => setAcceptTerms(e.target.checked)} />
                                <span className="ml-2 text-gray-800">I accept the <a href="/terms" className="text-blue-600">Terms and Conditions</a></span>
                            </label>
                        </div>
                        {error && <p className="text-red-600">{error}</p>}
                        <div className="mx-4 my-4 text-center rounded-[5px] bg-fuchsia-600 bg-opacity-20 backdrop-blur-xl h-min mx-[8rem]">
                            <button onClick={handleRegister} disabled={loading} className="p-2 text-md font-medium text-gray-800">Sign Up</button>
                        </div>
                        <div className="border-t border-gray-800 opacity-10 w-full my-2"></div>
                        <div className="my-4 text-center">
                            <p className="text-gray-800">Already have an account? <a href="/login" className="text-blue-600">Log In</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
    );
}