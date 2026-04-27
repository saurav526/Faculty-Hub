import { Router } from 'express';
import { listFaculty, getFaculty } from '../controllers/facultyController';

const router = Router();

router.get('/', listFaculty);
router.get('/:id', getFaculty);

export default router;
