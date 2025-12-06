import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home.jsx';
import NotFound from '../pages/NotFound.jsx';
import Login from '../pages/auth/Login.jsx';
import Signup from '../pages/auth/Signup.jsx';
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import ManageUsers from '../pages/admin/ManageUsers.jsx';
import ManageStores from '../pages/admin/ManageStores.jsx';
import ViewUser from '../pages/admin/ViewUsers.jsx';
import StoreDetails from '../pages/admin/StoreDetails.jsx';
import AddUser from '../pages/admin/AddUser.jsx';
import AddStore from '../pages/admin/AddStore.jsx';
import Stores from '../pages/user/Stores.jsx';
import Profile from '../pages/user/Profile.jsx';
import OwnerDashboard from '../pages/storeOwner/OwnerDashboard.jsx';
import StoreProfile from '../pages/storeOwner/StoreProfile.jsx';
import PrivateRoute from './PrivateRoute.jsx';
import RoleBasedRoute from './RoleBasedRoute.jsx';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<PrivateRoute />}>
        <Route element={<RoleBasedRoute roles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/users/:userId" element={<ViewUser />} />
          <Route path="/admin/add-user" element={<AddUser />} />
          <Route path="/admin/stores" element={<ManageStores />} />
          <Route path="/admin/stores/:storeId" element={<StoreDetails />} />
          <Route path="/admin/add-store" element={<AddStore />} />
        </Route>

        <Route element={<RoleBasedRoute roles={["user"]} />}>
          <Route path="/user/stores" element={<Stores />} />
          <Route path="/user/profile" element={<Profile />} />
        </Route>

        <Route element={<RoleBasedRoute roles={["store_owner"]} />}>
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          <Route path="/owner/profile" element={<StoreProfile />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;

