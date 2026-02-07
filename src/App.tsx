import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import LessonPlayer from './components/LessonPlayer';
import AdminPanel from './components/AdminPanel';
import { fetchExercises, saveProgress, fetchUserProfile } from './api';

const App = () => {
    const [exercises, setExercises] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [completedExercises, setCompletedExercises] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            const exercisesData = await fetchExercises();
            setExercises(exercisesData);
            const profileData = await fetchUserProfile();
            setUserProfile(profileData);
        };
        loadData();
    }, []);

    const handleExerciseCompletion = (exerciseId) => {
        setCompletedExercises((prev) => [...prev, exerciseId]);
        saveProgress(userProfile.id, exerciseId);
    };

    return (
        <Router>
            <Routes>
                <Route path='/' element={<Dashboard exercises={exercises} onComplete={handleExerciseCompletion} />} />
                <Route path='/lesson/:id' element={<LessonPlayer onComplete={handleExerciseCompletion} />} />
                <Route path='/admin' element={<AdminPanel completedExercises={completedExercises} userProfile={userProfile} />} />
            </Routes>
        </Router>
    );
};

export default App;