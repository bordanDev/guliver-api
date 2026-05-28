import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';

export interface OccupancyUpdatePayload {
  devices: any[];
  timestamp: string;
}

@Injectable()
export class SseService {
  private clients: Subject<MessageEvent>[] = [];

  /**
   * Registers a new SSE client and returns an Observable stream.
   * The client will receive all future occupancy updates.
   */
  addClient(): Observable<MessageEvent> {
    const client = new Subject<MessageEvent>();
    this.clients.push(client);

    // Clean up when client disconnects (unsubscribes)
    client.subscribe({
      complete: () => {
        this.removeClient(client);
      },
    });

    return client.asObservable();
  }

  /**
   * Broadcasts occupancy update to all connected SSE clients.
   */
  emitOccupancyUpdate(data: OccupancyUpdatePayload): void {
    const event = new MessageEvent('message', {
      data: JSON.stringify(data),
    });

    // Iterate over a copy to safely handle removals
    const activeClients = [...this.clients];
    for (const client of activeClients) {
      try {
        client.next(event);
      } catch {
        this.removeClient(client);
      }
    }
  }

  /**
   * Removes a disconnected client from the pool.
   */
  private removeClient(client: Subject<MessageEvent>): void {
    const index = this.clients.indexOf(client);
    if (index > -1) {
      this.clients.splice(index, 1);
    }
  }

  /**
   * Returns the number of currently connected SSE clients.
   */
  getClientCount(): number {
    return this.clients.length;
  }
}
