import axios from 'axios';
import WebSocket from 'ws';

export const SERVER_URL = 'http://localhost:8080/api';
export const WS_SERVER = 'ws://localhost:8080';

export const register = (payload: any) => {
    return axios.post(`${SERVER_URL}/register`, payload);
}

export const login = (userName: string, accessToken: string) => {
    return new WebSocket(WS_SERVER, {
        headers: { userName, accessToken }
    });
}

export const getAllUser = async () => {
    return await (await axios.get(`${SERVER_URL}/users`)).data;
}