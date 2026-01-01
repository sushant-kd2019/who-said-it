import { Room } from '../types/game';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface CreateRoomResponse {
  roomCode: string;
  oderId: string;
}

interface JoinRoomResponse {
  room: Room;
  oderId: string;
}

interface RejoinRoomResponse {
  room: Room;
  currentQuestion: string | null;
  oderId: string;
}

interface GetRoomResponse {
  room: Room;
  currentQuestion: string | null;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  async createRoom(hostName: string): Promise<CreateRoomResponse> {
    return this.request<CreateRoomResponse>('/api/rooms', {
      method: 'POST',
      body: JSON.stringify({ hostName }),
    });
  }

  async joinRoom(roomCode: string, playerName: string): Promise<JoinRoomResponse> {
    return this.request<JoinRoomResponse>(`/api/rooms/${roomCode}/join`, {
      method: 'POST',
      body: JSON.stringify({ playerName }),
    });
  }

  async rejoinRoom(roomCode: string, playerId: string): Promise<RejoinRoomResponse> {
    return this.request<RejoinRoomResponse>(`/api/rooms/${roomCode}/rejoin`, {
      method: 'POST',
      body: JSON.stringify({ playerId }),
    });
  }

  async getRoom(roomCode: string): Promise<GetRoomResponse> {
    return this.request<GetRoomResponse>(`/api/rooms/${roomCode}`);
  }

  async checkHealth(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health');
  }
}

export const api = new ApiService();

