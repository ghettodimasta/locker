import urlJoin from 'url-join';
// eslint-disable-next-line no-unused-vars
import React, {Component} from "react";
import axios from 'axios';


const instance = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 1000,
  headers: {'Content-Type': 'application/json'},
  withCredentials: true,
});


export async function authUser(email, password) {
  return await instance.post('/api/v1/auth', {email: email, password: password}).catch(function (error) {
    return error.toJSON()
  });;
}

export async function getCurrentUser() {
  return await instance.get('/api/v1/user/current').catch(function (error) {
    return error.toJSON()
  });;
}

export async function logout() {
  return await instance.post('/api/v1/logout').catch(function (error) {
    return error.toJSON()
  });;
}

export async function getStorages(city) {
  return await instance.get(`/api/v1/storage-poi?city=${city}`).catch(function (error) {
    return error.toJSON()
  });;
}

export async function getStorage(id) {
  return await instance.get(`/api/v1/storage-poi/${id}`).catch(function (error) {
    return error.toJSON()
  });;
}

export async function orderStorage(data) {
  return await instance.post(`/api/v1/order`, data).catch(function (error) {
    return error.toJSON()
  });
}

export async function getOrders() {
  return await instance.get(`/api/v1/order`).catch(function (error) {
    return error.toJSON()
  });;
}

export async function getOrder(id) {
  return await instance.get(`/api/v1/order/${id}`).catch(function (error) {
    return error.toJSON()
  });;
}

export async function payOrder(id) {
  return await instance.get(`/api/v1/order/${id}/pay`).catch(function (error) {
    return error.toJSON()
  });;
}

export async function createUser(data) {
  return await instance.post(`/api/v1/user`, data).catch(function (error) {
    return error.toJSON()
  });
}

export async function activate(token) {
  return await instance.get(`/api/v1/activate/${token}`).catch(function (error) {
    return error.toJSON()
  });
}

export async function getCities() {
  return await instance.get(`/api/v1/storage-poi/cities`).catch(function (error) {
    return error.toJSON()
  });
}

export default instance;