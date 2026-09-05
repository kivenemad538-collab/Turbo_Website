const RAW_API = String(window.TURBO_API || '').trim();
const API_CONFIGURED = /^https:\/\//i.test(RAW_API) && !/YOUR-RAILWAY-DOMAIN/i.test(RAW_API);
const API = API_CONFIGURED ? RAW_API.replace(/\/$/,'') : '';
let token = localStorage.getItem('turbo_token') || '';
let pub = null, me = null;

const $ = s => document.querySelector(s);

const DEFAULT_RULE_GROUPS = [
  ['القوانين العامة',[
    'الاحترام واجب بين جميع اللاعبين. يمنع السب أو الإهانة أو العنصرية أو التحرش خارج إطار الرول بلاي.',
    'يمنع استغلال الثغرات أو الهاكات أو أي برنامج يعطي أفضلية غير عادلة، ويجب إبلاغ الإدارة عن أي ثغرة.',
    'يمنع الخروج عن الشخصية أثناء السيناريو. المشاكل الإدارية يتم حلها بعد انتهاء السيناريو.',
    'يمنع انتحال شخصية إداري أو شرطي أو مسعف أو أي رتبة رسمية بدون صلاحية داخل السيرفر.',
    'يمنع نشر الإعلانات أو روابط السيرفرات الأخرى أو بيع وشراء ممتلكات السيرفر بأموال حقيقية.',
    'يجب استخدام اسم وشخصية مناسبة للرول بلاي، وتجنب الأسماء الساخرة أو غير الواقعية.'
  ]],
  ['أساسيات الرول بلاي',[
    'RDM: يمنع قتل أو إيذاء لاعب بدون سبب أو سيناريو رول بلاي واضح ومبرر.',
    'VDM: يمنع استخدام المركبة كسلاح لدهس اللاعبين عمدًا بدون سبب رول بلاي منطقي.',
    'Meta Gaming: يمنع استخدام معلومات عرفتها من Discord أو بث أو صديق خارج اللعبة داخل شخصيتك.',
    'Power Gaming: يمنع فرض أفعال غير واقعية على لاعب آخر أو القيام بأشياء تتجاوز قدرة الشخصية الطبيعية.',
    'Fail RP: يجب الحفاظ على واقعية الشخصية والسيناريو وعدم التصرف بطريقة تفسد الرول بلاي.',
    'Fear RP / Value of Life: حافظ على حياة شخصيتك وتصرف بخوف منطقي عند وجود تهديد حقيقي ومباشر.',
    'NLR: بعد موت الشخصية لا تستخدم معلومات اللحظات التي أدت للموت للانتقام أو العودة فورًا لنفس السيناريو.',
    'Combat Logging: يمنع الخروج من السيرفر للهروب من مطاردة أو اعتقال أو سرقة أو أي سيناريو قائم.',
    'Revenge RP: يمنع الانتقام اعتمادًا على معلومات لا يفترض أن شخصيتك تتذكرها بعد انتهاء حياتها في السيناريو.',
    'يمنع إجبار لاعب على تصرف غير ممكن ميكانيكيًا أو منعه من فرصة منطقية للرد داخل السيناريو.'
  ]],
  ['السرقة والخطف',[
    'يجب وجود سبب وسيناريو واضح قبل الخطف أو السرقة، ويمنع الخطف العشوائي لمجرد التسلية.',
    'يجب إعطاء الطرف الآخر وقتًا كافيًا لفهم الأوامر والتفاعل معها قبل التصعيد.',
    'يمنع إجبار لاعب على تحويل ممتلكات لا تسمح أنظمة السيرفر بسرقتها أو استغلال القوائم لإجباره عليها.',
    'يمنع قتل الرهينة بدون تصعيد أو سبب قوي داخل السيناريو، ويجب إعطاء قيمة لحياة الرهائن.',
    'يمنع تكرار خطف أو استهداف نفس الشخص بصورة مزعجة أو بهدف المضايقة.'
  ]],
  ['المركبات والمطاردات',[
    'القيادة يجب أن تكون منطقية حسب نوع المركبة والطريق؛ يمنع القفزات والتصرفات غير الواقعية بلا ضرورة.',
    'بعد حادث قوي يجب تمثيل أثر الحادث على الشخصية والمركبة بدل الاستمرار كأن شيئًا لم يحدث.',
    'يمنع استخدام مركبات غير مناسبة لتجاوز تضاريس أو حواجز بصورة غير واقعية.',
    'أثناء المطاردة يمنع استغلال الجراج أو تغيير المركبة بطريقة فورية فقط للهروب من السيناريو.'
  ]],
  ['الشرطة و EMS',[
    'يجب احترام سيناريوهات الشرطة وEMS وعدم تعطيل عملهم بدون سبب رول بلاي.',
    'يمنع ادعاء الإصابة أو فقدان الوعي فقط للهروب من موقف أو عقوبة بدون سبب منطقي.',
    'عند إسعافك مثّل الإصابات بما يتناسب مع الحادث، ولا تعد مباشرة للقتال وكأنك لم تُصب.',
    'المعلومات التي يسمعها أو يراها لاعب أثناء فقدان الوعي لا تستخدم لاحقًا إذا لم يكن منطقيًا أن تتذكرها الشخصية.'
  ]],
  ['العصابات والإجرام',[
    'الخلافات بين العصابات يجب أن تبدأ بسبب رول بلاي واضح، وليس لمجرد البحث عن إطلاق نار.',
    'يمنع تحويل كل تفاعل إلى قتال؛ التفاوض والتهديد والتصعيد التدريجي جزء أساسي من الرول بلاي.',
    'يمنع التحالف المؤقت غير المنطقي فقط للحصول على أفضلية عددية في قتال قائم.',
    'احترم حدود السيناريو وأي قيود عددية أو تنظيمية تعلنها إدارة Turbo للأحداث والعصابات.'
  ]],
  ['المناطق الآمنة والتفاعل',[
    'يمنع بدء أعمال عدائية في المناطق التي تحددها الإدارة كمناطق آمنة إلا إذا نصت قواعد حدث على غير ذلك.',
    'لا تستخدم المنطقة الآمنة للهروب من سيناريو بدأ بالفعل خارجها.',
    'يمنع إزعاج اللاعبين عمدًا بالصوت أو المركبات أو تكرار تعطيل تفاعلهم بدون هدف رول بلاي.'
  ]],
  ['الصوت و Discord والبث',[
    'يمنع استخدام مكالمات خارجية لنقل معلومات أثناء اللعب إذا كانت شخصيتك لا تستطيع التواصل بها داخل اللعبة.',
    'مشاهدة بث لاعب للحصول على موقعه أو معلومات عنه ثم استخدامها داخل اللعبة تعتبر Stream Sniping وMeta Gaming.',
    'يجب عدم تشغيل أصوات مزعجة أو محتوى مخالف عبر المايك، واحترام قواعد قنوات Discord الرسمية.',
    'يمنع نقل أحداث السيناريو الحي إلى أشخاص خارج اللعبة بهدف التأثير على ما يحدث داخل السيرفر.'
  ]],
  ['الشخصية والهوية',[
    'التزم بشخصية واحدة متماسكة من حيث الاسم والخلفية وطريقة التصرف، ولا تغيّر شخصيتك فقط للهروب من نتائج سيناريو.',
    'يمنع التعرف على شخص مقنع بالكامل من صوته فقط إذا لم توجد قرائن منطقية داخل السيناريو.',
    'لا تستخدم أسماء مشاهير أو أسماء ساخرة أو أسماء تخالف أجواء الرول بلاي الجاد.',
    'أي معرفة تخص شخصية أخرى يجب أن تكون قد وصلت لشخصيتك داخل اللعبة بطريقة منطقية.'
  ]],
  ['الأسلحة والاشتباكات',[
    'إشهار السلاح أو إطلاق النار يجب أن يكون نتيجة تصعيد منطقي، وليس أول رد فعل على خلاف بسيط.',
    'يمنع إطلاق النار العشوائي أو إطلاق النار لمجرد جذب الانتباه.',
    'بعد إصابة خطيرة يجب تمثيل أثر الإصابة وعدم الاستمرار في القتال بصورة غير واقعية.',
    'لا تدخل اشتباكًا قائمًا لمجرد مساعدة صديق إذا لم تكن شخصيتك تعرف سبب الاشتباك أو طرفيه بشكل منطقي.',
    'يمنع استغلال زوايا أو أنيميشن أو أخطاء تمنحك قدرة إطلاق نار أو رؤية غير عادلة.'
  ]],
  ['الاقتصاد والممتلكات',[
    'يمنع نقل الأموال أو الممتلكات بين الشخصيات بهدف تجاوز نظام الاقتصاد أو العقوبات.',
    'يمنع الاحتيال خارج أنظمة السيرفر أو استغلال أخطاء البيع والشراء للحصول على مكاسب غير مشروعة.',
    'لا تستخدم مركبة أو منزل أو مخزن لاعب آخر بدون سبب أو صلاحية رول بلاي واضحة.',
    'أي اتفاق مالي كبير يتم داخل إطار الرول بلاي ويتحمل أطرافه نتائجه طالما لا يخالف أنظمة السيرفر.'
  ]],
  ['قواعد السيناريو والتصعيد',[
    'ابدأ السيناريو بالكلام والتفاعل عندما يكون ذلك ممكنًا، ولا تختصر كل خلاف في إطلاق نار.',
    'أعطِ الطرف الآخر فرصة معقولة للرد وفهم مطالبك قبل الانتقال لمرحلة أعلى من التصعيد.',
    'لا تُدخل معلومات أو أطرافًا جديدة في السيناريو من خارج اللعبة للحصول على أفضلية.',
    'عند انتهاء السيناريو لا تعاود فتحه فورًا بدون سبب جديد ومنطقي.',
    'قرارات الإدارة أثناء الأحداث الرسمية تكون ملزمة، ويجب الاعتراض عليها بعد انتهاء الحدث بالطريقة المخصصة.'
  ]],
  ['قواعد إضافية مهمة',[
    'يمنع AFK أثناء سيناريو قائم أو استخدامه للهروب من التفاعل.',
    'يمنع استغلال إعادة تشغيل السيرفر أو الرستارت للهروب من نتائج سيناريو أو تكرار مكاسب.',
    'يمنع استخدام Emotes أو Animations لاختراق الجدران أو إخفاء الشخصية أو الحصول على أفضلية.',
    'إذا فقدت الاتصال أثناء سيناريو، ارجع بأسرع وقت وأكمل السيناريو أو تواصل مع الإدارة عند وجود مشكلة حقيقية.',
    'القواعد الخاصة بالأحداث أو الوظائف أو العصابات التي تعلنها الإدارة تعتبر مكملة لهذه القوانين.'
  ]]
];
function renderRules(custom=[]){
  const groups=[...DEFAULT_RULE_GROUPS];
  if(custom && custom.length) groups.push(['قوانين إضافية من الإدارة',custom]);
  let n=1;
  $('#rulesList').innerHTML=groups.map(([title,rules])=>`<section class="rule-group"><div class="rule-group-title"><span>${String(n).padStart(2,'0')}</span><h3>${esc(title)}</h3></div><div class="rule-group-items">${rules.map(r=>`<div class="rule"><b>${String(n++).padStart(2,'0')}</b><span>${esc(r)}</span></div>`).join('')}</div></section>`).join('');
}

