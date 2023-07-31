import axios from 'axios';

export const MANAGE_TASKS_API = axios.create({
  baseURL: 'https://localhost:44360/api/v1',
  timeout: 1000
});
