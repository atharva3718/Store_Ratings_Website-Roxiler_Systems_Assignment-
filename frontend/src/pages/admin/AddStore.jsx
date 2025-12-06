import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../../components/common/Toast.jsx';

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) || 'http://localhost:5000';

const AddStore = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        ownerName: '',
        ownerEmail: '',
        ownerAddress: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const nameRef = useRef(null);
    const emailRef = useRef(null);
    const addressRef = useRef(null);
    const ownerNameRef = useRef(null);
    const ownerEmailRef = useRef(null);
    const ownerAddressRef = useRef(null);
    const passwordRef = useRef(null);
    const confirmPasswordRef = useRef(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
    };

    const validateForm = () => {
        const newErrors = {};

        // Store name validation (3-100 chars)
        if (formData.name.length < 3 || formData.name.length > 100) {
            newErrors.name = 'Store name must be between 3 and 100 characters';
        }

        // Email validation (basic)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Enter a valid store email address';
        }

        // Address validation (max 400 chars)
        if (formData.address.length > 400 || formData.address.length === 0) {
            newErrors.address = 'Address is required and cannot exceed 400 characters';
        }

        // Owner name validation (20-60 chars)
        if (formData.ownerName.length < 20 || formData.ownerName.length > 60) {
            newErrors.ownerName = 'Owner name must be between 20 and 60 characters';
        }

        // Owner email validation
        if (!emailRegex.test(formData.ownerEmail)) {
            newErrors.ownerEmail = 'Enter a valid owner email address';
        }

        // Owner address validation
        if (formData.ownerAddress.length > 400 || formData.ownerAddress.length === 0) {
            newErrors.ownerAddress = 'Owner address is required and cannot exceed 400 characters';
        }

        // Password validation (8-16 chars, 1 uppercase, 1 special char)
        const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
        if (!passwordRegex.test(formData.password)) {
            newErrors.password = 'Password must be 8-16 characters with at least one uppercase and one special character';
        }

        // Confirm password
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            const first = ['name', 'email', 'address', 'ownerName', 'ownerEmail', 'ownerAddress', 'password', 'confirmPassword'].find((k) => validationErrors[k]);
            if (first) {
                const map = {
                    name: nameRef,
                    email: emailRef,
                    address: addressRef,
                    ownerName: ownerNameRef,
                    ownerEmail: ownerEmailRef,
                    ownerAddress: ownerAddressRef,
                    password: passwordRef,
                    confirmPassword: confirmPasswordRef
                };
                map[first]?.current?.focus();
                map[first]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/admin/stores`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storeName: formData.name,
                    storeEmail: formData.email,
                    storeAddress: formData.address,
                    ownerName: formData.ownerName,
                    ownerEmail: formData.ownerEmail,
                    ownerAddress: formData.ownerAddress,
                    password: formData.password,
                }),
            });
            let data = {};
            try { data = await res.json(); } catch { }
            if (!res.ok) {
                if (res.status === 409) {
                    setErrors((prev) => ({ ...prev, email: 'Store or owner email already registered' }));
                    emailRef?.current?.focus();
                    emailRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    return;
                }
                if (res.status === 403) {
                    throw new Error('You do not have permission to add stores');
                }
                if (res.status === 400 && data && data.errors) {
                    setErrors(data.errors);
                    return;
                }
                throw new Error((data && data.message) || 'Store creation failed');
            }

            setSuccess('Store and owner created successfully!');
            setFormData({
                name: '',
                email: '',
                address: '',
                ownerName: '',
                ownerEmail: '',
                ownerAddress: '',
                password: '',
                confirmPassword: ''
            });
            setTimeout(() => navigate('/admin/dashboard'), 1500);
        } catch (err) {
            console.error('Add store error:', err);
            setErrors((prev) => ({ ...prev, general: err.message }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-violet-100 to-violet-200 flex items-center justify-center p-4">
            {success && (
                <Toast message={success} onClose={() => setSuccess('')} />
            )}
            <div className="max-w-2xl w-full">
                <div className="bg-gradient-to-br from-white via-violet-50 to-white rounded-lg shadow-md p-8 border border-violet-200">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-violet-600 mb-2">Add Store Form</h1>
                        <p className="text-gray-600">Create a new store and owner account</p>
                    </div>

                    {/* General Error */}
                    {errors.general && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-600 text-sm">{errors.general}</p>
                        </div>
                    )}

                    {/* Add Store Form */}
                    <form onSubmit={handleSubmit}>
                        {/* Store Information Section */}
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Store Information</h2>

                            {/* Store Name */}
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-semibold mb-2">Store Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    ref={nameRef}
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Enter store name (3-100 characters)"
                                    required
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            {/* Store Email */}
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-semibold mb-2">Store Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    ref={emailRef}
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Enter store email"
                                    required
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>

                            {/* Store Address */}
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-semibold mb-2">Store Address *</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    ref={addressRef}
                                    rows="2"
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Enter store address (max 400 characters)"
                                    required
                                />
                                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                                <p className="text-gray-500 text-xs mt-1">{formData.address.length}/400 characters</p>
                            </div>
                        </div>

                        {/* Owner Information Section */}
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Owner Information</h2>

                            {/* Owner Name */}
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-semibold mb-2">Owner Full Name *</label>
                                <input
                                    type="text"
                                    name="ownerName"
                                    value={formData.ownerName}
                                    onChange={handleChange}
                                    ref={ownerNameRef}
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 ${errors.ownerName ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Enter owner full name (20-60 characters)"
                                    required
                                />
                                {errors.ownerName && <p className="text-red-500 text-xs mt-1">{errors.ownerName}</p>}
                            </div>

                            {/* Owner Email */}
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-semibold mb-2">Owner Email *</label>
                                <input
                                    type="email"
                                    name="ownerEmail"
                                    value={formData.ownerEmail}
                                    onChange={handleChange}
                                    ref={ownerEmailRef}
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 ${errors.ownerEmail ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Enter owner email"
                                    required
                                />
                                {errors.ownerEmail && <p className="text-red-500 text-xs mt-1">{errors.ownerEmail}</p>}
                            </div>

                            {/* Owner Address */}
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-semibold mb-2">Owner Address *</label>
                                <textarea
                                    name="ownerAddress"
                                    value={formData.ownerAddress}
                                    onChange={handleChange}
                                    ref={ownerAddressRef}
                                    rows="2"
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 ${errors.ownerAddress ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Enter owner address (max 400 characters)"
                                    required
                                />
                                {errors.ownerAddress && <p className="text-red-500 text-xs mt-1">{errors.ownerAddress}</p>}
                                <p className="text-gray-500 text-xs mt-1">{formData.ownerAddress.length}/400 characters</p>
                            </div>

                            {/* Password */}
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-semibold mb-2">Owner Password *</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    ref={passwordRef}
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="8-16 chars, 1 uppercase, 1 special char"
                                    required
                                />
                                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                            </div>

                            {/* Confirm Password */}
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-semibold mb-2">Confirm Password *</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    ref={confirmPasswordRef}
                                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Re-enter password"
                                    required
                                />
                                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/dashboard')}
                                className="flex-1 bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 transition duration-200 font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-violet-600 text-white py-2 rounded-md hover:bg-violet-700 transition duration-200 font-semibold disabled:bg-violet-300"
                            >
                                {loading ? 'Creating Store...' : 'Add Store'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddStore;
