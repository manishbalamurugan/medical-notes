import React, { useState, useContext } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Nav = (props) => {
    const { user, logout } = useAuth();
    const [isPopoverOpen, setIsPopoverOpen] = useState(false); 

    const togglePopover = () => {
        setIsPopoverOpen(!isPopoverOpen);
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    return (
        <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center space-x-1 w-full">
            <div className="flex justify-between w-full">
                <svg
                className="h-8 w-8 text-zinc-900 dark:text-zinc-50"
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
                <nav className="flex items-center space-x-5">
                <a href="/dashboard" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Dashboard</a>
                <a href="/notes" className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Notes</a>
                <div className="relative ml-auto">
                    <button className="flex items-center justify-center h-8 w-8 rounded-full" onClick={togglePopover}>
                        <img src={user?.photoURL ? user.photoURL : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' fill='none'%3E%3Crect fill='url(%23paint0_linear)' width='200' height='200'/%3E%3Cdefs%3E%3ClinearGradient id='paint0_linear' x1='0' y1='0' x2='200' y2='200' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%23D8BFD8'/%3E%3Cstop offset='1' stop-color='%238A2BE2'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E"} alt="Profile" />
                    </button>
                    {isPopoverOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none rounded-md" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button" tabIndex="-1">
                            <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" tabIndex="-1" id="user-menu-item-0">Profile</a>
                            <a href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" tabIndex="-1" id="user-menu-item-2">Settings</a>
                            <button onClick={handleLogout} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" role="menuitem" tabIndex="-1" id="user-menu-item-4">Log out</button>
                        </div>
                    )}
                </div>
                </nav>
            </div>
            </div>
        </nav>
    );
};

export default Nav;
