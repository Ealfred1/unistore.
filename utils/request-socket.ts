// Global connection queue manager
const WebSocketQueue = {
  activeConnections: 0,
  maxConcurrent: 1,
  queue: [] as (() => Promise<void>)[],
  
  async add(connection: () => Promise<void>) {
    if (this.activeConnections >= this.maxConcurrent) {
      // Wait in queue
      await new Promise<void>(resolve => this.queue.push(resolve));
    }
    
    this.activeConnections++;
    try {
      await connection();
    } finally {
      this.activeConnections--;
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        next?.();
      }
    }
  }
};

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
  private connectionTimeout: NodeJS.Timeout | null = null;
  private connectionEstablished = false;
  private connectionPromise: Promise<void> | null = null;
  private backoffDelay = 1000; // Start with 1 second delay
  private maxBackoffDelay = 30000; // Max 30 seconds between retries

  private constructor() {}

  static getInstance(): RequestWebSocketManager {
    if (!RequestWebSocketManager.instance) {
      RequestWebSocketManager.instance = new RequestWebSocketManager();
    }
    return RequestWebSocketManager.instance;
  }

  async connect(): Promise<void> {
    // If already connected, return immediately
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log('Request WebSocket already connected');
      return;
    }

    // If there's an ongoing connection attempt, wait for it
    if (this.connectionPromise) {
      console.log('Waiting for existing connection attempt...');
      return this.connectionPromise;
    }

    if (!this.token) {
      console.error('No token available for request connection');
      return Promise.reject(new Error('No token available'));
    }

    // Queue this connection attempt
    return WebSocketQueue.add(async () => {
      try {
        this.connectionPromise = new Promise<void>((resolve, reject) => {
          this.isConnecting = true;
          console.log('Initiating Request WebSocket connection...');

          const protocol = process.env.NODE_ENV === 'development' ? 'ws' : 'wss';
          const baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'unistore-v2.onrender.com';
          const wsUrl = `${protocol}://${baseUrl.replace(/^https?:\/\/|^wss?:\/\//, '')}/ws/requests/?token=${this.token}`;

          console.log('Connecting to:', wsUrl);
          
          // Clean up existing connection if any
          this.cleanup();

          this.socket = new WebSocket(wsUrl);

          // Set connection timeout
          this.connectionTimeout = setTimeout(() => {
            if (!this.connectionEstablished) {
              console.log('Connection attempt timed out');
              this.socket?.close();
              reject(new Error('Connection timeout'));
            }
          }, 15000); // Increased timeout to 15s

          this.socket.onopen = () => {
            console.log('Request WebSocket connection established');
            this.connectionEstablished = true;
            this.isConnecting = false;
            this.reconnectAttempts = 0;
            
            if (this.connectionTimeout) {
              clearTimeout(this.connectionTimeout);
            }
            
            this.startHeartbeat();
            this.send('ping', {});
            resolve();
          };

          this.socket.onclose = (event) => {
            console.log(`Request WebSocket closed with code ${event.code}`);
            if (!this.connectionEstablished) {
              reject(new Error(`Connection closed with code ${event.code}`));
            }
            this.handleClose(event);
          };

          this.socket.onerror = (error) => {
            console.error('Request WebSocket error:', error);
            if (!this.connectionEstablished) {
              reject(error);
            }
          };

          this.socket.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              if (data.type !== 'pong') {
                console.log('Request WebSocket received:', data);
              }
              const handlers = this.messageHandlers.get(data.type);
              if (handlers) {
                handlers.forEach(handler => handler(data));
              }
            } catch (error) {
              console.error('Error processing message:', error);
            }
          };
        });

        await this.connectionPromise;
      } catch (error) {
        console.error('Connection failed:', error);
        this.isConnecting = false;
        throw error;
      } finally {
        this.connectionPromise = null;
      }
    });
  }

  private handleClose(event: CloseEvent) {
    this.connectionEstablished = false;
    this.isConnecting = false;
    this.disconnectHandler?.();
    
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
    }
    
    if (this.persistentConnection && 
        event.code === 1006 && 
        this.reconnectAttempts < this.maxReconnectAttempts) {
      console.log(`Scheduling reconnect attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts}`);
      this.handleReconnect();
    }
  }

  private handleReconnect() {
    const backoffDelay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`Attempting reconnect in ${backoffDelay}ms`);
    
    this.reconnectTimeout = setTimeout(async () => {
      this.reconnectAttempts++;
      try {
        await this.connect();
      } catch (error) {
        console.error('Reconnection attempt failed:', error);
      }
    }, backoffDelay);
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
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
    }
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