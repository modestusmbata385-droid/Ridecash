import {Response} from 'express'; import {AuthRequest} from '../middleware/auth'; import * as s from '../services/driver.service';
export async function online(req:AuthRequest,res:Response){try{res.json(await s.setOnline(req.user!.id,!!req.body.online))}catch(e:any){res.status(400).json({error:e.message})}}
export async function location(req:AuthRequest,res:Response){try{res.json(await s.location(req.user!.id,Number(req.body.lat),Number(req.body.lng)))}catch(e:any){res.status(400).json({error:e.message})}}
