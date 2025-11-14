import { ChatClient, ChatOptions } from 'agora-chat-sdk';
import { agoraConfig } from '@/config/agora.config';

type Message = {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: number;
  isRead: boolean;
};

type MessageCallback = (message: Message) => void;

export class AgoraChatService {
  private static instance: AgoraChatService;
  private client: any;
  private messageCallbacks: MessageCallback[] = [];
  private currentUser: { userId: string; username: string } | null = null;

  private constructor() {
    // Initialize Agora Chat Client
    const options: ChatOptions = {
      appKey: agoraConfig.appId,
      autoLogin: false,
      useOwnUploadFunc: true,
    };

    this.client = ChatClient.getInstance(options);
    this.setupEventListeners();
  }

  public static getInstance(): AgoraChatService {
    if (!AgoraChatService.instance) {
      AgoraChatService.instance = new AgoraChatService();
    }
    return AgoraChatService.instance;
  }

  private setupEventListeners() {
    // Listen for incoming messages
    this.client.on('message', (msg: any) => {
      const message: Message = {
        id: msg.id,
        text: msg.msg,
        senderId: msg.from,
        senderName: msg.ext?.nickname || msg.from,
        timestamp: msg.time,
        isRead: false,
      };
      this.notifyMessageReceived(message);
    });

    // Handle connection state changes
    this.client.on('connectionStateChanged', (state: string) => {
      console.log('Connection state changed:', state);
    });
  }

  public async login(userId: string, username: string, token?: string): Promise<void> {
    try {
      await this.client.open({
        user: userId,
        agoraToken: token,
      });
      
      this.currentUser = { userId, username };
      console.log('Logged in successfully as', username);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  public async logout(): Promise<void> {
    try {
      await this.client.close();
      this.currentUser = null;
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  public async sendMessage(roomId: string, text: string): Promise<void> {
    if (!this.currentUser) {
      throw new Error('User not logged in');
    }

    try {
      await this.client.sendTextMessage({
        chatType: 'singleChat', // or 'groupChat' for group messages
        to: roomId, // The target user ID or group ID
        msg: text,
        ext: {
          nickname: this.currentUser.username,
          timestamp: Date.now(),
        },
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  public async joinRoom(roomId: string): Promise<void> {
    try {
      await this.client.joinGroup({
        groupId: roomId,
      });
      console.log(`Joined room: ${roomId}`);
    } catch (error) {
      console.error(`Failed to join room ${roomId}:`, error);
      throw error;
    }
  }

  public async leaveRoom(roomId: string): Promise<void> {
    try {
      await this.client.leaveGroup({
        groupId: roomId,
      });
      console.log(`Left room: ${roomId}`);
    } catch (error) {
      console.error(`Failed to leave room ${roomId}:`, error);
      throw error;
    }
  }

  public onMessageReceived(callback: MessageCallback): () => void {
    this.messageCallbacks.push(callback);
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    };
  }

  private notifyMessageReceived(message: Message): void {
    this.messageCallbacks.forEach(callback => callback(message));
  }

  public getCurrentUser() {
    return this.currentUser;
  }
}

export const chatService = AgoraChatService.getInstance();
