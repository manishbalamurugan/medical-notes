import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

const Nav = (props) => {
    const {logout } = useAuth();
    const [isPopoverOpen, setIsPopoverOpen] = useState(false); 
    const location = useLocation();
    const user = props.user;

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    return (
        <nav className="flex flex-col h-screen w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
            <div className="flex flex-col items-center py-4">
                <div
                    className="h-8 w-8 mx-4 mb-2 self-start rounded-full"
                    style={{
                        background: 'linear-gradient(135deg, #FF69B4, #8A2BE2, #FFA500)',
                        filter: 'brightness(1.2)',
                    }}
                ></div>
                <div className="flex flex-col items-center">
                    <div className="h-16 w-16 rounded-full mb-2 flex items-center justify-center bg-sky-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 text-xl font-semibold">
                        {user.email ? user.email.slice(0, 2).toUpperCase() : 'N/A'}
                    </div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{user?.email}</p>
                </div>
            </div>
            <div className="flex flex-col mt-4 space-y-2">
                <a href="/" className={`text-sm font-semibold px-4 py-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 ${location.pathname === '/' ? 'bg-zinc-200 dark:bg-zinc-800' : 'text-zinc-900 dark:text-zinc-50'}`}>Dashboard</a>
                <a href="/playground" className={`text-sm font-semibold px-4 py-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 ${location.pathname === '/playground' ? 'bg-zinc-200 dark:bg-zinc-800' : 'text-zinc-900 dark:text-zinc-50'}`}>Playground</a>
                <a href="/profile" className={`text-sm disable font-semibold px-4 py-2 text-zinc-400 dark:text-zinc-600 cursor-not-allowed`} onClick={(e) => e.preventDefault()}>Profile</a>
                <a href="/settings" className={`text-sm disable font-semibold px-4 py-2 text-zinc-400 dark:text-zinc-600 cursor-not-allowed`} onClick={(e) => e.preventDefault()}>Settings</a>
                <button onClick={handleLogout} className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 px-4 py-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-left">Log Out</button>
            </div>
        </nav>
    );
};
export default Nav;
