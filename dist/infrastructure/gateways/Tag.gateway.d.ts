import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'socket.io';
export declare class TagGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    handleConnection(client: any): void;
    handleDisconnect(client: any): void;
    broadcastUpdate(tagId: string, value: any): void;
}
