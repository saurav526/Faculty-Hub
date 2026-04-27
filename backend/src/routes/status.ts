import { Router } from 'express';
import { listStatus, setStatus, clearStatus, clearAllStatus } from '../controllers/statusController';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', listStatus);
router.put('/:facultyId', requireAuth, setStatus);
router.delete('/all', requireAdmin, clearAllStatus);
router.delete('/:facultyId', requireAuth, clearStatus);

export default router;
