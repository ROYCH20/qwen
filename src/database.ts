// Имитация базы данных через localStorage

export type Role = 'participant' | 'curator' | 'admin';

export interface User {
  id: string;
  role: Role;
  fullName: string;
  group?: string; // только для участников
  points: number; // только для участников
}

const DB_KEY = 'vk_service_users';

// Инициализация базы данных с предустановленными пользователями
function initDB(): void {
  const existing = localStorage.getItem(DB_KEY);
  if (!existing) {
    const defaultUsers: User[] = [
      // Участники
      { id: 'P001', role: 'participant', fullName: 'Иванов Иван Иванович', group: 'ИВТ-201', points: 300 },
      { id: 'P002', role: 'participant', fullName: 'Петрова Мария Сергеевна', group: 'ИВТ-201', points: 300 },
      { id: 'P003', role: 'participant', fullName: 'Сидоров Алексей Дмитриевич', group: 'ИВТ-202', points: 300 },
      { id: 'P004', role: 'participant', fullName: 'Козлова Анна Павловна', group: 'ИВТ-202', points: 300 },
      { id: 'P005', role: 'participant', fullName: 'Морозов Дмитрий Алексеевич', group: 'ПИ-301', points: 300 },
      { id: 'P006', role: 'participant', fullName: 'Новикова Елена Владимировна', group: 'ПИ-301', points: 300 },
      { id: 'P007', role: 'participant', fullName: 'Волков Артём Николаевич', group: 'ПИ-302', points: 300 },
      { id: 'P008', role: 'participant', fullName: 'Соколова Дарья Игоревна', group: 'ПИ-302', points: 300 },
      // Кураторы
      { id: 'C001', role: 'curator', fullName: 'Смирнова Ольга Викторовна', points: 0 },
      { id: 'C002', role: 'curator', fullName: 'Кузнецов Павел Андреевич', points: 0 },
      // Админ
      { id: 'A001', role: 'admin', fullName: 'Администратор Системы', points: 0 },
    ];
    localStorage.setItem(DB_KEY, JSON.stringify(defaultUsers));
  }
}

// Получить всех пользователей
export function getAllUsers(): User[] {
  initDB();
  const data = localStorage.getItem(DB_KEY);
  return data ? JSON.parse(data) : [];
}

// Получить пользователя по ID
export function getUserById(id: string): User | null {
  const users = getAllUsers();
  return users.find(u => u.id === id) || null;
}

// Получить пользователей по роли
export function getUsersByRole(role: Role): User[] {
  const users = getAllUsers();
  return users.filter(u => u.role === role);
}

// Обновить баллы участника
export function updatePoints(userId: string, newPoints: number): boolean {
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) return false;
  users[index].points = newPoints;
  localStorage.setItem(DB_KEY, JSON.stringify(users));
  return true;
}

// Получить сводку по группам (для админа)
export function getGroupSummary(): { group: string; totalPoints: number; participants: number }[] {
  const participants = getUsersByRole('participant');
  const groupMap = new Map<string, { totalPoints: number; participants: number }>();
  
  participants.forEach(p => {
    if (p.group) {
      const existing = groupMap.get(p.group) || { totalPoints: 0, participants: 0 };
      existing.totalPoints += p.points;
      existing.participants += 1;
      groupMap.set(p.group, existing);
    }
  });
  
  return Array.from(groupMap.entries()).map(([group, data]) => ({
    group,
    totalPoints: data.totalPoints,
    participants: data.participants,
  })).sort((a, b) => b.totalPoints - a.totalPoints);
}

// Сбросить баллы всех участников до 300
export function resetAllPoints(): void {
  const users = getAllUsers();
  const updatedUsers = users.map(u => {
    if (u.role === 'participant') {
      return { ...u, points: 300 };
    }
    return u;
  });
  localStorage.setItem(DB_KEY, JSON.stringify(updatedUsers));
}

// Сбросить базу данных
export function resetDB(): void {
  localStorage.removeItem(DB_KEY);
  initDB();
}
