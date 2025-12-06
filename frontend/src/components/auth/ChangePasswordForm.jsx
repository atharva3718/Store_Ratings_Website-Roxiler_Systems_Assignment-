import React, { useState } from 'react';

const ChangePasswordForm = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Current password check
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    // New password validation (8-16 chars, 1 uppercase, 1 special char)
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
    if (!passwordRegex.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must be 8-16 characters with at least one uppercase and one special character';
    }

    // Check if new password is different from current
    if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    // Confirm password match
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    
    // API call to change password
    setTimeout(() => {
      console.log('Changing password...');
      setLoading(false);
      setSuccessMessage('Password changed successfully!');
      
      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Change Password</h2>
          <p className="text-gray-600">Update your account password</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
            <span className="mr-2">✓</span>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Current Password */}
          <div className="mb-5">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Current Password *
            </label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                errors.currentPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter current password"
              required
            />
            {errors.currentPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div className="mb-5">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              New Password *
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                errors.newPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="8-16 chars, 1 uppercase, 1 special char"
              required
            />
            {errors.newPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              Must contain 8-16 characters, at least one uppercase letter and one special character (!@#$%^&*)
            </p>
          </div>

          {/* Confirm New Password */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Confirm New Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Re-enter new password"
              required
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition font-medium disabled:bg-violet-400"
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>

        {/* Security Tips */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-amber-800 mb-2">🔒 Password Security Tips:</p>
          <ul className="text-sm text-amber-700 space-y-1 ml-4">
            <li>• Use a unique password that you don't use elsewhere</li>
            <li>• Avoid common words or personal information</li>
            <li>• Consider using a password manager</li>
            <li>• Change your password regularly</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordForm;