import urlJoin from 'url-join';
// eslint-disable-next-line no-unused-vars
import React, {Component} from "react";
import axios from 'axios';


const instance = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 1000,
  headers: {'Content-Type' : 'application/json'},
  withCredentials: true,
});


export async function authUser(email, password) {
  return await instance.post('/api/v1/auth', {email: email, password: password});
}

export async function getCurrentUser() {
  return await instance.get('/api/v1/user/current');
}

export async function logout() {
  return await instance.post('/api/v1/logout');
}

export async function getStorages(city) {
  return await instance.get(`/api/v1/storage-poi?city=${city}`);
}

export async function getStorage(id) {
  return await instance.get(`/api/v1/storage-poi/${id}`);
}

export async function orderStorage(data){
  return await instance.post(`/api/v1/order`, data);
}

export default instance;