import { Router, Request, Response } from 'express';
import * as roomService from '../services/roomService';
import * as gameService from '../services/gameService';

const router = Router();

// Create a new room
router.post('/', async (req: Request, res: Response) => {
  try {
    const { hostName } = req.body;
    
    if (!hostName || typeof hostName !== 'string') {
      return res.status(400).json({ error: 'Host name is required' });
    }
    
    if (hostName.trim().length < 2 || hostName.trim().length > 20) {
      return res.status(400).json({ error: 'Name must be 2-20 characters' });
    }
    
    const { room, oderId } = await roomService.createRoom(hostName.trim());
    
    return res.status(201).json({
      roomCode: room.roomCode,
      oderId,
    });
  } catch (error) {
    console.error('Create room error:', error);
    return res.status(500).json({ error: 'Failed to create room' });
  }
});

// Get room by code
router.get('/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    
    const room = await roomService.getRoomByCode(code);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    const roomResponse = roomService.toRoomResponse(room);
    const currentQuestion = gameService.getCurrentQuestion(room);
    
    return res.json({ 
      room: roomResponse,
      currentQuestion,
    });
  } catch (error) {
    console.error('Get room error:', error);
    return res.status(500).json({ error: 'Failed to get room' });
  }
});

// Join a room
router.post('/:code/join', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const { playerName } = req.body;
    
    if (!playerName || typeof playerName !== 'string') {
      return res.status(400).json({ error: 'Player name is required' });
    }
    
    if (playerName.trim().length < 2 || playerName.trim().length > 20) {
      return res.status(400).json({ error: 'Name must be 2-20 characters' });
    }
    
    const { room, oderId } = await roomService.joinRoom(code, playerName.trim());
    const roomResponse = roomService.toRoomResponse(room);
    
    return res.status(200).json({
      room: roomResponse,
      oderId,
    });
  } catch (error) {
    const message = (error as Error).message;
    console.error('Join room error:', message);
    
    if (message === 'Room not found') {
      return res.status(404).json({ error: message });
    }
    if (message === 'Game has already started') {
      return res.status(400).json({ error: message });
    }
    if (message.includes('already exists')) {
      return res.status(400).json({ error: message });
    }
    
    return res.status(500).json({ error: 'Failed to join room' });
  }
});

// Rejoin a room (session recovery)
router.post('/:code/rejoin', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const { playerId } = req.body;
    
    if (!playerId) {
      return res.status(400).json({ error: 'Player ID is required' });
    }
    
    const room = await roomService.rejoinRoom(code, playerId);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found or player not in room' });
    }
    
    const roomResponse = roomService.toRoomResponse(room);
    const currentQuestion = gameService.getCurrentQuestion(room);
    
    return res.json({
      room: roomResponse,
      currentQuestion,
      oderId: playerId,
    });
  } catch (error) {
    console.error('Rejoin room error:', error);
    return res.status(500).json({ error: 'Failed to rejoin room' });
  }
});

export default router;

