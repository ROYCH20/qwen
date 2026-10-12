import { useState } from 'react';
import RegistrationScreen from './components/RegistrationScreen';
import ParticipantScreen from './components/ParticipantScreen';
import CuratorScreen from './components/CuratorScreen';
import AdminScreen from './components/AdminScreen';
import { getUserById, User } from './database';

type Screen = 'registration' | 'participant' | 'curator' | 'admin';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('registration');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (userId: string) => {
    const user = getUserById(userId);
    if (!user) {
      alert('Пользователь с данным ID не найден в системе!');
      return;
    }
    setCurrentUser(user);
    setCurrentScreen(user.role);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen('registration');
  };

  return (
    <div className="min-h-screen bg-[#edeef0] flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen bg-white shadow-xl relative">
        {/* VK Header */}
        <div className="bg-[#0077ff] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.598-.188 1.368 1.259 2.184 1.814.616.42 1.084.328 1.084.328l2.178-.03s1.14-.07.6-.964c-.044-.073-.314-.661-1.618-1.869-1.366-1.265-1.183-1.06.462-3.246.998-1.33 1.398-2.142 1.273-2.489-.12-.331-.856-.244-.856-.244l-2.45.015s-.182-.025-.316.056c-.132.079-.216.263-.216.263s-.388 1.032-.906 1.91c-1.094 1.856-1.531 1.953-1.71 1.838-.416-.268-.312-1.075-.312-1.65 0-1.79.272-2.542-.53-2.736-.266-.064-.462-.107-1.142-.114-.872-.009-1.61.003-2.028.208-.278.136-.492.44-.362.457.162.022.528.099.722.363.25.341.241 1.107.241 1.107s.144 2.11-.336 2.372c-.33.18-.782-.188-1.75-1.87-.496-.862-.87-1.814-.87-1.814s-.072-.176-.2-.27c-.156-.114-.374-.15-.374-.15l-2.328.015s-.35.01-.478.162c-.114.135-.01.414-.01.414s1.827 4.272 3.894 6.426c1.894 1.976 4.044 1.849 4.044 1.849h.974z"/>
            </svg>
            <span className="font-semibold text-lg">VK Сервис</span>
          </div>
          {currentUser && (
            <button
              onClick={handleLogout}
              className="text-sm bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition"
            >
              Выйти
            </button>
          )}
        </div>

        {/* Content */}
        <div className="pb-6">
          {currentScreen === 'registration' && (
            <RegistrationScreen onLogin={handleLogin} />
          )}
          {currentScreen === 'participant' && currentUser && (
            <ParticipantScreen user={currentUser} />
          )}
          {currentScreen === 'curator' && currentUser && (
            <CuratorScreen user={currentUser} />
          )}
          {currentScreen === 'admin' && currentUser && (
            <AdminScreen user={currentUser} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