const esc = s => String(s ?? '').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2800)}
function showSetup(){const b=$('#setupBanner');b.classList.remove('hidden');b.innerHTML='⚠️ تسجيل Discord غير مربوط لسه. افتح <b>config.js</b> وحط رابط Railway الحقيقي مكان YOUR-RAILWAY-DOMAIN.'}
function oauthLogin(e){if(e&&e.preventDefault)e.preventDefault();if(!API_CONFIGURED){showSetup();toast('رابط Railway غير مضبوط');return}window.location.assign(`${API}/auth/discord`)}

async function api(path,opt={}){
  if(!API_CONFIGURED) throw Object.assign(new Error('API_NOT_CONFIGURED'),{status:0});
  const h={'content-type':'application/json',...(opt.headers||{})};
  if(token)h.authorization=`Bearer ${token}`;
  const r=await fetch(API+path,{...opt,headers:h});
  const j=await r.json().catch(()=>({}));
  if(!r.ok)throw Object.assign(new Error(j.error||'ERROR'),{status:r.status,data:j});
  return j;
}
function consumeToken(){
  const h=new URLSearchParams(location.hash.slice(1));
  if(h.get('token')){token=h.get('token');localStorage.setItem('turbo_token',token);history.replaceState(null,'',location.pathname+location.search+'#home')}
}
function statusText(s){return({pending:'قيد المراجعة',pre_accepted:'مقبول مبدئيًا',voice_passed:'مقبول نهائيًا — تصريح الدخول',rejected:'مرفوض',reset:'مسموح بإعادة التقديم'})[s]||s}

