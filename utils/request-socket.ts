export class RequestWebSocketManager {
  private static instance: RequestWebSocketManager | null = null;
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

  private constructor() {}

  static getInstance(): RequestWebSocketManager {
    if (!RequestWebSocketManager.instance) {
      RequestWebSocketManager.instance = new RequestWebSocketManager();
    }
    return RequestWebSocketManager.instance;
  }

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN || this.isConnecting) {
      console.log('Request WebSocket already connected or connecting');
      return;
    }

    if (!this.token) {
      console.log('No token available for request connection');
      return;
    }

    this.isConnecting = true;

    try {
      const protocol = process.env.NODE_ENV === 'development' ? 'ws' : 'wss';
      const baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'unistore-v2.onrender.com';
      const wsUrl = `${protocol}://${baseUrl.replace(/^https?:\/\/|^wss?:\/\//, '')}/ws/requests/?token=${this.token}`;

      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('Request WebSocket connection established');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        
        // Process queued messages
        while (this.messageQueue.length > 0) {
          const message = this.messageQueue.shift();
          if (message) {
            this.send(message.action, message.data);
          }
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Request WebSocket received:', data);
          const handlers = this.messageHandlers.get(data.type);
          if (handlers) {
            handlers.forEach(handler => handler(data));
          }
        } catch (error) {
          console.error('Error processing request message:', error);
        }
      };

      this.socket.onclose = (event) => {
        console.log('Request WebSocket closed with code:', event.code);
        this.cleanup();
        this.disconnectHandler?.();
        
        if (this.persistentConnection && event.code !== 1000 && event.code !== 1001) {
          this.handleReconnect();
        }
      };

      this.socket.onerror = (error) => {
        console.error('Request WebSocket error:', error);
      };

    } catch (error) {
      console.error('Request WebSocket connection error:', error);
      this.isConnecting = false;
      if (this.persistentConnection) {
        this.handleReconnect();
      }
    }
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send('ping', {});
      } else {
        clearInterval(this.heartbeatInterval);
      }
    }, 30000);
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      this.reconnectTimeout = setTimeout(() => {
        this.connect();
      }, delay);
    }
  }

  updateToken(token: string) {
    if (this.token !== token) {
      this.token = token;
      if (!this.isConnected()) {
        this.connect();
      }
    }
  }

  setPersistentConnection(persist: boolean) {
    this.persistentConnection = persist;
  }

  onDisconnect(handler: () => void) {
    this.disconnectHandler = handler;
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
      console.error('Error sending request message:', error);
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

  cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
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

  disconnect() {
    this.cleanup();
    this.messageHandlers.clear();
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
} 