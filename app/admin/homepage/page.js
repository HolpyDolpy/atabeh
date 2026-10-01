import AdminImagePicker from '../../../components/AdminImagePicker';
import { getHomeSettings } from '../../../lib/siteSettings';

export default async function HomepageAdmin(){
  const s=await getHomeSettings();
  return <>
    <div className="admin-topbar"><div><h1>الصفحة الرئيسية</h1><p className="small">تحكم بفيديو الواجهة والصور الترويجية من هنا بدون تعديل الكود.</p></div></div>
    <div className="admin-card-v6">
      <h2>فيديو الواجهة الرئيسية</h2>
      <form action="/api/admin/homepage" method="post">
        <input type="hidden" name="section" value="hero"/>
        <div className="field"><label>رابط / مسار الفيديو MP4</label><input name="heroVideo" defaultValue={s.heroVideo} placeholder="/videos/hero-loop.mp4 أو https://.../video.mp4" required/></div>
        <AdminImagePicker name="heroPoster" label="صورة الفيديو قبل التشغيل / عند تعذر الفيديو" defaultValue={s.heroPoster}/>
        <button className="btn btn-primary" type="submit">حفظ الفيديو</button>
      </form>
    </div>
    <div className="admin-card-v6">
      <h2>صور الصفحة الرئيسية</h2>
      <p className="small">يمكنك رفع الصورة من الجهاز أو التقاط صورة مباشرة من الهاتف.</p>
      <form action="/api/admin/homepage" method="post">
        <input type="hidden" name="section" value="promo"/>
        <div className="admin-home-grid">
          <div className="admin-home-panel"><h3>الصورة الأولى</h3><AdminImagePicker name="promoImage1" label="الصورة" defaultValue={s.promoImage1}/><div className="field"><label>العنوان</label><input name="promoTitle1" defaultValue={s.promoTitle1}/></div><div className="field"><label>الوصف</label><textarea name="promoText1" rows="3" defaultValue={s.promoText1}/></div><div className="field"><label>الرابط</label><input name="promoLink1" defaultValue={s.promoLink1}/></div></div>
          <div className="admin-home-panel"><h3>الصورة الثانية</h3><AdminImagePicker name="promoImage2" label="الصورة" defaultValue={s.promoImage2}/><div className="field"><label>العنوان</label><input name="promoTitle2" defaultValue={s.promoTitle2}/></div><div className="field"><label>الوصف</label><textarea name="promoText2" rows="3" defaultValue={s.promoText2}/></div><div className="field"><label>الرابط</label><input name="promoLink2" defaultValue={s.promoLink2}/></div></div>
        </div>
        <button className="btn btn-primary" type="submit">حفظ صور الصفحة الرئيسية</button>
      </form>
    </div>
  </>;
}