async function init(){
  consumeToken();
  $('#menu').onclick=()=>$('#nav').classList.toggle('open');
  document.querySelectorAll('#nav a').forEach(a=>a.onclick=()=>$('#nav').classList.remove('open'));
  $('#loginBtn').href=`${API || 'https://botsturbo-production.up.railway.app'}/auth/discord`; $('#loginBtn').onclick=oauthLogin;
  $('#adminSecretBtn').onclick=openAdminPanel;
  $('#adminSecretBtn').classList.add('hidden');

  if(!API_CONFIGURED){
    showSetup();
    renderOffline();
    return;
  }
  try{
    pub=await api('/api/public');
    renderPublic();
  }catch(e){
    renderOffline('تعذر الاتصال بـ Railway. اتأكد إن البوت شغال وإن رابط Railway في config.js صحيح.');
    return;
  }

  if(token){
    try{me=await api('/api/me');renderMe()}
    catch{localStorage.removeItem('turbo_token');token='';renderApply();renderStatus()}
  }else{renderApply();renderStatus()}
}

function renderOffline(msg='الموقع جاهز، لكن رابط Railway لسه محتاج يتضاف في config.js.'){
  $('#applyState').textContent='الربط غير مكتمل';
  $('#aboutText').textContent='Turbo RP هو سيرفر رول بلاي عربي يهتم بالسيناريوهات وجودة التجربة وتفاعل اللاعبين.';
  $('#creatorGrid').innerHTML='<div class="notice">صناع المحتوى هيظهروا هنا بعد اتصال الموقع بالبوت.</div>';
  renderRules([]);
  $('#applyBox').innerHTML=`<div class="notice bad">${esc(msg)}</div><br><button class="discord-btn" onclick="oauthLogin()">تسجيل دخول Discord</button>`;
  $('#statusBox').innerHTML='<div class="notice">بعد تسجيل الدخول هتشوف حالة تقديمك هنا.</div>';
}

