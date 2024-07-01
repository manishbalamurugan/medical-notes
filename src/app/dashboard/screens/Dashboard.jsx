import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Nav from '../../../components/Nav.jsx';

const Dashboard = (props) => {
    const user = props.user;
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const response = await axios.get(`/api/retrieveNotes`, {
                    params: { userID: user.email }
                });
                setNotes(response.data);
            } catch (error) {
                console.error('Error retrieving note:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotes();
    }, [user.email]);

    const handleNoteClick = (noteID) => {
        navigate(`/playground/${noteID}`);
    };

    return (
        <div className="flex h-screen w-screen bg-white dark:bg-zinc-900">
            <Nav user={user} />
            <div className="flex flex-1 overflow-hidden">
                <main className="flex-1 overflow-auto p-4">
                    <div className="p-4">
                        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Welcome to the Dashboard</h1>
                        {loading ? (
                            <p className="mt-4 text-zinc-700 dark:text-zinc-300">Loading your notes...</p>
                        ) : notes.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                                {notes.map((note) => (
                                    <div 
                                        key={note.notesID} 
                                        className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-md cursor-pointer"
                                        onClick={() => handleNoteClick(note.notesID)}
                                    >
                                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{note.title}</h2>
                                        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
                                            {note.notes.length > 50 ? `${note.notes.substring(0, 75)}...` : note.notes}
                                        </p>
                                        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{new Date(note.dateCreated).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-4 text-zinc-700 dark:text-zinc-300">
                                No notes found. Head over to the playground to create and get started with your notes.
                            </p>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
