import ws from 'ws';

export class ConnectionManager {
    connections: { [key:string]: ws; } = {};

    constructor() {};

    addConnection(connectionId: string, connection: ws) {
        if (this.connections[connectionId] instanceof ws) {
            this.connections[connectionId].close();
        }

        this.connections[connectionId] = connection;
    }

    removeConnection(connectionId: string) {
        if (this.connections[connectionId] instanceof ws) {
            this.connections[connectionId].close();
        }

        delete this.connections[connectionId];
    }

    sendMessage(connectionId: string, message: any) {
        if (this.connections[connectionId] instanceof ws) {
            this.connections[connectionId].send(message);
            return true;
        } else {
            console.warn(`Can't send message: ${message} to client ${connectionId}`);
            return false;
        }
    }
}