function renderPublic(){
  $('#aboutText').textContent=pub.settings.aboutText;
  renderRules(pub.settings.rules || []);
  $('#creatorGrid').innerHTML=pub.creators.length?pub.creators.map(c=>`<a class="creator" href="${esc(c.url)}" target="_blank" rel="noopener"><img src="${esc(c.image||'')}" alt="${esc(c.name)}"><div class="meta"><h3>${esc(c.name)}</h3>${c.isLive?'<span class="live">● LIVE</span>':'<span class="offline">OFFLINE</span>'}</div></a>`).join(''):'<div class="notice">هيتم إضافة صناع المحتوى من لوحة التحكم.</div>';
  $('#applyState').textContent=pub.settings.applicationsOpen?'التقديم مفتوح الآن':'التقديم مغلق حاليًا';
}
function renderMe(){
  $('#loginBtn').innerHTML=`<span class="discord-dot">◈</span><span>${esc(me.user.globalName||me.user.username)} • خروج</span>`;
  $('#loginBtn').onclick=()=>{localStorage.removeItem('turbo_token');location.reload()};
  const adminBtn=$('#adminSecretBtn');
  if(me?.isAdmin) adminBtn.classList.remove('hidden'); else adminBtn.classList.add('hidden');
  renderApply();renderStatus();
}
function renderApply(){
  const box=$('#applyBox');
  if(!token){box.innerHTML=`<div class="notice">سجّل دخول بحساب Discord الأول. الموقع هيعرف حسابك تلقائيًا ويربطه بالتقديم.</div><br><button class="discord-btn" onclick="oauthLogin()"><span class="discord-dot">◈</span><span>تسجيل الدخول بـ Discord</span></button>`;return}
  if(!pub.settings.applicationsOpen){box.innerHTML='<div class="notice bad">التقديم مغلق حاليًا من الإدارة.</div>';return}
  if(me&&!me.canApply){let extra='';if(me.latest?.status==='rejected'&&me.waitMs>0)extra=`<p>تقدر تقدم تاني بعد: <b id="countdown"></b></p>`;box.innerHTML=`<div class="notice">زر التقديم غير متاح لحسابك حاليًا. ${extra}</div>`;if(me.waitMs>0)countdown();return}
  box.innerHTML=`<form id="applyForm"><div class="form-grid"><div class="field"><label>الاسم الحقيقي ثنائي</label><input name="realName" required placeholder="الاسم الأول واسم العائلة"></div><div class="field"><label>العمر</label><input name="age" type="number" min="16" max="80" required placeholder="مثال: 21"></div><div class="field full"><label>قصة الشخصية</label><textarea name="story" minlength="120" required placeholder="اكتب قصة شخصيتك بنفسك... مين هي؟ جاية منين؟ وإيه هدفها في المدينة؟"></textarea></div></div><h3>أسئلة الرول بلاي</h3>${pub.questions.map((q,i)=>`<div class="question"><strong>${i+1}. ${esc(q)}</strong><textarea name="q${i}" required minlength="10" placeholder="اكتب إجابتك هنا..."></textarea></div>`).join('')}<br><button class="btn primary" type="submit">إرسال التقديم</button></form>`;
  $('#applyForm').onsubmit=submitApply;
}
async function submitApply(e){e.preventDefault();const f=new FormData(e.target);const body={realName:f.get('realName'),age:Number(f.get('age')),story:f.get('story'),answers:pub.questions.map((_,i)=>f.get('q'+i))};try{const j=await api('/api/applications',{method:'POST',body:JSON.stringify(body)});toast(`تم إرسال التقديم رقم #${j.application.number}`);me=await api('/api/me');renderMe();location.hash='status'}catch(e){toast(errorArabic(e.message))}}
function errorArabic(e){return({REAL_NAME_TWO_PARTS:'اكتب الاسم الحقيقي ثنائي.',INVALID_AGE:'العمر غير صحيح.',STORY_TOO_SHORT:'قصة الشخصية قصيرة جدًا.',ANSWERS_INCOMPLETE:'كمّل كل أسئلة الرول بلاي.',COOLDOWN:'لسه مدة الـ12 ساعة مخلصتش.',BLOCKED:'عندك تقديم قائم بالفعل.',CLOSED:'التقديم مغلق.',API_NOT_CONFIGURED:'رابط Railway مش متظبط.'})[e]||'حصل خطأ. جرّب تاني.'}
function countdown(){const end=Date.now()+me.waitMs;const tick=()=>{const el=$('#countdown');if(!el)return;const d=Math.max(0,end-Date.now()),h=Math.floor(d/3600000),m=Math.floor(d%3600000/60000),s=Math.floor(d%60000/1000);el.textContent=`${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;if(d<=0)setTimeout(()=>location.reload(),1000)};tick();setInterval(tick,1000)}
function renderStatus(){const box=$('#statusBox');if(!token){box.innerHTML='<div class="notice">سجّل دخول علشان تشوف حالة تقديمك.</div>';return}if(!me.latest){box.innerHTML='<div class="notice">لسه ما قدمتش. ابدأ من قسم التقديم.</div>';return}const a=me.latest;let x=`<div class="status-card"><span class="tag">تقديم #${a.number}</span><h3>${statusText(a.status)}</h3><div>الاسم: <b>${esc(a.realName)}</b></div>`;if(a.status==='pending')x+='<div class="notice">طلبك وصل لروم المراجعة ومستني قرار الإدارة.</div>';if(a.status==='rejected')x+=`<div class="notice bad"><b>سبب الرفض:</b><br>${esc(a.reason||'لم يتم تحديد سبب')}</div>`;if(a.status==='pre_accepted'){x+='<div class="notice good">تم قبولك مبدئيًا. الخطوة الجاية هي المقابلة الصوتية.</div>';if(me.booked)x+=`<div class="notice">موعدك المحجوز: <b>${new Date(me.booked.at).toLocaleString('ar-EG')}</b><br>${esc(me.booked.note||'')}</div>`;else x+=`<h3>اختار موعد المقابلة</h3><div class="list">${pub.interviewSlots.length?pub.interviewSlots.map(s=>`<div class="item"><span>${new Date(s.at).toLocaleString('ar-EG')}<br><small>${esc(s.note||'')}</small></span><button class="smallbtn" onclick="bookSlot('${s.id}')">حجز</button></div>`).join(''):'<div class="notice">لا توجد مواعيد متاحة حاليًا.</div>'}</div>`}if(a.status==='voice_passed')x+='<div class="notice good">✅ تم قبولك في المقابلة ومنحك رول تصريح الدخول.</div>';box.innerHTML=x+'</div>'}
window.bookSlot=async id=>{try{await api(`/api/interviews/${id}/book`,{method:'POST',body:'{}'});toast('تم حجز الموعد');me=await api('/api/me');pub=await api('/api/public');renderStatus()}catch{toast('الموعد غير متاح')}};

async function openAdminPanel(){
  if(!token){toast('سجّل دخول بحساب Discord الأول.');return;}
  if(!me?.isAdmin){toast('غير مصرح لك بفتح لوحة التحكم.');return;}
  try{
    $('#admin').classList.remove('hidden');
    await renderAdmin();
    location.hash='admin';
  }catch(e){
    toast(e?.status===403?'غير مصرح لك بفتح لوحة التحكم.':'تعذر فتح لوحة التحكم.');
  }
}
async function renderAdmin(){const st=await api('/api/admin/state');$('#adminBox').innerHTML=`<div class="admin-grid"><div class="card"><h3>التقديم</h3><p>الحالة: <b>${st.settings.applicationsOpen?'مفتوح':'مغلق'}</b></p><button class="${st.settings.applicationsOpen?'danger':'btn primary'}" onclick="toggleApps(${!st.settings.applicationsOpen})">${st.settings.applicationsOpen?'قفل التقديم':'فتح التقديم'}</button></div><div class="card"><h3>الطلبات</h3><div class="list">${[...st.applications].reverse().slice(0,20).map(a=>`<div class="item"><span>#${a.number} ${esc(a.realName)}<br><small>${statusText(a.status)} • ${a.discordId}</small></span><span>${a.status==='pre_accepted'?`<button class="smallbtn" onclick="voicePass('${a.discordId}')">نجح بالمقابلة</button>`:''} <button class="smallbtn" onclick="resetUser('${a.discordId}')">سماح بإعادة التقديم</button></span></div>`).join('')||'لا يوجد'}</div></div><div class="card"><h3>إضافة صانع محتوى</h3><form id="creatorForm" class="form-grid"><div class="field"><input name="name" placeholder="الاسم" required></div><div class="field"><input name="order" type="number" placeholder="الترتيب" value="1"></div><div class="field full"><input name="image" placeholder="لينك الصورة" required></div><div class="field full"><input name="url" placeholder="لينك الصفحة" required></div><div class="field"><select name="platform"><option value="youtube">YouTube</option><option value="twitch">Twitch</option><option value="other">Other</option></select></div><div class="field"><input name="platformId" placeholder="Channel ID / Twitch login"></div><button class="btn primary" type="submit">إضافة</button></form><div class="list">${st.creators.map(c=>`<div class="item"><span>${esc(c.name)} ${c.isLive?'🔴':''}</span><button class="danger" onclick="delCreator('${c.id}')">حذف</button></div>`).join('')}</div></div><div class="card"><h3>مواعيد المقابلات</h3><form id="slotForm"><div class="field"><input name="at" type="datetime-local" required></div><div class="field"><input name="note" placeholder="ملاحظة / روم المقابلة"></div><br><button class="btn primary" id="addSlotBtn" type="submit">إضافة موعد</button></form><div class="list">${st.interviewSlots.map(s=>`<div class="item"><span>${new Date(s.at).toLocaleString('ar-EG')} ${s.bookedBy?'• محجوز':''}</span>${!s.bookedBy?`<button class="danger" onclick="delSlot('${s.id}')">حذف</button>`:''}</div>`).join('')}</div></div></div>`;$('#creatorForm').onsubmit=addCreator;$('#slotForm').onsubmit=addSlot}
window.toggleApps=async v=>{await api('/api/admin/settings',{method:'PATCH',body:JSON.stringify({applicationsOpen:v})});pub=await api('/api/public');renderPublic();renderAdmin();toast(v?'تم فتح التقديم':'تم قفل التقديم')};
window.voicePass=async id=>{await api(`/api/admin/users/${id}/voice-pass`,{method:'POST',body:'{}'});toast('تم منح تصريح الدخول');renderAdmin()};
window.resetUser=async id=>{await api(`/api/admin/users/${id}/reset`,{method:'POST',body:'{}'});toast('تم السماح بإعادة التقديم');renderAdmin()};
async function addCreator(e){e.preventDefault();const f=Object.fromEntries(new FormData(e.target));f.order=Number(f.order||0);await api('/api/admin/creators',{method:'POST',body:JSON.stringify(f)});toast('تمت إضافة صانع المحتوى');renderAdmin();pub=await api('/api/public');renderPublic()}
window.delCreator=async id=>{await api(`/api/admin/creators/${id}`,{method:'DELETE'});renderAdmin();pub=await api('/api/public');renderPublic()};
async function addSlot(e){
  e.preventDefault();
  const form=e.target;
  const btn=form.querySelector('button[type="submit"],button');
  const raw=String(new FormData(form).get('at')||'').trim();
  const note=String(new FormData(form).get('note')||'').trim();
  if(!raw){toast('اختار تاريخ ووقت الموعد');return}
  const localDate=new Date(raw);
  if(Number.isNaN(localDate.getTime())){toast('التاريخ أو الوقت غير صحيح');return}
  if(localDate.getTime()<=Date.now()+60000){toast('اختار موعد بعد الوقت الحالي');return}
  const oldText=btn?.textContent||'إضافة موعد';
  if(btn){btn.disabled=true;btn.textContent='جاري الإضافة...'}
  try{
    await api('/api/admin/interviews',{method:'POST',body:JSON.stringify({at:localDate.toISOString(),note})});
    toast('✅ تمت إضافة الموعد');
    form.reset();
    await renderAdmin();
    pub=await api('/api/public');
    renderPublic();
  }catch(err){
    console.error('ADD_SLOT_FAILED',err);
    const map={INVALID_INTERVIEW_DATE:'التاريخ غير صالح أو الموعد في الماضي',ADMIN_ONLY:'الحساب الحالي غير مسموح له بإدارة المواعيد',LOGIN_REQUIRED:'سجل دخول Discord من جديد'};
    toast('❌ '+(map[err?.message]||`فشل إضافة الموعد: ${err?.message||'خطأ غير معروف'}`));
  }finally{
    if(btn){btn.disabled=false;btn.textContent=oldText}
  }
}
window.delSlot=async id=>{await api(`/api/admin/interviews/${id}`,{method:'DELETE'});renderAdmin();pub=await api('/api/public');renderPublic()};
window.oauthLogin=oauthLogin;
init();


// v8: 3D hero + robust drag-to-rules (mouse, touch, pointer, click, keyboard)
(function initTurboMotionV8(){
  const card=document.getElementById('turboTiltCard');
  if(card && window.matchMedia('(pointer:fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    let frame=0;
    const setTilt=(x,y)=>{const r=card.getBoundingClientRect();const px=Math.max(0,Math.min(1,(x-r.left)/r.width));const py=Math.max(0,Math.min(1,(y-r.top)/r.height));const ry=(px-.5)*9;const rx=(.5-py)*7;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{card.style.setProperty('--rx',rx.toFixed(2)+'deg');card.style.setProperty('--ry',ry.toFixed(2)+'deg');card.style.setProperty('--mx',(px*100).toFixed(1)+'%');card.style.setProperty('--my',(py*100).toFixed(1)+'%')})};
    card.addEventListener('pointerenter',()=>card.classList.add('tilting'));
    card.addEventListener('pointermove',e=>setTilt(e.clientX,e.clientY));
    card.addEventListener('pointerleave',()=>{card.classList.remove('tilting');card.style.setProperty('--rx','0deg');card.style.setProperty('--ry','0deg');card.style.setProperty('--mx','50%');card.style.setProperty('--my','50%')});
  }

  const track=document.getElementById('rulesDragTrack');
  const thumb=document.getElementById('rulesDragThumb');
  if(!track||!thumb)return;
  let dragging=false,startX=0,startDrag=0,current=0,max=0,pointerId=null;
  const recalc=()=>{max=Math.max(0,track.clientWidth-thumb.offsetWidth-18)};
  const setDrag=v=>{recalc();current=Math.max(0,Math.min(max,v));track.style.setProperty('--drag',current+'px');track.setAttribute('aria-valuenow',String(max?Math.round(current/max*100):0))};
  const openRules=()=>{current=max;track.style.setProperty('--drag',max+'px');track.setAttribute('aria-valuenow','100');track.classList.add('completed');if(navigator.vibrate)navigator.vibrate(25);setTimeout(()=>{window.__turboUnlockRules?.();location.hash='rules';document.getElementById('rules')?.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>{track.classList.remove('completed');setDrag(0)},950)},180)};
  const finish=()=>{if(!dragging)return;dragging=false;track.classList.remove('dragging');recalc();if(max&&current/max>=.72)openRules();else setDrag(0)};
  const begin=(clientX,id)=>{recalc();dragging=true;pointerId=id??null;track.classList.add('dragging');startX=clientX;startDrag=current};

  thumb.addEventListener('pointerdown',e=>{if(e.button!==undefined&&e.button!==0)return;begin(e.clientX,e.pointerId);thumb.setPointerCapture?.(e.pointerId);e.preventDefault()});
  track.addEventListener('pointerdown',e=>{if(thumb===e.target||thumb.contains(e.target))return;if(e.button!==undefined&&e.button!==0)return;const r=track.getBoundingClientRect();setDrag(e.clientX-r.left-thumb.offsetWidth/2);begin(e.clientX,e.pointerId);track.setPointerCapture?.(e.pointerId);e.preventDefault()});
  window.addEventListener('pointermove',e=>{if(dragging)setDrag(startDrag+(e.clientX-startX))});
  window.addEventListener('pointerup',finish);window.addEventListener('pointercancel',finish);

  // Legacy mouse/touch fallback for browsers or cached environments with partial PointerEvent support.
  thumb.addEventListener('mousedown',e=>{if(window.PointerEvent)return;begin(e.clientX,null);e.preventDefault()});
  window.addEventListener('mousemove',e=>{if(dragging&&!window.PointerEvent)setDrag(startDrag+(e.clientX-startX))});
  window.addEventListener('mouseup',()=>{if(!window.PointerEvent)finish()});
  thumb.addEventListener('touchstart',e=>{if(window.PointerEvent)return;const t=e.touches[0];begin(t.clientX,null);e.preventDefault()},{passive:false});
  window.addEventListener('touchmove',e=>{if(dragging&&!window.PointerEvent){setDrag(startDrag+(e.touches[0].clientX-startX));e.preventDefault()}},{passive:false});
  window.addEventListener('touchend',()=>{if(!window.PointerEvent)finish()});

  track.addEventListener('dblclick',openRules);
  track.addEventListener('keydown',e=>{recalc();if(e.key==='ArrowRight'){setDrag(current+Math.max(28,max*.12));e.preventDefault()}if(e.key==='ArrowLeft'){setDrag(current-Math.max(28,max*.12));e.preventDefault()}if(e.key==='Enter'||e.key===' '){openRules();e.preventDefault()}});
  window.addEventListener('resize',()=>setDrag(Math.min(current,max)));
  requestAnimationFrame(()=>setDrag(0));
})();

// v9: scroll-driven reveal + rules remain hidden until the drag is completed.
(function initTurboRevealV9(){
  const rules=document.getElementById('rules');
  const launcher=document.getElementById('rulesDragLauncher');
  let unlocked=false;

  function unlockRules(){
    if(unlocked) return;
    unlocked=true;
    if(rules){
      rules.classList.remove('rules-locked');
      rules.classList.add('rules-unlocked','reveal-section');
      rules.setAttribute('aria-hidden','false');
      requestAnimationFrame(()=>rules.classList.add('is-visible'));
    }
  }
  window.__turboUnlockRules=unlockRules;

  // A direct click on "القوانين" in navigation brings the user to the gateway until it is unlocked.
  document.querySelectorAll('a[href="#rules"]').forEach(a=>a.addEventListener('click',e=>{
    if(unlocked) return;
    e.preventDefault();
    launcher?.scrollIntoView({behavior:'smooth',block:'center'});
    launcher?.classList.add('is-near');
    setTimeout(()=>launcher?.classList.remove('is-near'),1800);
  }));

  const selector='.reveal-section,.section-head,.about-grid>.card,.creator,.rule-group,.form-shell,.rules-gateway';
  const getTargets=()=>[...document.querySelectorAll(selector)].filter(el=>!el.closest('#rules.rules-locked'));
  if('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    const io=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target)}
      });
    },{rootMargin:'0px 0px -8% 0px',threshold:.08});
    getTargets().forEach(el=>io.observe(el));

    if(launcher){
      const near=new IntersectionObserver(entries=>entries.forEach(e=>launcher.classList.toggle('is-near',e.isIntersecting)),{rootMargin:'-20% 0px -20% 0px',threshold:.15});
      near.observe(launcher);
    }

    // dynamic cards/rules added after API responses
    const mo=new MutationObserver(()=>getTargets().forEach(el=>{if(!el.classList.contains('is-visible'))io.observe(el)}));
    mo.observe(document.body,{childList:true,subtree:true});
  }else getTargets().forEach(el=>el.classList.add('is-visible'));
})();
