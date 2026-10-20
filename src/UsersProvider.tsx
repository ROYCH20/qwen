import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import supabase from './supabaseClient';
import { normalizeYo } from './text';

export type Role = 'participant' | 'curator' | 'admin';

export interface User {
  id: string;
  role: Role;
  full_name: string;
  grp?: string | null;
  points: number;
  vk_id?: number | null;
}

interface UsersContextType {
  users: User[];
  loading: boolean;
  error: string | null;
  getUserById: (id: string) => User | null;
  getUserByVkId: (vkId: number) => User | null;
  getUsersByRole: (role: Role) => User[];
  getGroupSummary: () => { group: string; totalPoints: number; participants: number }[];
  addUser: (data: { id: string; role: 'participant' | 'curator'; fullName: string; group?: string }) => Promise<boolean>;
  updateUser: (oldId: string, data: { id: string; fullName: string; group?: string }) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  updatePoints: (userId: string, newPoints: number) => Promise<boolean>;
  resetAllPoints: () => Promise<void>;
  bindVkId: (userId: string, vkId: number) => Promise<void>;
  retry: () => void;
}

const UsersContext = createContext<UsersContextType | null>(null);

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!supabase) {
      setError('Не удалось подключиться к базе данных. Проверьте соединение.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .order('id');

      if (fetchError) {
        throw fetchError;
      }

      // Нормализуем Yo → E при чтении
      const normalizedData = (data || []).map((user: any) => ({
        ...user,
        full_name: normalizeYo(user.full_name),
        grp: user.grp ? normalizeYo(user.grp) : user.grp
      }));

      setUsers(normalizedData);
    } catch (err) {
      console.error('[UsersProvider] Fetch error:', err);
      setError('Не удалось подключиться к базе данных. Проверьте соединение.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();

    if (!supabase) return;

    const client = supabase;

    // Subscribe to realtime changes
    const channel = client
      .channel('users-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newUser = payload.new as any;
            const normalizedUser = {
              ...newUser,
              full_name: normalizeYo(newUser.full_name),
              grp: newUser.grp ? normalizeYo(newUser.grp) : newUser.grp
            };
            setUsers((prev) => [...prev, normalizedUser]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedUser = payload.new as any;
            const normalizedUser = {
              ...updatedUser,
              full_name: normalizeYo(updatedUser.full_name),
              grp: updatedUser.grp ? normalizeYo(updatedUser.grp) : updatedUser.grp
            };
            setUsers((prev) =>
              prev.map((u) => (u.id === normalizedUser.id ? normalizedUser : u))
            );
          } else if (payload.eventType === 'DELETE') {
            setUsers((prev) => prev.filter((u) => u.id !== (payload.old as User).id));
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [fetchUsers]);

  const getUserById = useCallback(
    (id: string): User | null => {
      return users.find((u) => u.id === id) || null;
    },
    [users]
  );

  const getUserByVkId = useCallback(
    (vkId: number): User | null => {
      return users.find((u) => u.vk_id === vkId) || null;
    },
    [users]
  );

  const getUsersByRole = useCallback(
    (role: Role): User[] => {
      return users.filter((u) => u.role === role);
    },
    [users]
  );

  const getGroupSummary = useCallback((): { group: string; totalPoints: number; participants: number }[] => {
    const participants = users.filter((u) => u.role === 'participant');
    const groupMap = new Map<string, { totalPoints: number; participants: number }>();

    participants.forEach((p) => {
      if (p.grp) {
        const existing = groupMap.get(p.grp) || { totalPoints: 0, participants: 0 };
        existing.totalPoints += p.points;
        existing.participants += 1;
        groupMap.set(p.grp, existing);
      }
    });

    return Array.from(groupMap.entries())
      .map(([group, data]) => ({
        group,
        totalPoints: data.totalPoints,
        participants: data.participants,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints);
  }, [users]);

  const addUser = useCallback(
    async (data: { id: string; role: 'participant' | 'curator'; fullName: string; group?: string }): Promise<boolean> => {
      if (!supabase) return false;

      const trimmedId = data.id.trim();
      if (!trimmedId) return false;

      // Check uniqueness
      const existingUser = getUserById(trimmedId);
      if (existingUser) return false;

      let newUser: User;

      if (data.role === 'participant') {
        if (!data.group || !data.group.trim()) return false;
        newUser = {
          id: trimmedId,
          role: 'participant',
          full_name: normalizeYo(data.fullName.trim()),
          grp: normalizeYo(data.group.trim()),
          points: 300,
        };
      } else if (data.role === 'curator') {
        newUser = {
          id: trimmedId,
          role: 'curator',
          full_name: normalizeYo(data.fullName.trim()),
          grp: null,
          points: 0,
        };
      } else {
        return false;
      }

      const { error } = await supabase.from('users').insert(newUser);
      return !error;
    },
    [getUserById]
  );

  const updateUser = useCallback(
    async (oldId: string, data: { id: string; fullName: string; group?: string }): Promise<boolean> => {
      if (!supabase) return false;

      const trimmedNewId = data.id.trim();
      if (!trimmedNewId || !data.fullName.trim()) return false;

      const user = getUserById(oldId);
      if (!user) return false;

      // Check uniqueness if ID changed
      if (trimmedNewId !== oldId) {
        const existingUser = getUserById(trimmedNewId);
        if (existingUser) return false;
      }

      const updates: Partial<User> = {
        id: trimmedNewId,
        full_name: normalizeYo(data.fullName.trim()),
      };

      if (user.role === 'participant') {
        if (!data.group || !data.group.trim()) return false;
        updates.grp = normalizeYo(data.group.trim());
      }

      const { error } = await supabase.from('users').update(updates).eq('id', oldId);
      return !error;
    },
    [getUserById]
  );

  const deleteUser = useCallback(
    async (id: string): Promise<boolean> => {
      if (!supabase) return false;

      const { error } = await supabase.from('users').delete().eq('id', id);
      return !error;
    },
    []
  );

  const updatePoints = useCallback(
    async (userId: string, newPoints: number): Promise<boolean> => {
      if (!supabase) return false;

      const { error } = await supabase.from('users').update({ points: newPoints }).eq('id', userId);
      return !error;
    },
    []
  );

  const resetAllPoints = useCallback(async (): Promise<void> => {
    if (!supabase) return;

    const client = supabase;
    const participants = users.filter((u) => u.role === 'participant');
    const updates = participants.map((p) =>
      client.from('users').update({ points: 300 }).eq('id', p.id)
    );
    await Promise.all(updates);
  }, [users]);

  const bindVkId = useCallback(
    async (userId: string, vkId: number): Promise<void> => {
      if (!supabase) return;

      const user = getUserById(userId);
      if (!user) return;

      // Привязываем только если vk_id еще не привязан или совпадает
      if (user.vk_id && user.vk_id !== vkId) return;

      await supabase.from('users').update({ vk_id: vkId }).eq('id', userId);
    },
    [getUserById]
  );

  const retry = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  const value: UsersContextType = {
    users,
    loading,
    error,
    getUserById,
    getUserByVkId,
    getUsersByRole,
    getGroupSummary,
    addUser,
    updateUser,
    deleteUser,
    updatePoints,
    resetAllPoints,
    bindVkId,
    retry,
  };

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
}

export function useUsers(): UsersContextType {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
}
