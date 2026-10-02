import { getHomeSettings } from '../../../lib/siteSettings';
import HomepageSettingsForms from '../../../components/HomepageSettingsForms';

export default async function HomepageAdmin(){
  const settings=await getHomeSettings();
  return <><div className="admin-topbar"><div><h1>الصفحة الرئيسية</h1><p className="small">تحكم بفيديو الواجهة والصور الترويجية من هنا بدون تعديل الكود.</p></div></div><HomepageSettingsForms settings={settings}/></>;
}
