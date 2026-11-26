import { useState, useEffect, useCallback } from 'react';
import { Users, UserPlus, Trash2, AlertCircle, CheckCircle, KeyRound } from 'lucide-react';
import { useAuth } from './AuthContext.js';
import { apiFetch } from '../utils/api';

export default function UserManagement() {
  const { token, user: currentUser, updateToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [replacementPassword, setReplacementPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('editor');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const res = await apiFetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // Network completion updates state asynchronously; this effect owns initial loading.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');

    try {
      const res = await apiFetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          name: newName,
          role: newRole
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add user');

      setMsg('User created successfully!');
      setShowAddModal(false);
      setNewUsername('');
      setNewPassword('');
      setNewName('');
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (id, username) => {
    if (!window.confirm(`Are you sure you want to delete administrator "${username}"?`)) return;

    try {
      const res = await apiFetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMsg('User deleted.');
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setPasswordError('');
    setMsg('');
    if (replacementPassword !== confirmPassword) {
      setPasswordError('The new password and confirmation do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await apiFetch('/api/admin/account/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword: replacementPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password.');

      setMsg('Password updated. Sign in next time with your new password.');
      setCurrentPassword('');
      setReplacementPassword('');
      setConfirmPassword('');
      setShowPasswordModal(false);
      updateToken(data.token);
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#10281e] p-5 rounded-2xl border border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#caa34b]" />
            User & Admin Management
          </h2>
          <p className="text-xs text-white/60 mt-1">
            Manage authorized administrators, editors, and roles with full access controls.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {currentUser?.username?.toLowerCase() !== 'admin' && <button
            onClick={() => { setPasswordError(''); setShowPasswordModal(true); }}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl flex items-center gap-2 transition"
          >
            <KeyRound className="w-4 h-4" /> Change My Password
          </button>}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-[#caa34b] hover:bg-[#d8b85e] text-[#10281e] font-semibold text-xs rounded-xl flex items-center gap-2 transition shadow-md"
          >
            <UserPlus className="w-4 h-4" />
            Add New Admin / Editor
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{msg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-[#10281e] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white/80">
            <thead className="bg-[#0a1711] text-white/50 uppercase tracking-wider text-[10px] border-b border-white/10">
              <tr>
                <th className="px-6 py-3.5">Name & User</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Created Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? <tr><td colSpan={4} className="px-6 py-8 text-center text-white/50">Loading administrators…</td></tr> : users.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.02] transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#caa34b]/20 text-[#caa34b] font-bold flex items-center justify-center text-xs">
                        {(u.name || u.username)[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{u.name || u.username}</p>
                        <p className="text-white/40 text-[11px]">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-[#caa34b]/20 text-[#caa34b] border border-[#caa34b]/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/50">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.username?.toLowerCase() === 'admin' && u.role === 'admin' ? (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#caa34b]">Protected account</span>
                    ) : u.id !== currentUser?.id && (
                      <button
                        onClick={() => handleDeleteUser(u.id, u.username)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#10281e] border border-white/15 rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#caa34b]" />
              Create Administrator / Editor
            </h3>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#caa34b]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. johndoe"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#caa34b]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={12}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#caa34b]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#caa34b]"
                >
                  <option value="admin">Administrator (Full Control)</option>
                  <option value="editor">Editor (Content & Media Management)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#caa34b] text-[#10281e] font-bold text-xs rounded-xl hover:bg-[#d8b85e]"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-md rounded-3xl border border-white/15 bg-[#10281e] p-6 shadow-2xl">
            <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-white">
              <KeyRound className="h-5 w-5 text-[#caa34b]" /> Change your password
            </h3>
            <p className="mb-5 text-xs leading-5 text-white/60">Use a unique password with at least 12 characters. A password manager can generate and save one.</p>
            {passwordError && <p role="alert" className="mb-4 rounded-xl border border-red-400/30 bg-red-950/50 p-3 text-xs text-red-200">{passwordError}</p>}
            <form onSubmit={handleChangePassword} className="space-y-4">
              <label className="block text-xs font-semibold text-white/70">
                Current password
                <input type="password" required autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-[#0a1711] px-4 py-3 text-sm text-white focus:border-[#caa34b] focus:outline-none" />
              </label>
              <label className="block text-xs font-semibold text-white/70">
                New password
                <input type="password" required minLength={12} maxLength={128} autoComplete="new-password" value={replacementPassword} onChange={(event) => setReplacementPassword(event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-[#0a1711] px-4 py-3 text-sm text-white focus:border-[#caa34b] focus:outline-none" />
              </label>
              <label className="block text-xs font-semibold text-white/70">
                Confirm new password
                <input type="password" required minLength={12} maxLength={128} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-[#0a1711] px-4 py-3 text-sm text-white focus:border-[#caa34b] focus:outline-none" />
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="rounded-xl px-4 py-2 text-xs text-white/60 hover:text-white">Cancel</button>
                <button type="submit" disabled={isChangingPassword} className="rounded-xl bg-[#caa34b] px-4 py-2 text-xs font-bold text-[#10281e] hover:bg-[#d8b85e] disabled:opacity-50">{isChangingPassword ? 'Updating...' : 'Update password'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

