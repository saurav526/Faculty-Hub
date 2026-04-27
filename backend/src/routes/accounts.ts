import { Router } from 'express';
import {
  linkedIds,
  listAccounts,
  getAccount,
  updateAccount,
  deleteAccount,
} from '../controllers/accountController';
import { requireAdmin, requireAuth } from '../middleware/auth';

const router = Router();

router.get('/linked-ids', linkedIds);
router.get('/', requireAdmin, listAccounts);
router.get('/:email', requireAuth, getAccount);
router.put('/:email', requireAuth, updateAccount);
router.delete('/:email', requireAuth, deleteAccount);

export default router;
