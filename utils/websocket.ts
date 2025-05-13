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
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private connectionTimeout: NodeJS.Timeout | null = null;
  private backoffDelay = 1000; // Start with 1 second delay
  private maxBackoffDelay = 30000; // Max 30 seconds between retries

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

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    if (!this.token) return;
    this.isConnecting = true;

    try {
      const protocol = process.env.NODE_ENV === 'development' ? 'ws' : 'wss';
      const baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'unistore-v2.onrender.com';
      const wsUrl = `${protocol}://${baseUrl.replace(/^https?:\/\/|^wss?:\/\//, '')}/ws/messaging/?token=${this.token}`;

      this.socket = new WebSocket(wsUrl);

      // Clear any existing timeouts
      if (this.connectionTimeout) {
        clearTimeout(this.connectionTimeout);
      }
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
      }

      this.socket.onopen = () => {
        console.log('WebSocket connection established');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.backoffDelay = 1000; // Reset backoff delay on successful connection
        this.startHeartbeat();
        this.flushMessageQueue(); // Send any queued messages
        this.send('ping', {}); // Initial ping
      };

      this.socket.onclose = (event) => {
        console.log(`WebSocket closed with code ${event.code}`);
        this.isConnecting = false;
        this.disconnectHandler?.();
        
        if (this.persistentConnection && this.reconnectAttempts < this.maxReconnectAttempts) {
          console.log(`Attempting reconnect ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts}`);
          this.reconnectTimeout = setTimeout(() => {
            this.reconnectAttempts++;
            this.connect();
          }, this.backoffDelay);
          
          // Exponential backoff with max delay
          this.backoffDelay = Math.min(this.backoffDelay * 2, this.maxBackoffDelay);
        }
      };

      // Increase timeout for initial connection
      this.connectionTimeout = setTimeout(() => {
        if (this.socket?.readyState !== WebSocket.OPEN) {
          console.log('Connection timeout, closing socket');
          this.socket?.close();
          this.isConnecting = false;
          this.reconnectAttempts = 0;
        }
      }, 10000);

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type !== 'pong') { // Don't log heartbeat responses
            console.log('WebSocket received message:', data);
          }
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
      };

    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.isConnecting = false;
      this.disconnectHandler?.();
      
      if (this.persistentConnection && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectTimeout = setTimeout(() => {
          this.reconnectAttempts++;
          this.connect();
        }, this.backoffDelay);
      }
    }
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.send('ping', {});
      }
    }, 30000);
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message.action, message.data);
      }
    }
  }

  send(action: string, data: any) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
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
      this.messageHandlers.delete(type);
    } else {
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
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
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
    this.disconnect();
    this.messageHandlers.clear();
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}