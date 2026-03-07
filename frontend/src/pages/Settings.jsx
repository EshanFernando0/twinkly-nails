import { useState, useEffect } from 'react';
import { User, Phone, Store, Lock, AlertCircle, CheckCircle, LogOut } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const [profileForm, setProfileForm] = useState({ full_name: '', phone: '', salon_name: '' });
  const [pwdForm, setPwdForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [profileMsg, setProfileMsg] = useState(null);
  const [pwdMsg, setPwdMsg] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    if (user) setProfileForm({ full_name: user.full_name || '', phone: user.phone || '', salon_name: user.salon_name || 'Nail Saloon' });
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true); setProfileMsg(null);
    try {
      const { data } = await api.put('/auth/profile', profileForm);
      updateUser({ ...user, ...data });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.error || 'Error updating profile' });
    } finally { setProfileLoading(false); }
  };

  const handlePwdSave = async (e) => {
    e.preventDefault();
    if (pwdForm.new_password !== pwdForm.confirm_password) {
      setPwdMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (pwdForm.new_password.length < 6) {
      setPwdMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    setPwdLoading(true); setPwdMsg(null);
    try {
      await api.put('/auth/change-password', { current_password: pwdForm.current_password, new_password: pwdForm.new_password });
      setPwdMsg({ type: 'success', text: 'Password changed successfully!' });
      setPwdForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.response?.data?.error || 'Error changing password' });
    } finally { setPwdLoading(false); }
  };

  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'OW';

  return (
    <div style={{ maxWidth: '680px' }}>
      {/* Profile Card */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ padding: '28px 28px 0', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, var(--pink-300), var(--pink-500))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 26, flexShrink: 0, boxShadow: 'var(--shadow)' }}>
            {initials}
          </div>
          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '2px' }}>{user?.full_name}</h3>
            <p style={{ fontSize: '13px', color: 'var(--gray-400)' }}>{user?.email}</p>
            <span className="badge badge-pink" style={{ marginTop: '6px' }}>{user?.role}</span>
          </div>
        </div>
        <div className="card-header" style={{ marginTop: '20px' }}>
          <h3><User size={15} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle', color: 'var(--pink-400)' }} />Profile Information</h3>
        </div>
        <form onSubmit={handleProfileSave}>
          <div className="modal-body" style={{ padding: '20px 28px' }}>
            {profileMsg && (
              <div className={`alert alert-${profileMsg.type}`} style={{ marginBottom: '16px' }}>
                {profileMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {profileMsg.text}
              </div>
            )}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label"><User size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Full Name</label>
                <input className="form-control" value={profileForm.full_name} onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })} placeholder="Your full name" required />
              </div>
              <div className="form-group">
                <label className="form-label"><Phone size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Phone Number</label>
                <input className="form-control" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="077xxxxxxx" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label"><Store size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Salon Name</label>
              <input className="form-control" value={profileForm.salon_name} onChange={e => setProfileForm({ ...profileForm, salon_name: e.target.value })} placeholder="Your salon name" />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-control" value={user?.email || ''} disabled style={{ background: 'var(--gray-50)', color: 'var(--gray-400)' }} />
              <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '4px' }}>Email cannot be changed</p>
            </div>
          </div>
          <div className="modal-footer" style={{ padding: '16px 28px 24px' }}>
            <button type="submit" className="btn btn-primary" disabled={profileLoading}>
              {profileLoading ? <><span className="spinner" style={{ width: 14, height: 14 }} />Saving...</> : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Password Card */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h3><Lock size={15} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle', color: 'var(--pink-400)' }} />Change Password</h3>
        </div>
        <form onSubmit={handlePwdSave}>
          <div className="modal-body" style={{ padding: '20px 28px' }}>
            {pwdMsg && (
              <div className={`alert alert-${pwdMsg.type}`} style={{ marginBottom: '16px' }}>
                {pwdMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {pwdMsg.text}
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input type="password" className="form-control" value={pwdForm.current_password} onChange={e => setPwdForm({ ...pwdForm, current_password: e.target.value })} placeholder="Your current password" required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" className="form-control" value={pwdForm.new_password} onChange={e => setPwdForm({ ...pwdForm, new_password: e.target.value })} placeholder="Min 6 characters" required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input type="password" className="form-control" value={pwdForm.confirm_password} onChange={e => setPwdForm({ ...pwdForm, confirm_password: e.target.value })} placeholder="Repeat new password" required />
              </div>
            </div>
          </div>
          <div className="modal-footer" style={{ padding: '16px 28px 24px' }}>
            <button type="submit" className="btn btn-primary" disabled={pwdLoading}>
              {pwdLoading ? <><span className="spinner" style={{ width: 14, height: 14 }} />Updating...</> : 'Change Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Logout */}
      <div className="card">
        <div className="card-header"><h3>Account</h3></div>
        <div style={{ padding: '20px 28px' }}>
          <p style={{ fontSize: '13.5px', color: 'var(--gray-500)', marginBottom: '16px' }}>
            You are currently logged in as <strong>{user?.full_name}</strong> ({user?.email}).
            Logging out will end your current session.
          </p>
          <button className="btn btn-danger" onClick={logout} style={{ gap: 8 }}>
            <LogOut size={15} /> Logout of Nail Saloon
          </button>
        </div>
      </div>
    </div>
  );
}
