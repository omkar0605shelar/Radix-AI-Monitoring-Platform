import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { AIService } from '../services/aiService.js';

const aiService = new AIService();

export const explainEndpoint = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { endpointId } = req.params;
  
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const explanation = await aiService.explainEndpoint(endpointId);
    res.json(explanation);
  } catch (error) {
    next(error);
  }
};

export const auditEndpoint = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { endpointId } = req.params;
  
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const auditResult = await aiService.auditEndpoint(endpointId);
    res.json(auditResult);
  } catch (error) {
    next(error);
  }
};
