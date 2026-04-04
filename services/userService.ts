import { AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import axiosInstance from './axiosInstance';
import { RNFile } from './uploadService';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export async function getUserProfileService() {
  try {
    const { data } = await axiosInstance.get('/api/users/profile');
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('getUserProfile error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function updateUserProfileService(profileData: Record<string, unknown>) {
  try {
    const { data } = await axiosInstance.put('/api/users/profile', profileData);
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('updateUserProfile error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function uploadProfilePictureService(file: RNFile) {
  try {
    const token = await SecureStore.getItemAsync('accessToken');

    const formData = new FormData();
    formData.append('profilePicture', file as unknown as Blob);

    // Use fetch directly so React Native sets Content-Type with the correct boundary.
    // Axios overrides the header and strips the boundary, causing a 500 on the server.
    const response = await fetch(`${API_URL}/api/users/profile-picture`, {
      method: 'PATCH',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message ?? 'Upload failed');
    return data;
  } catch (error) {
    console.error('uploadProfilePicture error:', error);
    throw error;
  }
}

export async function deleteProfilePictureService() {
  try {
    const { data } = await axiosInstance.delete('/api/users/profile-picture');
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error(
      'deleteProfilePicture error:',
      (err.response?.data as Record<string, unknown>) ?? err.message,
    );
    throw error;
  }
}

export async function getAddressesService() {
  try {
    const { data } = await axiosInstance.get('/api/users/addresses');
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('getAddresses error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function addAddressService(addressData: Record<string, unknown>) {
  try {
    const { data } = await axiosInstance.post('/api/users/addresses', addressData);
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('addAddress error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function updateAddressService(addressId: string, addressData: Record<string, unknown>) {
  try {
    const { data } = await axiosInstance.put(`/api/users/addresses/${addressId}`, addressData);
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('updateAddress error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function deleteAddressService(addressId: string) {
  try {
    const { data } = await axiosInstance.delete(`/api/users/addresses/${addressId}`);
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('deleteAddress error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function setDefaultAddressService(addressId: string) {
  try {
    const { data } = await axiosInstance.patch(`/api/users/addresses/${addressId}/default`);
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('setDefaultAddress error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}

export async function deactivateAccountService() {
  try {
    const { data } = await axiosInstance.delete('/api/users/account');
    return data;
  } catch (error) {
    const err = error as AxiosError;
    console.error('deactivateAccount error:', (err.response?.data as Record<string, unknown>) ?? err.message);
    throw error;
  }
}
