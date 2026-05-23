import { Router } from 'express';

const router = Router();
export const marathonState = { started: false };

router.get('/status', (_req, res) => {
  res.json({ started: marathonState.started });
});

router.post('/start', (_req, res) => {
  marathonState.started = true;
  res.json({ started: marathonState.started });
});

export default router;
