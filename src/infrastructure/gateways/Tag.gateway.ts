import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
export class TagGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TagGateway.name);

  handleConnection(client: any) {
    this.logger.log(`Cliente SCADA conectado: ${client.id}`);
  }

  handleDisconnect(client: any) {
    this.logger.log(`Cliente SCADA desconectado: ${client.id}`);
  }

  // Método que usaremos desde el servicio para emitir los valores
  broadcastUpdate(tagId: string, value: any) {
    this.server.emit('tagValueUpdate', { id: tagId, value });
  }
}
