// utils/websocket.ts
export class WebSocketManager {
  private static instance: WebSocketManager | null = null;
  private socket: WebSocket | null = null;
  private messageHandlers: Map<string, ((data: any) => void)[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private messageQueue: Array<{action: string, data: any}> = [];
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private token: string | null = null;
  private persistentConnection = false;
  private disconnectHandler: (() => void) | null = null;
  private currentEndpoint: string | null = null;

  private constructor() {}

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  updateToken(token: string) {
    if (this.token !== token) {
      this.token = token;
      this.disconnect();
      this.connect();
    }
  }

  setPersistentConnection(persist: boolean) {
    this.persistentConnection = persist;
  }

  onDisconnect(handler: () => void) {
    this.disconnectHandler = handler;
  }

  connect(endpoint?: string) {
    if (this.socket?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    if (!this.token) return;
    this.isConnecting = true;

    try {
      const protocol = process.env.NODE_ENV === 'development' ? 'ws' : 'wss';
      const baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'unistore-v2.onrender.com';
      this.currentEndpoint = endpoint || 'ws/messaging/';
      const wsUrl = `${protocol}://${baseUrl.replace(/^https?:\/\/|^wss?:\/\//, '')}/${this.currentEndpoint}?token=${this.token}`;

      console.log('Connecting to WebSocket:', wsUrl);
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        // Send immediate ping to verify connection
        this.send('ping', {});
      };

      this.socket.onclose = () => {
        this.disconnectHandler?.();
        if (this.persistentConnection) {
          console.log(`Persistent connection closed, attempting reconnect to ${this.currentEndpoint}...`);
          setTimeout(() => this.connect(this.currentEndpoint), 1000);
        }
      };

      // Increase timeout for initial connection
      const connectionTimeout = setTimeout(() => {
        if (this.socket?.readyState !== WebSocket.OPEN) {
          console.log('Connection timeout, closing socket');
          this.socket?.close();
          this.isConnecting = false;
          this.reconnectAttempts = 0; // Reset attempts on timeout
        }
      }, 10000); // 10 seconds timeout

      // Add heartbeat mechanism
      let heartbeat: NodeJS.Timeout;
      const startHeartbeat = () => {
        heartbeat = setInterval(() => {
          if (this.socket?.readyState === WebSocket.OPEN) {
            this.send('ping', {});
          }
        }, 30000); // Send ping every 30 seconds
      };

      startHeartbeat();

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket received message:', data); // Log every message received
          const handlers = this.messageHandlers.get(data.type);
          if (handlers) {
            handlers.forEach(handler => handler(data));
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Don't close the socket here, let onclose handle it
      };

    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.disconnectHandler?.();
      if (this.persistentConnection) {
        setTimeout(() => this.connect(this.currentEndpoint), 1000);
      }
    }
  }

  send(action: string, data: any) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      // Queue message if socket isn't ready
      this.messageQueue.push({ action, data });
      this.connect();
      return;
    }

    try {
      this.socket.send(JSON.stringify({ action, ...data }));
    } catch (error) {
      console.error('Error sending message:', error);
      this.messageQueue.push({ action, data });  
    }
  }

  addMessageHandler(type: string, handler: (data: any) => void) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)?.push(handler);
  }

  removeMessageHandler(type: string, handler?: (data: any) => void) {
    if (!handler) {
      // If no specific handler provided, remove all handlers for this type
      this.messageHandlers.delete(type);
    } else {
      // Remove specific handler
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
        if (handlers.length === 0) {
          this.messageHandlers.delete(type);
        }
      }
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.messageQueue = [];
  }

  cleanup() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.messageQueue = [];
    this.messageHandlers.clear();
    this.currentEndpoint = null;
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}