import WebSocket from 'ws';

export const WS_SERVER = 'ws://localhost:8080';

export const websocket: { connection: WebSocket} = { connection: undefined };

export const login = (userName: string, accessToken: string) => {
    websocket.connection =  new WebSocket(WS_SERVER, {
        headers: { userName, accessToken }
    });
}

export const getConnection = () => {
    return websocket.connection;
}

export const closeConnection = () => {
    if (!!websocket.connection && websocket.connection.readyState == WebSocket.OPEN) {
        websocket.connection.close();
    }
}

export const sendMessage = (fromUser: string, toUser: string, payload: string) => {
    const data = { fromUser, toUser, payload };
    getConnection().send(JSON.stringify(data));
}