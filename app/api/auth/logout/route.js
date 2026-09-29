import { NextResponse } from 'next/server';
import { destroySession } from '../../../../lib/auth';
import { sameOriginOrThrow } from '../../../../lib/security';
export async function POST(request){try{sameOriginOrThrow(request);}catch{return NextResponse.json({error:'Forbidden'},{status:403})}await destroySession();return NextResponse.redirect(new URL('/',request.url),303)}
