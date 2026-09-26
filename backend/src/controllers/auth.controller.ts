import {Request,Response} from 'express'; import * as s from '../services/auth.service';
export async function register(req:Request,res:Response){try{res.json(await s.register(req.body.phone,req.body.name,req.body.password,req.body.role||'PASSENGER'))}catch(e:any){res.status(400).json({error:e.message})}}
export async function login(req:Request,res:Response){try{res.json(await s.login(req.body.phone,req.body.password))}catch(e:any){res.status(401).json({error:e.message})}}
