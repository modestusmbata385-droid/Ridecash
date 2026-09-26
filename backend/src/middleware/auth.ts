import {Request,Response,NextFunction} from 'express'; import {verifyToken} from '../utils/auth';
export interface AuthRequest extends Request { user?: {id:string,role:string} }
export function auth(req:AuthRequest,res:Response,next:NextFunction){try{const h=req.headers.authorization;if(!h?.startsWith('Bearer '))return res.status(401).json({error:'Unauthorized'});const p=verifyToken(h.slice(7));req.user={id:p.sub,role:p.role};next()}catch{return res.status(401).json({error:'Invalid token'})}}
export function role(...roles:string[]){return (req:AuthRequest,res:Response,next:NextFunction)=>{if(!req.user||!roles.includes(req.user.role))return res.status(403).json({error:'Forbidden'});next()}}
