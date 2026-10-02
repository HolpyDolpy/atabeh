import { handleUpload } from '@vercel/blob/client';
import { requireAdmin } from '../../../../../lib/auth';

export async function POST(request){
  if(!await requireAdmin()) return Response.json({error:'غير مصرح.'},{status:401});
  try{
    const body=await request.json();
    const json=await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async ()=>({
        allowedContentTypes:['video/mp4','video/webm','video/quicktime'],
        maximumSizeInBytes:250*1024*1024,
        addRandomSuffix:true,
        cacheControlMaxAge:60*60*24*30
      }),
      onUploadCompleted: async ()=>{}
    });
    return Response.json(json);
  }catch(e){
    return Response.json({error:e?.message||'تعذر رفع الفيديو.'},{status:400});
  }
}
