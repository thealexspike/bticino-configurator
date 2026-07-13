import React, { useEffect, useState } from 'react';
import { api } from './api';

export default function AdminUsers({ onBack, currentUserId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setUsers(await api.adminListUsers());
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const flash = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 4000);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      await api.adminCreateUser(newEmail, newPassword);
      setNewEmail('');
      setNewPassword('');
      flash('Cont creat');
      await load();
    } catch (err) {
      setError(err.message);
    }
    setCreating(false);
  };

  const handleResetPassword = async (user) => {
    const password = window.prompt(`Parolă nouă pentru ${user.email} (minim 6 caractere):`);
    if (!password) return;
    setError('');
    try {
      await api.adminResetPassword(user.id, password);
      flash(`Parola pentru ${user.email} a fost schimbată`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Ștergi contul ${user.email}? Se șterg și toate proiectele lui. Acțiunea nu poate fi anulată.`)) return;
    setError('');
    try {
      await api.adminDeleteUser(user.id);
      flash(`Contul ${user.email} a fost șters`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('ro-RO', { dateStyle: 'short', timeStyle: 'short' });
    } catch {
      return iso;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Administrare conturi</h1>
        <button onClick={onBack} className="text-blue-600 hover:underline">
          ← Înapoi
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {notice && <p className="mb-4 text-sm text-green-600">{notice}</p>}

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="font-semibold mb-3">Creează cont nou</h2>
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            placeholder="email@exemplu.ro"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
            required
          />
          <input
            type="text"
            placeholder="Parolă (min. 6)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border rounded px-3 py-2 flex-1"
            required
            minLength={6}
          />
          <button
            type="submit"
            disabled={creating}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? 'Se creează...' : 'Creează'}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          Conturile cu email @atelierazimut.com sunt administratori (pot edita librăriile și conturile).
        </p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {loading ? (
          <p className="p-4 text-gray-600">Se încarcă...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="p-3">Email</th>
                <th className="p-3">Creat</th>
                <th className="p-3">Ultimul login</th>
                <th className="p-3">Proiecte</th>
                <th className="p-3">Parolă</th>
                <th className="p-3 text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="p-3">
                    {u.email}
                    {u.id === currentUserId && <span className="ml-2 text-xs text-gray-400">(tu)</span>}
                    {u.email.toLowerCase().endsWith('@atelierazimut.com') && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">admin</span>
                    )}
                  </td>
                  <td className="p-3 text-gray-600">{formatDate(u.created_at)}</td>
                  <td className="p-3 text-gray-600">{formatDate(u.last_login)}</td>
                  <td className="p-3">{u.project_count}</td>
                  <td className="p-3">
                    {u.has_password
                      ? <span className="text-green-700">setată</span>
                      : <span className="text-orange-600">nesetată</span>}
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleResetPassword(u)}
                      className="text-blue-600 hover:underline mr-3"
                    >
                      Resetează parola
                    </button>
                    {u.id !== currentUserId && (
                      <button
                        onClick={() => handleDelete(u)}
                        className="text-red-600 hover:underline"
                      >
                        Șterge
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td className="p-4 text-gray-500" colSpan={6}>Niciun cont.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
