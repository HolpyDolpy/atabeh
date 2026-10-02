import { handleUpload } from '@vercel/blob/client';
import { requireAdmin } from '../../../../../lib/auth';

export async function POST(request){
  try{
    const body=await request.json();
    const json=await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async ()=>{
        if(!await requireAdmin()){
          throw new Error('غير مصرح. سجّل الدخول كمدير ثم حاول مرة أخرى.');
        }
        return {
          allowedContentTypes:['video/mp4','video/webm','video/quicktime'],
          maximumSizeInBytes:250*1024*1024,
          addRandomSuffix:true,
          cacheControlMaxAge:60*60*24*30
        };
      },
      // Blob calls this endpoint again from Vercel after the browser upload finishes.
      // Do not require the browser admin cookie here; handleUpload validates the callback.
      onUploadCompleted: async ()=>{}
    });
    return Response.json(json);
  }catch(e){
    console.error('Hero video upload error:',e);
    return Response.json({error:e?.message||'تعذر رفع الفيديو.'},{status:400});
  }
}
