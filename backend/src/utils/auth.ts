import jwt from 'jsonwebtoken'; import {env} from '../config/env';
export function signToken(id:string,role:string){return jwt.sign({sub:id,role},env.JWT_SECRET,{expiresIn:'7d'});}
export function verifyToken(token:string){return jwt.verify(token,env.JWT_SECRET) as {sub:string,role:string};}
